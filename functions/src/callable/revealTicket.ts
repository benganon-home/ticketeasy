/**
 * revealTicket — buyer reveals the ticket after payment (paid -> revealed).
 * Only the buyer of a `paid` txn, and only inside the reveal window
 * (from event start - REVEAL_WINDOW_MS). Returns a short-lived signed URL to
 * the ticket asset in Storage; the asset itself is never client-readable.
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getStorage } from 'firebase-admin/storage';
import { db } from '../lib/db.js';
import { assertAuth, assertAppCheck } from '../lib/guards.js';
import { transitionTxn } from '../lib/txn.js';

const REVEAL_WINDOW_MS = 4 * 60 * 60 * 1000; // reveal allowed from 4h before start
const SIGNED_URL_TTL_MS = 15 * 60 * 1000; // 15 minutes

export const revealTicket = onCall({ region: 'me-west1' }, async (req) => {
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

  // Time-window gate against the event start.
  if (txn.eventId) {
    const ev = await db.doc(`events/${txn.eventId}`).get();
    const startsAt = ev.exists ? Date.parse(ev.data()?.date ?? '') : NaN;
    if (!Number.isNaN(startsAt) && Date.now() < startsAt - REVEAL_WINDOW_MS) {
      throw new HttpsError('failed-precondition', 'החשיפה תתאפשר קרוב יותר למועד האירוע.');
    }
  }

  await transitionTxn({
    txnId,
    to: 'revealed',
    actor: 'buyer',
    actorUid: uid,
    action: 'transaction.reveal',
    extraUpdate: { revealedAt: Date.now() },
  });

  // Mint a short-lived signed URL for the ticket asset (if present).
  let ticketUrl: string | null = null;
  const privateSnap = await db.doc(`transactions/${txnId}/private/ticket`).get();
  const storagePath = privateSnap.exists ? (privateSnap.data()?.storagePath as string | undefined) : undefined;
  if (storagePath) {
    const [url] = await getStorage()
      .bucket()
      .file(storagePath)
      .getSignedUrl({ action: 'read', expires: Date.now() + SIGNED_URL_TTL_MS });
    ticketUrl = url;
  }

  return { status: 'revealed', ticketUrl, expiresInMs: SIGNED_URL_TTL_MS };
});
