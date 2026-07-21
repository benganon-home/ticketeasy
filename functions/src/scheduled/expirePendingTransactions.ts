/**
 * expirePendingTransactions — cancels `created` transactions that were never
 * paid within the payment window, releasing the reserved listing back to
 * `active`. Runs every 10 minutes.
 */
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { db, FieldValue } from '../lib/db.js';

const PAYMENT_TTL_MS = 15 * 60 * 1000;

export const expirePendingTransactions = onSchedule(
  { region: 'me-west1', schedule: 'every 10 minutes' },
  async () => {
    const cutoff = Date.now() - PAYMENT_TTL_MS;
    const stale = await db
      .collection('transactions')
      .where('status', '==', 'created')
      .get();

    let cancelled = 0;
    for (const doc of stale.docs) {
      const txn = doc.data();
      const createdMs = txn.createdAt?.toMillis?.() ?? 0;
      if (createdMs > cutoff) continue;

      await db.runTransaction(async (t) => {
        const fresh = await t.get(doc.ref);
        if (!fresh.exists || fresh.data()?.status !== 'created') return;
        t.update(doc.ref, {
          status: 'cancelled',
          history: FieldValue.arrayUnion({ status: 'cancelled', at: Date.now(), by: 'scheduler' }),
          updatedAt: FieldValue.serverTimestamp(),
        });
        if (txn.listingId) {
          t.update(db.doc(`listings/${txn.listingId}`), {
            status: 'active',
            reservedBy: FieldValue.delete(),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      });
      cancelled++;
    }
    console.log(`expirePendingTransactions: cancelled ${cancelled}`);
  }
);
