/**
 * Guarded transaction-status transitions. Reads the txn inside a Firestore
 * transaction, enforces the escrow state machine, appends history + audit.
 */
import { HttpsError } from 'firebase-functions/v2/https';
import type { Transaction, DocumentReference } from 'firebase-admin/firestore';
import { db, FieldValue, auditIn } from './db.js';
import { assertTransition, type Actor, type TxnStatus } from './escrow.js';

export interface TransitionOpts {
  txnId: string;
  to: TxnStatus;
  actor: Actor;
  actorUid: string;
  action: string;
  extraUpdate?: Record<string, unknown>;
  detail?: Record<string, unknown>;
}

/** Runs a guarded transition atomically and returns the updated txn data. */
export async function transitionTxn(opts: TransitionOpts) {
  return db.runTransaction(async (t: Transaction) => {
    const ref: DocumentReference = db.doc(`transactions/${opts.txnId}`);
    const snap = await t.get(ref);
    if (!snap.exists) throw new HttpsError('not-found', 'העסקה לא נמצאה.');

    const data = snap.data()!;
    const from = data.status as TxnStatus;
    try {
      assertTransition(from, opts.to, opts.actor);
    } catch {
      throw new HttpsError('failed-precondition', `מעבר מצב לא חוקי (${from} → ${opts.to}).`);
    }

    const historyEntry = { status: opts.to, at: Date.now(), by: opts.actorUid };
    t.update(ref, {
      status: opts.to,
      history: FieldValue.arrayUnion(historyEntry),
      updatedAt: FieldValue.serverTimestamp(),
      ...(opts.extraUpdate ?? {}),
    });

    auditIn(t, {
      action: opts.action,
      actorUid: opts.actorUid,
      actorRole: opts.actor,
      targetType: 'transaction',
      targetId: opts.txnId,
      detail: opts.detail,
    });

    return { id: opts.txnId, ...data, status: opts.to };
  });
}
