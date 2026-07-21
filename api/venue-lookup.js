import { verifyAuth } from './_lib/verifyAuth.js';

// Google Places API (New) Text Search — resolve a venue name+city to
// { placeId, location, address, googleRating, googleRatingCount, name }.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    await verifyAuth(req);
  } catch (e) {
    res.status(e.status || 401).json({ error: e.message });
    return;
  }

  const { venue, city } = req.body || {};
  if (typeof venue !== 'string' || !venue) {
    res.status(400).json({ error: 'venue required' });
    return;
  }
  const key = process.env.GOOGLE_MAPS_SERVER_KEY;
  if (!key) {
    res.status(500).json({ error: 'GOOGLE_MAPS_SERVER_KEY not configured' });
    return;
  }

  try {
    const resp = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': 'places.id,places.location,places.formattedAddress,places.rating,places.userRatingCount,places.displayName',
      },
      body: JSON.stringify({
        textQuery: [venue, city].filter(Boolean).join(', '),
        languageCode: 'he',
        regionCode: 'IL',
      }),
    });
    const json = await resp.json();
    if (!resp.ok) {
      res.status(502).json({ error: json?.error?.message || 'Places lookup failed' });
      return;
    }
    const place = json.places?.[0];
    if (!place) {
      res.status(200).json({ found: false });
      return;
    }
    res.status(200).json({
      found: true,
      placeId: place.id,
      location: place.location ? { lat: place.location.latitude, lng: place.location.longitude } : null,
      address: place.formattedAddress || null,
      googleRating: place.rating ?? null,
      googleRatingCount: place.userRatingCount ?? null,
      name: place.displayName?.text || null,
    });
  } catch (err) {
    console.error('venue-lookup error', err);
    res.status(500).json({ error: err?.message || 'lookup failed' });
  }
}
