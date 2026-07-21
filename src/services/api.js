import { auth } from '../firebase';

// POST to a Vercel serverless function with the caller's Firebase ID token.
async function apiPost(path, body) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('יש להתחבר.');
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `הבקשה נכשלה (${res.status})`);
  return data;
}

// { storagePath } -> { data: {...extracted ticket fields} }
export const ticketOcr = (storagePath) => apiPost('/api/ticket-ocr', { storagePath });

// { venue, city } -> { placeId, location, address, googleRating, googleRatingCount }
export const venueLookup = (venue, city) => apiPost('/api/venue-lookup', { venue, city });

// server-authoritative listing create with barcode dedupe -> { id }
export const publishListing = (listing) => apiPost('/api/publish-listing', listing);
