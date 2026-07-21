/**
 * rateUser — one rating per completed transaction per side. Recomputes the
 * ratee's running average server-side. Only allowed after a terminal txn.
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, FieldValue } from '../lib/db.js';
import { assertAuth, assertAppCheck } from '../lib/guards.js';
import { isTerminal, type TxnStatus } from '../lib/escrow.js';

export const rateUser = onCall({ region: 'me-west1' }, async (req) => {
  assertAppCheck(req);
  const uid = assertAuth(req);
  const { txnId, stars } = req.data ?? {};
  if (typeof txnId !== 'string' || !txnId) {
    throw new HttpsError('invalid-argument', 'txnId חסר.');
  }
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    throw new HttpsError('invalid-argument', 'דירוג חייב להיות בין 1 ל-5.');
  }

  await db.runTransaction(async (t) => {
    const txnSnap = await t.get(db.doc(`transactions/${txnId}`));
    if (!txnSnap.exists) throw new HttpsError('not-found', 'העסקה לא נמצאה.');
    const txn = txnSnap.data()!;
    if (!isTerminal(txn.status as TxnStatus)) {
      throw new HttpsError('failed-precondition', 'ניתן לדרג רק לאחר סיום העסקה.');
    }

    const isBuyer = txn.buyerId === uid;
    const isSeller = txn.sellerId === uid;
    if (!isBuyer && !isSeller) throw new HttpsError('permission-denied', 'אין הרשאה לעסקה זו.');

    const rateeId = isBuyer ? txn.sellerId : txn.buyerId;
    const side = isBuyer ? 'buyerRated' : 'sellerRated';
    if (txn[side]) throw new HttpsError('already-exists', 'כבר דירגת עסקה זו.');

    const rateeRef = db.doc(`users/${rateeId}`);
    const rateeSnap = await t.get(rateeRef);
    const cur = rateeSnap.data() ?? {};
    const count = Number(cur.ratingCount) || 0;
    const avg = Number(cur.rating) || 0;
    const newCount = count + 1;
    const newAvg = (avg * count + stars) / newCount;

    t.set(rateeRef, { rating: newAvg, ratingCount: newCount }, { merge: true });
    t.update(db.doc(`transactions/${txnId}`), { [side]: stars, updatedAt: FieldValue.serverTimestamp() });
  });

  return { ok: true };
});
