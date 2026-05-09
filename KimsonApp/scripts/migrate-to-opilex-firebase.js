import { createRequire } from 'module';
import path from 'path';

const require = createRequire(import.meta.url);
const admin = require('firebase-admin');

const requiredEnv = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const normalizePhone = (phoneNumber) => {
  if (!phoneNumber) return null;
  const digits = String(phoneNumber).replace(/\D/g, '');
  if (digits.length < 10) return null;
  return `+91${digits.slice(-10)}`;
};

const initApp = (name, credentialPath, storageBucket) => {
  const credential = admin.credential.cert(require(path.resolve(credentialPath)));
  return admin.initializeApp({ credential, storageBucket }, name);
};

const sourceApp = initApp(
  'source',
  requiredEnv('SOURCE_GOOGLE_APPLICATION_CREDENTIALS'),
  requiredEnv('SOURCE_STORAGE_BUCKET')
);
const targetApp = initApp(
  'target',
  requiredEnv('TARGET_GOOGLE_APPLICATION_CREDENTIALS'),
  requiredEnv('TARGET_STORAGE_BUCKET')
);

const sourceDb = sourceApp.firestore();
const targetDb = targetApp.firestore();
const sourceBucket = sourceApp.storage().bucket();
const targetBucket = targetApp.storage().bucket();

const copyDocumentTree = async (sourceRef, targetRef, counters) => {
  const snapshot = await sourceRef.get();
  if (!snapshot.exists) return;

  await targetRef.set(snapshot.data(), { merge: true });
  counters.documents += 1;

  if (sourceRef.path.startsWith('users/')) {
    const normalizedPhone = normalizePhone(snapshot.get('phoneNumber'));
    if (normalizedPhone) {
      await targetDb.collection('legacyClaims').doc(normalizedPhone).set(
        {
          phoneNumber: normalizedPhone,
          oldUid: sourceRef.id,
          profile: {
            name: snapshot.get('name') || null,
            userType: snapshot.get('userType') || null,
            city: snapshot.get('city') || null,
            state: snapshot.get('state') || null,
          },
          claimed: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      counters.legacyClaims += 1;
    }
  }

  const subcollections = await sourceRef.listCollections();
  for (const subcollection of subcollections) {
    const docs = await subcollection.listDocuments();
    for (const childDoc of docs) {
      await copyDocumentTree(childDoc, targetRef.collection(subcollection.id).doc(childDoc.id), counters);
    }
  }
};

const copyFirestore = async () => {
  const counters = { collections: 0, documents: 0, legacyClaims: 0 };
  const collections = await sourceDb.listCollections();

  for (const sourceCollection of collections) {
    counters.collections += 1;
    const docs = await sourceCollection.listDocuments();
    for (const sourceDoc of docs) {
      await copyDocumentTree(sourceDoc, targetDb.collection(sourceCollection.id).doc(sourceDoc.id), counters);
    }
    console.log(`Copied collection ${sourceCollection.id} (${docs.length} root docs)`);
  }

  const firstAdminUid = process.env.OPILEX_FIRST_ADMIN_UID;
  if (firstAdminUid) {
    await targetDb.collection('admins').doc(firstAdminUid).set(
      {
        role: 'super_admin',
        migratedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    console.log(`Seeded first Opilex admin: ${firstAdminUid}`);
  }

  return counters;
};

const copyStorage = async () => {
  const [files] = await sourceBucket.getFiles({ autoPaginate: true });
  let copied = 0;

  for (const file of files) {
    const [contents] = await file.download();
    const metadata = file.metadata || {};
    await targetBucket.file(file.name).save(contents, {
      resumable: false,
      metadata: {
        contentType: metadata.contentType,
        cacheControl: metadata.cacheControl,
        contentDisposition: metadata.contentDisposition,
        metadata: metadata.metadata,
      },
    });
    copied += 1;
    if (copied % 100 === 0) console.log(`Copied ${copied}/${files.length} storage files`);
  }

  return copied;
};

const main = async () => {
  console.log('Starting Opilex Firebase migration');
  const firestoreCounters = await copyFirestore();
  const storageFiles = await copyStorage();
  console.log('Migration complete');
  console.log(JSON.stringify({ firestore: firestoreCounters, storageFiles }, null, 2));
};

main()
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.all(admin.apps.map((app) => app.delete()));
  });
