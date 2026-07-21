/**
 * pspWebhook — the ONLY path from `created` to `paid`. Verifies the PSP
 * signature, matches the charged amount against our server-computed total,
 * and is idempotent (a replayed webhook is a no-op).
 *
 * Phase 3 swaps notConfiguredProvider for the PayPlus implementation.
 */
import { onRequest } from 'firebase-functions/v2/https';
import { db, FieldValue, auditIn } from '../lib/db.js';
import { notConfiguredProvider as psp } from '../lib/psp/provider.js';

export const pspWebhook = onRequest({ region: 'me-west1' }, async (req, res) => {
  let result;
  try {
    result = psp.verifyWebhook(req.rawBody?.toString('utf8') ?? '', req.headers as Record<string, string>);
  } catch {
    res.status(400).send('invalid signature');
    return;
  }

  if (!result.ok) {
    res.status(400).send('payment not ok');
    return;
  }

  try {
    await db.runTransaction(async (t) => {
      // Idempotency: a processed webhook key is a hard no-op.
      const idemRef = db.doc(`webhookEvents/${result.idempotencyKey}`);
      const idemSnap = await t.get(idemRef);
      if (idemSnap.exists) return;

      const txnRef = db.doc(`transactions/${result.txnId}`);
      const txnSnap = await t.get(txnRef);
      if (!txnSnap.exists) throw new Error('txn not found');
      const txn = txnSnap.data()!;

      if (txn.status !== 'created') return; // already advanced; ignore
      if (Number(txn.total) !== Number(result.amount)) {
        throw new Error(`amount mismatch: expected ${txn.total}, got ${result.amount}`);
      }

      t.set(idemRef, { at: FieldValue.serverTimestamp(), txnId: result.txnId });
      t.update(txnRef, {
        status: 'paid',
        pspRef: result.pspRef,
        paidAt: Date.now(),
        history: FieldValue.arrayUnion({ status: 'paid', at: Date.now(), by: 'psp' }),
        updatedAt: FieldValue.serverTimestamp(),
      });
      t.update(db.doc(`listings/${txn.listingId}`), { status: 'sold', updatedAt: FieldValue.serverTimestamp() });

      auditIn(t, {
        action: 'transaction.paid',
        actorUid: 'psp',
        actorRole: 'psp',
        targetType: 'transaction',
        targetId: result.txnId,
        detail: { amount: result.amount, pspRef: result.pspRef },
      });
    });
    res.status(200).send('ok');
  } catch (err) {
    console.error('pspWebhook error', err);
    res.status(500).send('processing error');
  }
});
