/**
 * Callable guards — auth, admin, ban, and App Check enforcement.
 * Throws typed HttpsError so the client gets a clean, non-leaky error.
 */
import { HttpsError, type CallableRequest } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

export function assertAuth(req: CallableRequest): string {
  if (!req.auth) throw new HttpsError('unauthenticated', 'יש להתחבר כדי לבצע פעולה זו.');
  return req.auth.uid;
}

export function assertAdmin(req: CallableRequest): string {
  const uid = assertAuth(req);
  if (req.auth?.token?.admin !== true) {
    throw new HttpsError('permission-denied', 'הרשאת מנהל נדרשת.');
  }
  return uid;
}

/** Reject calls without a valid App Check token (abuse protection). */
export function assertAppCheck(req: CallableRequest): void {
  if (!req.app) {
    throw new HttpsError('failed-precondition', 'בקשה לא מאומתת (App Check).');
  }
}

export async function assertNotBanned(uid: string): Promise<void> {
  const snap = await getFirestore().doc(`users/${uid}`).get();
  if (snap.exists && snap.data()?.banned === true) {
    throw new HttpsError('permission-denied', 'החשבון הושעה.');
  }
}
