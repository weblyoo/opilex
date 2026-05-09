/**
 * Shared scan parsing and processing for Authenticate Product and Scan Rewards screens.
 * parseScannedCode: sync parse to detect wire vs reward.
 * processWireAuth / processRewardQR: run wire or reward flow and call onSuccess/onError.
 */

export type ScanType = 'wire' | 'reward' | 'unknown';

export interface ParsedScan {
  type: ScanType;
  rawCode: string;
  wireData?: { code: string; points: number; wireInfo: string; wireData: any } | null;
  rewardData?: { type: string; rewardId: string; points?: number; description?: string; userType?: string; productName?: string } | null;
}

export function parseScannedCode(code: string): ParsedScan {
  const cleanCode = code.trim();
  let parsedData: any = null;
  let isJSON = false;

  try {
    parsedData = JSON.parse(cleanCode);
    isJSON = true;
  } catch {
    try {
      const cleaned = cleanCode
        .replace(/^\uFEFF/, '')
        .replace(/^[\s\u200B-\u200D\uFEFF]+|[\s\u200B-\u200D\uFEFF]+$/g, '')
        .replace(/[\r\n]+/g, '')
        .trim();
      if (cleaned !== cleanCode) {
        parsedData = JSON.parse(cleaned);
        isJSON = true;
      }
    } catch {
      // not JSON
    }
  }

  if (isJSON && parsedData) {
    if (parsedData.type === 'opilex_reward' && parsedData.rewardId) {
      return {
        type: 'reward',
        rawCode: cleanCode,
        rewardData: {
          type: 'opilex_reward',
          rewardId: parsedData.rewardId,
          points: parsedData.points,
          description: parsedData.description,
          userType: parsedData.userType,
          productName: parsedData.productName,
        },
      };
    }
    if (parsedData.productId && parsedData.rewardPoints != null) {
      let points = Number(parsedData.rewardPoints) || 0;
      if (parsedData.bonus) points += Number(parsedData.bonus);
      const wireInfo = `${parsedData.wireType || 'Wire'} - ${parsedData.length || 'N/A'}`;
      return {
        type: 'wire',
        rawCode: cleanCode,
        wireData: {
          code: cleanCode,
          points,
          wireInfo,
          wireData: parsedData,
        },
      };
    }
  }

  if (cleanCode.startsWith('OPILEX_') && cleanCode.length >= 10) {
    return {
      type: 'wire',
      rawCode: cleanCode,
      wireData: {
        code: cleanCode,
        points: 50,
        wireInfo: 'Opilex Copper Wire',
        wireData: null,
      },
    };
  }

  return { type: 'unknown', rawCode: cleanCode };
}

export interface ScanCallbacks {
  refreshUser: () => Promise<void>;
  onSuccess: (title: string, message: string) => void;
  onError: (title: string, message: string) => void;
}

export async function processWireAuth(
  code: string,
  points: number,
  wireInfo: string,
  wireData: any,
  userId: string,
  callbacks: ScanCallbacks
): Promise<void> {
  const { refreshUser, onSuccess, onError } = callbacks;
  if (wireData?.alreadyScanned) {
    onError('Already Used', 'This wire has already been scanned.');
    return;
  }
  if (wireData?.expired) {
    onError('Expired', 'This wire has expired.');
    return;
  }
  if (wireData?.error || (wireData && wireData.verified === false)) {
    onError('Invalid Wire', 'Invalid or unverified wire.');
    return;
  }
  try {
    const { wireAuthService } = await import('./firestore');
    const authResult = await wireAuthService.authenticateWire(userId, code);
    await refreshUser();
    await new Promise((r) => setTimeout(r, 400));
    await refreshUser();
    const bonusText = wireData?.bonus ? `\n• Bonus: ${wireData.bonus} pts` : '';
    const promoText = wireData?.promotion ? `\n• Promotion: ${wireData.promotion}` : '';
    onSuccess(
      'Authentic Wire Verified!',
      `You've earned ${points} reward points.\n\n• Product: ${wireInfo}\n• Batch: ${wireData?.batchId || code.split('_')[2] || 'N/A'}${bonusText}${promoText}\n\nCheck Rewards for your new balance.`
    );
  } catch (e: any) {
    let msg = e?.message || 'Verification failed.';
    let title = 'Verification Failed';
    if (msg.includes('already been scanned')) {
      title = 'Already Used';
      msg = 'This wire has already been scanned.';
    } else if (msg.includes('expired')) {
      title = 'Expired';
      msg = 'This wire has expired.';
    } else if (msg.includes('Invalid') || msg.includes('unverified')) {
      title = 'Invalid Wire';
      msg = 'Invalid or unverified wire. Please check the QR code.';
    }
    onError(title, msg);
  }
}

export async function processRewardQR(
  rewardData: { rewardId: string; points?: number; description?: string; userType?: string; productName?: string },
  userId: string,
  callbacks: ScanCallbacks
): Promise<void> {
  const { refreshUser, onSuccess, onError } = callbacks;
  const { collection, query, where, getDocs, updateDoc, doc, Timestamp, getDoc } = await import('firebase/firestore');
  const { db } = await import('../config/firebase');
  const { rewardService, userService } = await import('./firestore');

  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      onError('Error', 'User data not found. Please log in again.');
      return;
    }
    const latestUserType = (userDoc.data().userType || '').toLowerCase().trim();
    await refreshUser();

    const rewardQRQuery = query(
      collection(db, 'rewardQRCodes'),
      where('rewardId', '==', rewardData.rewardId)
    );
    const rewardSnapshot = await getDocs(rewardQRQuery);
    if (rewardSnapshot.empty) {
      onError('Invalid QR', 'Reward QR code not found in system.');
      return;
    }

    const rewardDoc = rewardSnapshot.docs[0];
    const dbRewardData = rewardDoc.data();
    if (dbRewardData.used) {
      const usedAt = dbRewardData.usedAt?.toDate?.() ?? dbRewardData.usedAt;
      const dateStr = usedAt ? new Date(usedAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'a previous date';
      onSuccess('Already Used', `This QR was used on ${dateStr}. No points added.`);
      return;
    }

    const qrUserType = (rewardData.userType || dbRewardData.userType || '').toLowerCase().trim();
    if (qrUserType && latestUserType && qrUserType !== latestUserType) {
      const qrLabel = qrUserType === 'electrician' ? 'Electrician' : 'Dealer';
      const userLabel = latestUserType === 'electrician' ? 'Electrician' : 'Dealer';
      onError('Wrong QR Type', `This QR is for ${qrLabel} only. You are registered as ${userLabel}.`);
      return;
    }

    await updateDoc(doc(db, 'rewardQRCodes', rewardDoc.id), {
      used: true,
      usedBy: userId,
      usedAt: Timestamp.now(),
    });

    const pointsToAdd = rewardData.points ?? dbRewardData.points ?? 0;
    const description = rewardData.description || dbRewardData.description || 'Reward QR Code';
    const productName = rewardData.productName || dbRewardData.productName || description;
    await rewardService.createReward(userId, pointsToAdd, 'bonus', description, productName);
    await userService.updateUserPoints(userId, pointsToAdd);
    await refreshUser();
    await new Promise((r) => setTimeout(r, 500));
    await refreshUser();

    onSuccess(
      'Rewards Added!',
      `You received ${pointsToAdd} points!\n\n${description}\n\nCheck your Rewards balance.`
    );
  } catch (e: any) {
    onError('Error', e?.message || 'Failed to process reward QR.');
  }
}

/** Look up reward by raw code (rewardId string). Returns rewardData for processRewardQR or null. */
export async function lookupRewardByCode(rawCode: string): Promise<{ rewardId: string; points?: number; description?: string; userType?: string; productName?: string } | null> {
  const { collection, query, where, getDocs } = await import('firebase/firestore');
  const { db } = await import('../config/firebase');
  const q = query(collection(db, 'rewardQRCodes'), where('rewardId', '==', rawCode.trim()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0].data();
  return {
    rewardId: d.rewardId,
    points: d.points,
    description: d.description,
    userType: d.userType,
    productName: d.productName,
  };
}

/**
 * Product verification only: same reward QR codes can be scanned here to verify product is genuine.
 * Does NOT add points or mark the code as used. Use "Scan Rewards" to claim points.
 */
export interface VerifyProductResult {
  verified: boolean;
  used?: boolean;
  usedAt?: Date;
  productName?: string;
}

export async function verifyRewardQRForProductVerification(
  rewardId: string,
  onResult: (result: VerifyProductResult) => void
): Promise<void> {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const { db } = await import('../config/firebase');
    const q = query(collection(db, 'rewardQRCodes'), where('rewardId', '==', rewardId.trim()));
    const snap = await getDocs(q);
    if (snap.empty) {
      onResult({ verified: false });
      return;
    }
    const d = snap.docs[0].data();
    const used = !!d.used;
    const usedAt = d.usedAt?.toDate?.() ?? (d.usedAt ? new Date(d.usedAt) : undefined);
    const productName = d.productName || d.description || 'Opilex product';
    onResult({ verified: true, used, usedAt, productName });
  } catch {
    onResult({ verified: false });
  }
}
