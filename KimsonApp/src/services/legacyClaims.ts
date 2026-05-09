import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const USER_ID_COLLECTIONS = [
  'rewards',
  'transactions',
  'wireAuthentications',
  'bankAccounts',
  'schemeJoins',
  'scratchRewards',
];

type ClaimResult = {
  claimed: boolean;
  oldUid?: string;
  updatedRecords: number;
};

export const normalizePhoneForLegacyClaim = (phoneNumber?: string | null): string | null => {
  if (!phoneNumber) return null;
  const digits = phoneNumber.replace(/\D/g, '');
  if (digits.length < 10) return null;
  return `+91${digits.slice(-10)}`;
};

const commitInChunks = async (
  updates: Array<{
    refPath: string;
    data: Record<string, unknown>;
  }>
) => {
  if (!db) return 0;

  let updated = 0;
  for (let index = 0; index < updates.length; index += 450) {
    const chunk = updates.slice(index, index + 450);
    const batch = writeBatch(db);
    chunk.forEach((item) => {
      batch.update(doc(db!, item.refPath), item.data);
    });
    await batch.commit();
    updated += chunk.length;
  }
  return updated;
};

export const claimLegacyDataForPhone = async (
  newUid: string,
  phoneNumber?: string | null
): Promise<ClaimResult> => {
  if (!db) return { claimed: false, updatedRecords: 0 };

  const normalizedPhone = normalizePhoneForLegacyClaim(phoneNumber);
  if (!normalizedPhone) return { claimed: false, updatedRecords: 0 };

  const claimRef = doc(db, 'legacyClaims', normalizedPhone);
  const claimSnap = await getDoc(claimRef);
  if (!claimSnap.exists()) return { claimed: false, updatedRecords: 0 };

  const claimData = claimSnap.data();
  if (claimData.claimed === true || claimData.claimedBy) {
    return { claimed: false, oldUid: claimData.oldUid, updatedRecords: 0 };
  }

  const oldUid = claimData.oldUid as string | undefined;
  if (!oldUid || oldUid === newUid) {
    await updateDoc(claimRef, {
      claimed: true,
      claimedBy: newUid,
      claimedAt: serverTimestamp(),
      skippedReason: oldUid === newUid ? 'same_uid' : 'missing_old_uid',
    });
    return { claimed: false, oldUid, updatedRecords: 0 };
  }

  const userSnap = await getDoc(doc(db, 'users', oldUid));
  if (userSnap.exists()) {
    const legacyUser = userSnap.data();
    await setDoc(
      doc(db, 'users', newUid),
      {
        ...legacyUser,
        id: newUid,
        phoneNumber: normalizedPhone,
        legacyUid: oldUid,
        legacyClaimedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }

  const updates: Array<{ refPath: string; data: Record<string, unknown> }> = [];

  for (const collectionName of USER_ID_COLLECTIONS) {
    const snapshot = await getDocs(query(collection(db, collectionName), where('userId', '==', oldUid)));
    snapshot.forEach((record) => {
      updates.push({
        refPath: `${collectionName}/${record.id}`,
        data: {
          userId: newUid,
          legacyUid: oldUid,
          legacyClaimedAt: serverTimestamp(),
        },
      });
    });
  }

  const usedQrCodes = await getDocs(query(collection(db, 'rewardQRCodes'), where('usedBy', '==', oldUid)));
  usedQrCodes.forEach((record) => {
    updates.push({
      refPath: `rewardQRCodes/${record.id}`,
      data: {
        usedBy: newUid,
        legacyUid: oldUid,
        legacyClaimedAt: serverTimestamp(),
      },
    });
  });

  const updatedRecords = await commitInChunks(updates);

  await updateDoc(claimRef, {
    claimed: true,
    claimedBy: newUid,
    claimedAt: serverTimestamp(),
    updatedRecords,
  });

  return { claimed: true, oldUid, updatedRecords };
};
