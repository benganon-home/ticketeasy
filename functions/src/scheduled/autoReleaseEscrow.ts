/**
 * autoReleaseEscrow — releases escrow to the seller for `revealed` transactions
 * whose event ended more than AUTO_RELEASE_GRACE_MS ago with no open dispute.
 * Runs hourly. Mirrors confirmReceipt's release + counter bumps.
 */
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { db, FieldValue } from '../lib/db.js';

const AUTO_RELEASE_GRACE_MS = 48 * 60 * 60 * 1000; // 48h after event end

export const autoReleaseEscrow = onSchedule(
  { region: 'me-west1', schedule: 'every 1 hours' },
  async () => {
    const revealed = await db.collection('transactions').where('status', '==', 'revealed').get();

    let released = 0;
    for (const doc of revealed.docs) {
      const txn = doc.data();
      // Determine event end; fall back to reveal time if no event date.
      let eventEndMs = txn.revealedAt ?? 0;
      if (txn.eventId) {
        const ev = await db.doc(`events/${txn.eventId}`).get();
        const parsed = Date.parse(ev.data()?.date ?? '');
        if (!Number.isNaN(parsed)) eventEndMs = parsed;
      }
      if (Date.now() < eventEndMs + AUTO_RELEASE_GRACE_MS) continue;

      await db.runTransaction(async (t) => {
        const fresh = await t.get(doc.ref);
        if (!fresh.exists || fresh.data()?.status !== 'revealed') return;
        t.update(doc.ref, {
          status: 'released',
          releasedAt: Date.now(),
          history: FieldValue.arrayUnion({ status: 'released', at: Date.now(), by: 'scheduler' }),
          updatedAt: FieldValue.serverTimestamp(),
        });
        t.set(db.doc(`users/${txn.sellerId}`), { salesCount: FieldValue.increment(1) }, { merge: true });
        t.set(db.doc(`users/${txn.buyerId}`), { purchasesCount: FieldValue.increment(1) }, { merge: true });
      });
      // TODO(Phase 3): PSP payout to seller.
      released++;
    }
    console.log(`autoReleaseEscrow: released ${released}`);
  }
);
