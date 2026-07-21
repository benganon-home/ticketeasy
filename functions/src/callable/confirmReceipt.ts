/**
 * confirmReceipt — buyer confirms the ticket is valid (revealed -> released).
 * Releases escrow to the seller and bumps reputation counters. Real payout to
 * the seller is triggered here in Phase 3 (PSP split/transfer).
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, FieldValue } from '../lib/db.js';
import { assertAuth, assertAppCheck } from '../lib/guards.js';
import { transitionTxn } from '../lib/txn.js';

export const confirmReceipt = onCall({ region: 'me-west1' }, async (req) => {
  assertAppCheck(req);
  const uid = assertAuth(req);
  const txnId = req.data?.txnId;
  if (typeof txnId !== 'string' || !txnId) {
    throw new HttpsError('invalid-argument', 'txnId חסר.');
  }

  const snap = await db.doc(`transactions/${txnId}`).get();
  if (!snap.exists) throw new HttpsError('not-found', 'העסקה לא נמצאה.');
  const txn = snap.data()!;
  if (txn.buyerId !== uid) throw new HttpsError('permission-denied', 'אין הרשאה לעסקה זו.');

  const updated = await transitionTxn({
    txnId,
    to: 'released',
    actor: 'buyer',
    actorUid: uid,
    action: 'transaction.release',
    extraUpdate: { releasedAt: Date.now() },
  });

  // Server-authoritative reputation counters.
  await Promise.all([
    db.doc(`users/${txn.sellerId}`).set({ salesCount: FieldValue.increment(1) }, { merge: true }),
    db.doc(`users/${txn.buyerId}`).set({ purchasesCount: FieldValue.increment(1) }, { merge: true }),
  ]);

  // TODO(Phase 3): trigger PSP payout to seller for txn.price.
  return { status: updated.status };
});
