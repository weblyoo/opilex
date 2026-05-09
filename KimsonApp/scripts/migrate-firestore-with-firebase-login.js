import { execSync } from 'child_process';
import fs from 'fs';

const SOURCE_PROJECT = process.env.SOURCE_PROJECT || 'kimson-3373e';
const TARGET_PROJECT = process.env.TARGET_PROJECT || 'opilex-2a79f';
const AUTH_EXPORT_PATH = process.env.AUTH_EXPORT_PATH || 'C:/tmp/kimson-auth-export.json';
const DATABASE = '(default)';
const PAGE_SIZE = 300;
const COMMIT_SIZE = 400;

const getAccessToken = () => {
  const firebaseCli = process.env.FIREBASE_CLI || (process.platform === 'win32' ? 'firebase.cmd' : 'firebase');
  const output = execSync(`${firebaseCli} login:list --json`, { encoding: 'utf8' });
  const parsed = JSON.parse(output);
  const token = parsed?.result?.[0]?.tokens?.access_token;
  if (!token) throw new Error('Firebase CLI access token not found. Run firebase login first.');
  return token;
};

const token = getAccessToken();

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${JSON.stringify(body)}`);
  }
  return body;
};

const dbRoot = (projectId) =>
  `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${DATABASE}/documents`;

const documentUrl = (projectId, documentPath = '') =>
  `${dbRoot(projectId)}${documentPath ? `/${documentPath.split('/').map(encodeURIComponent).join('/')}` : ''}`;

const documentName = (projectId, documentPath) =>
  `projects/${projectId}/databases/${DATABASE}/documents/${documentPath}`;

const listCollectionIds = async (projectId, documentPath = '') => {
  const url = documentPath
    ? `https://firestore.googleapis.com/v1/${documentName(projectId, documentPath).split('/').map((part, index) => index < 5 ? part : encodeURIComponent(part)).join('/')}:listCollectionIds`
    : `${dbRoot(projectId)}:listCollectionIds`;
  const ids = [];
  let pageToken;
  do {
    const body = await request(url, {
      method: 'POST',
      body: JSON.stringify({ pageSize: PAGE_SIZE, pageToken }),
    });
    ids.push(...(body.collectionIds || []));
    pageToken = body.nextPageToken;
  } while (pageToken);
  return ids;
};

const listDocuments = async (projectId, collectionPath) => {
  const docs = [];
  let pageToken;
  do {
    const separator = collectionPath.includes('?') ? '&' : '?';
    const url = `${documentUrl(projectId, collectionPath)}${separator}pageSize=${PAGE_SIZE}${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`;
    const body = await request(url);
    docs.push(...(body.documents || []));
    pageToken = body.nextPageToken;
  } while (pageToken);
  return docs;
};

const sourcePathFromName = (name) => {
  const marker = `/databases/${DATABASE}/documents/`;
  const index = name.indexOf(marker);
  if (index < 0) throw new Error(`Invalid Firestore document name: ${name}`);
  return name.slice(index + marker.length);
};

const loadAuthPhones = () => {
  if (!fs.existsSync(AUTH_EXPORT_PATH)) return new Map();
  const data = JSON.parse(fs.readFileSync(AUTH_EXPORT_PATH, 'utf8'));
  const users = Array.isArray(data.users) ? data.users : Array.isArray(data) ? data : [];
  const map = new Map();
  for (const user of users) {
    if (user.localId && user.phoneNumber) {
      map.set(user.localId, normalizePhone(user.phoneNumber));
    }
  }
  return map;
};

const normalizePhone = (phoneNumber) => {
  if (!phoneNumber) return null;
  const digits = String(phoneNumber).replace(/\D/g, '');
  if (digits.length < 10) return null;
  return `+91${digits.slice(-10)}`;
};

const stringField = (fields, key) => fields?.[key]?.stringValue || null;

const jsValueToFirestore = (value) => {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(jsValueToFirestore) } };
  return {
    mapValue: {
      fields: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, jsValueToFirestore(item)])),
    },
  };
};

const commitWrites = async (writes) => {
  if (!writes.length) return;
  for (let index = 0; index < writes.length; index += COMMIT_SIZE) {
    const chunk = writes.slice(index, index + COMMIT_SIZE);
    await request(`${dbRoot(TARGET_PROJECT)}:commit`, {
      method: 'POST',
      body: JSON.stringify({ writes: chunk }),
    });
  }
};

const counters = {
  documents: 0,
  collections: 0,
  legacyClaims: 0,
};

const authPhones = loadAuthPhones();
const pendingWrites = [];
const legacyClaimPhones = new Set();

const copyCollection = async (collectionPath) => {
  counters.collections += 1;
  const docs = await listDocuments(SOURCE_PROJECT, collectionPath);
  console.log(`Copying ${collectionPath}: ${docs.length} docs`);

  for (const sourceDoc of docs) {
    const docPath = sourcePathFromName(sourceDoc.name);
    pendingWrites.push({
      update: {
        name: documentName(TARGET_PROJECT, docPath),
        fields: sourceDoc.fields || {},
      },
    });
    counters.documents += 1;

    if (docPath.startsWith('users/')) {
      const oldUid = docPath.split('/')[1];
      const normalizedPhone = normalizePhone(stringField(sourceDoc.fields, 'phoneNumber')) || authPhones.get(oldUid);
      if (normalizedPhone && !legacyClaimPhones.has(normalizedPhone)) {
        legacyClaimPhones.add(normalizedPhone);
        pendingWrites.push({
          update: {
            name: documentName(TARGET_PROJECT, `legacyClaims/${normalizedPhone}`),
            fields: {
              phoneNumber: jsValueToFirestore(normalizedPhone),
              oldUid: jsValueToFirestore(oldUid),
              claimed: jsValueToFirestore(false),
              createdAt: { timestampValue: new Date().toISOString() },
              profile: jsValueToFirestore({
                name: stringField(sourceDoc.fields, 'name'),
                userType: stringField(sourceDoc.fields, 'userType'),
                city: stringField(sourceDoc.fields, 'city'),
                state: stringField(sourceDoc.fields, 'state'),
              }),
            },
          },
        });
        counters.legacyClaims += 1;
      }
    }

    const subcollections = await listCollectionIds(SOURCE_PROJECT, docPath);
    for (const subcollectionId of subcollections) {
      await copyCollection(`${docPath}/${subcollectionId}`);
    }
  }

  if (pendingWrites.length >= COMMIT_SIZE) {
    await commitWrites(pendingWrites.splice(0));
  }
};

const main = async () => {
  console.log(`Migrating Firestore ${SOURCE_PROJECT} -> ${TARGET_PROJECT}`);
  const rootCollections = await listCollectionIds(SOURCE_PROJECT);
  for (const collectionId of rootCollections) {
    await copyCollection(collectionId);
  }
  await commitWrites(pendingWrites.splice(0));
  console.log(JSON.stringify(counters, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
