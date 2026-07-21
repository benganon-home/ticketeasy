/**
 * createTransaction — buyer initiates a purchase.
 *
 * The client sends ONLY { listingId }. The server reads the listing, computes
 * price/fee/total itself, re-validates the price cap against the event's face
 * value, atomically reserves the listing, and creates the transaction in
 * `created` state. Returns { txnId } — payment is then driven by the PSP.
 */
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { db, FieldValue, auditIn } from '../lib/db.js';
import { assertAuth, assertAppCheck, assertNotBanned } from '../lib/guards.js';
import { computeAmounts, withinPriceCap } from '../lib/fees.js';

export const createTransaction = onCall({ region: 'me-west1' }, async (req) => {
  assertAppCheck(req);
  const buyerId = assertAuth(req);
  await assertNotBanned(buyerId);

  const listingId = req.data?.listingId;
  if (typeof listingId !== 'string' || !listingId) {
    throw new HttpsError('invalid-argument', 'listingId חסר.');
  }

  const txnId = await db.runTransaction(async (t) => {
    const listingRef = db.doc(`listings/${listingId}`);
    const listingSnap = await t.get(listingRef);
    if (!listingSnap.exists) throw new HttpsError('not-found', 'המודעה לא נמצאה.');

    const listing = listingSnap.data()!;
    if (listing.status !== 'active') {
      throw new HttpsError('failed-precondition', 'המודעה אינה זמינה יותר.');
    }
    if (listing.sellerId === buyerId) {
      throw new HttpsError('failed-precondition', 'לא ניתן לקנות מודעה של עצמך.');
    }

    // Authoritative price cap check against the event's face value.
    let faceValue = Number(listing.originalPrice) || 0;
    if (listing.eventId) {
      const eventSnap = await t.get(db.doc(`events/${listing.eventId}`));
      if (eventSnap.exists) {
        faceValue = Number(eventSnap.data()?.originalPrice) || faceValue;
      }
    }
    const price = Number(listing.price);
    if (!withinPriceCap(price, faceValue)) {
      throw new HttpsError('failed-precondition', 'מחיר המודעה חורג מהתקרה המותרת.');
    }

    const amounts = computeAmounts(price);

    const txnRef = db.collection('transactions').doc();
    t.set(txnRef, {
      listingId,
      eventId: listing.eventId ?? null,
      eventTitle: listing.eventTitle ?? null,
      buyerId,
      sellerId: listing.sellerId,
      sellerName: listing.sellerName ?? null,
      price: amounts.price,
      serviceFee: amounts.serviceFee,
      total: amounts.total,
      section: listing.section ?? null,
      row: listing.row ?? null,
      seats: listing.seats ?? null,
      quantity: listing.quantity ?? 1,
      status: 'created',
      history: [{ status: 'created', at: Date.now(), by: buyerId }],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Reserve the listing so a second buyer can't race the same ticket.
    t.update(listingRef, { status: 'reserved', reservedBy: buyerId, updatedAt: FieldValue.serverTimestamp() });

    auditIn(t, {
      action: 'transaction.create',
      actorUid: buyerId,
      actorRole: 'buyer',
      targetType: 'transaction',
      targetId: txnRef.id,
      detail: { listingId, total: amounts.total },
    });

    return txnRef.id;
  });

  return { txnId };
});
