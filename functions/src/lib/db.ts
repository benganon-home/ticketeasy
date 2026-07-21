/**
 * Shared Admin SDK initialization + audit logging.
 * Every money/status/admin mutation appends an immutable auditLogs entry.
 */
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue, type Transaction } from 'firebase-admin/firestore';

if (getApps().length === 0) initializeApp();

export const db = getFirestore();
export { FieldValue };

export interface AuditEntry {
  action: string; // e.g. 'transaction.reveal', 'admin.refund'
  actorUid: string;
  actorRole: 'buyer' | 'seller' | 'admin' | 'psp' | 'scheduler';
  targetType: string; // 'transaction' | 'user' | 'dispute'
  targetId: string;
  detail?: Record<string, unknown>;
}

/** Append an audit log inside an existing transaction (preferred). */
export function auditIn(txn: Transaction, entry: AuditEntry): void {
  const ref = db.collection('auditLogs').doc();
  txn.set(ref, { ...entry, at: FieldValue.serverTimestamp() });
}

/** Append an audit log outside a transaction. */
export async function audit(entry: AuditEntry): Promise<void> {
  await db.collection('auditLogs').add({ ...entry, at: FieldValue.serverTimestamp() });
}
