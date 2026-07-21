/**
 * Admin callables — all gated by the `admin` custom claim (assertAdmin) and
 * audit-logged. No env-email backdoors.
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getAuth } from 'firebase-admin/auth';
import { db, FieldValue, audit } from '../lib/db.js';
import { assertAdmin, assertAppCheck } from '../lib/guards.js';
import { transitionTxn } from '../lib/txn.js';

/** disputed -> released or refunded, with a required resolution note. */
export const resolveDispute = onCall({ region: 'me-west1' }, async (req) => {
  assertAppCheck(req);
  const adminUid = assertAdmin(req);
  const { disputeId, resolution, note } = req.data ?? {};
  if (typeof disputeId !== 'string' || !disputeId) {
    throw new HttpsError('invalid-argument', 'disputeId חסר.');
  }
  if (resolution !== 'release' && resolution !== 'refund') {
    throw new HttpsError('invalid-argument', 'resolution חייב להיות release או refund.');
  }
  if (typeof note !== 'string' || note.trim().length === 0) {
    throw new HttpsError('invalid-argument', 'נדרשת הערת פתרון.');
  }

  const dSnap = await db.doc(`disputes/${disputeId}`).get();
  if (!dSnap.exists) throw new HttpsError('not-found', 'המחלוקת לא נמצאה.');
  const dispute = dSnap.data()!;

  await transitionTxn({
    txnId: dispute.txnId,
    to: resolution === 'release' ? 'released' : 'refunded',
    actor: 'admin',
    actorUid: adminUid,
    action: `admin.dispute.${resolution}`,
    detail: { disputeId, note },
  });

  await db.doc(`disputes/${disputeId}`).update({
    status: 'resolved',
    resolution,
    resolutionNote: note,
    resolvedBy: adminUid,
    resolvedAt: FieldValue.serverTimestamp(),
  });

  // TODO(Phase 3): trigger PSP payout (release) or refund via provider.
  return { ok: true };
});

/** paid -> refunded (admin override outside the dispute flow). */
export const refundTransaction = onCall({ region: 'me-west1' }, async (req) => {
  assertAppCheck(req);
  const adminUid = assertAdmin(req);
  const { txnId, reason } = req.data ?? {};
  if (typeof txnId !== 'string' || !txnId) throw new HttpsError('invalid-argument', 'txnId חסר.');

  await transitionTxn({
    txnId,
    to: 'refunded',
    actor: 'admin',
    actorUid: adminUid,
    action: 'admin.refund',
    detail: { reason: reason ?? null },
  });
  // TODO(Phase 3): PSP refund.
  return { ok: true };
});

/** revealed|disputed -> released (admin override). */
export const releaseFunds = onCall({ region: 'me-west1' }, async (req) => {
  assertAppCheck(req);
  const adminUid = assertAdmin(req);
  const { txnId } = req.data ?? {};
  if (typeof txnId !== 'string' || !txnId) throw new HttpsError('invalid-argument', 'txnId חסר.');

  await transitionTxn({
    txnId,
    to: 'released',
    actor: 'admin',
    actorUid: adminUid,
    action: 'admin.release',
  });
  return { ok: true };
});

/** Ban / unban a user (server-only field, enforced by rules + guards). */
export const banUser = onCall({ region: 'me-west1' }, async (req) => {
  assertAppCheck(req);
  const adminUid = assertAdmin(req);
  const { uid, banned } = req.data ?? {};
  if (typeof uid !== 'string' || !uid) throw new HttpsError('invalid-argument', 'uid חסר.');
  if (typeof banned !== 'boolean') throw new HttpsError('invalid-argument', 'banned חייב להיות בוליאני.');

  await db.doc(`users/${uid}`).set({ banned }, { merge: true });
  await audit({
    action: banned ? 'admin.ban' : 'admin.unban',
    actorUid: adminUid,
    actorRole: 'admin',
    targetType: 'user',
    targetId: uid,
  });
  return { ok: true };
});

/** Grant/revoke the admin custom claim. Callable only by an existing admin. */
export const setAdminClaim = onCall({ region: 'me-west1' }, async (req) => {
  assertAppCheck(req);
  const adminUid = assertAdmin(req);
  const { uid, admin } = req.data ?? {};
  if (typeof uid !== 'string' || !uid) throw new HttpsError('invalid-argument', 'uid חסר.');
  if (typeof admin !== 'boolean') throw new HttpsError('invalid-argument', 'admin חייב להיות בוליאני.');

  await getAuth().setCustomUserClaims(uid, { admin });
  await audit({
    action: admin ? 'admin.grant' : 'admin.revoke',
    actorUid: adminUid,
    actorRole: 'admin',
    targetType: 'user',
    targetId: uid,
  });
  return { ok: true };
});
