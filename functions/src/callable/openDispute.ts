/**
 * openDispute — buyer opens a dispute (paid|revealed -> disputed), freezing
 * the transaction until an admin resolves it. Persists a disputes/{id} doc.
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, FieldValue } from '../lib/db.js';
import { assertAuth, assertAppCheck } from '../lib/guards.js';
import { transitionTxn } from '../lib/txn.js';

const MAX_REASON = 2000;

export const openDispute = onCall({ region: 'me-west1' }, async (req) => {
  assertAppCheck(req);
  const uid = assertAuth(req);
  const txnId = req.data?.txnId;
  const reason = req.data?.reason;
  if (typeof txnId !== 'string' || !txnId) {
    throw new HttpsError('invalid-argument', 'txnId חסר.');
  }
  if (typeof reason !== 'string' || reason.trim().length === 0 || reason.length > MAX_REASON) {
    throw new HttpsError('invalid-argument', 'יש לפרט את סיבת המחלוקת.');
  }

  const snap = await db.doc(`transactions/${txnId}`).get();
  if (!snap.exists) throw new HttpsError('not-found', 'העסקה לא נמצאה.');
  const txn = snap.data()!;
  if (txn.buyerId !== uid) throw new HttpsError('permission-denied', 'אין הרשאה לעסקה זו.');

  await transitionTxn({
    txnId,
    to: 'disputed',
    actor: 'buyer',
    actorUid: uid,
    action: 'transaction.dispute',
    detail: { reason },
  });

  const disputeRef = db.collection('disputes').doc();
  await disputeRef.set({
    txnId,
    buyerId: txn.buyerId,
    sellerId: txn.sellerId,
    reason,
    status: 'open',
    createdAt: FieldValue.serverTimestamp(),
  });

  return { disputeId: disputeRef.id, status: 'disputed' };
});
