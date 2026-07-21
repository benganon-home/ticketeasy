import { createHash } from 'node:crypto';
import { db } from './_lib/admin.js';
import { verifyAuth } from './_lib/verifyAuth.js';
import { FieldValue } from 'firebase-admin/firestore';

const PRICE_CAP_MULTIPLIER = 1.2;
const OCCUPIED = ['active', 'reserved', 'sold'];

function barcodeHash(raw) {
  const normalized = String(raw).replace(/[\s-]+/g, '').toUpperCase();
  if (!normalized) return null;
  return createHash('sha256').update(normalized).digest('hex');
}

// Server-authoritative listing create with cross-platform barcode dedupe.
// (Escrow + scan-at-gate remains the real authenticity guarantee — this blocks
// the SAME ticket being listed/sold twice, not issuer-level forgery.)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  let uid, name;
  try {
    ({ uid, name } = await verifyAuth(req));
  } catch (e) {
    res.status(e.status || 401).json({ error: e.message });
    return;
  }

  const b = req.body || {};
  const price = Number(b.price);
  const originalPrice = Number(b.originalPrice);
  if (!b.eventId) { res.status(400).json({ error: 'בחר אירוע מהקטלוג.' }); return; }
  if (!Number.isFinite(price) || price <= 0) { res.status(400).json({ error: 'מחיר לא תקין.' }); return; }

  try {
    // Authoritative price-cap check against the event's face value.
    const eventSnap = await db.doc(`events/${b.eventId}`).get();
    if (!eventSnap.exists) { res.status(400).json({ error: 'האירוע לא נמצא.' }); return; }
    const faceValue = Number(eventSnap.data()?.originalPrice) || originalPrice;
    if (faceValue > 0 && price > faceValue * PRICE_CAP_MULTIPLIER) {
      res.status(400).json({ error: 'המחיר חורג מהתקרה המותרת (20% מעל המחיר המקורי).' });
      return;
    }

    // Barcode dedupe (only when a barcode value was extracted).
    const hash = b.barcodeValue ? barcodeHash(b.barcodeValue) : null;
    if (hash) {
      const dupSnap = await db.collection('listings').where('barcodeHash', '==', hash).get();
      const clash = dupSnap.docs.some((d) => OCCUPIED.includes(d.data().status));
      if (clash) {
        res.status(409).json({ error: 'כרטיס זה כבר קיים במערכת ולא ניתן למכור אותו פעמיים.' });
        return;
      }
    }

    // Pull seller reputation from the users doc (never trust client-supplied).
    const userSnap = await db.doc(`users/${uid}`).get();
    const u = userSnap.exists ? userSnap.data() : {};

    const ref = await db.collection('listings').add({
      eventTitle: eventSnap.data()?.title || b.eventTitle || null,
      eventId: b.eventId,
      category: eventSnap.data()?.category || b.category || null,
      originalPrice: faceValue || originalPrice || null,
      price,
      section: b.section || null,
      row: b.row || null,
      seats: b.seats || null,
      quantity: Number(b.quantity) || 1,
      sellerId: uid,
      sellerName: u.name || name || 'מוכר',
      sellerRating: u.rating ?? null,
      sellerPhotoURL: u.photoURL ?? null,
      status: 'active',
      barcodeHash: hash, // hash only — the raw barcode is never stored
      ticketImagePath: b.ticketImagePath || null,
      createdAt: FieldValue.serverTimestamp(),
    });

    res.status(200).json({ id: ref.id });
  } catch (err) {
    console.error('publish-listing error', err);
    res.status(500).json({ error: err?.message || 'פרסום נכשל' });
  }
}
