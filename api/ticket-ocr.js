import Anthropic from '@anthropic-ai/sdk';
import { bucket } from './_lib/admin.js';
import { verifyAuth } from './_lib/verifyAuth.js';

// Configurable so cost can be tuned: Opus 4.8 for best extraction accuracy by
// default; set OCR_MODEL=claude-haiku-4-5 to cut cost.
const MODEL = process.env.OCR_MODEL || 'claude-opus-4-8';

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    eventTitle: { type: ['string', 'null'], description: 'Event / show / match name' },
    dateISO: { type: ['string', 'null'], description: 'Event date-time in ISO 8601 if determinable' },
    venue: { type: ['string', 'null'] },
    city: { type: ['string', 'null'] },
    category: { type: ['string', 'null'], description: 'One of: music, sports, theater, standup, festivals, family, other' },
    section: { type: ['string', 'null'], description: 'Section / block / gate (יציע/אזור)' },
    row: { type: ['string', 'null'] },
    seats: { type: ['string', 'null'], description: 'Seat number(s)' },
    quantity: { type: ['integer', 'null'] },
    faceValue: { type: ['number', 'null'], description: 'Original printed price in ILS if shown' },
    barcodeValue: { type: ['string', 'null'], description: 'The barcode / ticket number if printed as text' },
    orderRef: { type: ['string', 'null'], description: 'Order / confirmation reference' },
    provider: { type: ['string', 'null'], description: 'Ticketing provider (Ticketmaster, Eventim, Leaan, Tixwise, etc.)' },
    confidence: { type: 'number', description: '0..1 overall extraction confidence' },
  },
  required: [
    'eventTitle', 'dateISO', 'venue', 'city', 'category', 'section', 'row',
    'seats', 'quantity', 'faceValue', 'barcodeValue', 'orderRef', 'provider', 'confidence',
  ],
};

const PROMPT = `You are extracting structured data from a resale ticket (image or PDF), often in Hebrew/RTL for Israeli events. Read every visible field. Return the event, date, venue/city, seat details (section/row/seats), quantity, original face value in ILS, any printed barcode/ticket number, order reference, and the ticketing provider. If a field is not visible, use null. Do NOT invent values. Set "confidence" to your overall confidence (0..1).`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  let uid;
  try {
    ({ uid } = await verifyAuth(req));
  } catch (e) {
    res.status(e.status || 401).json({ error: e.message });
    return;
  }

  const { storagePath } = req.body || {};
  if (typeof storagePath !== 'string' || !storagePath) {
    res.status(400).json({ error: 'storagePath required' });
    return;
  }
  // Authorize: the object must live under this user's upload prefix.
  if (!storagePath.startsWith(`ticket-uploads/${uid}/`)) {
    res.status(403).json({ error: 'Not allowed to read this object' });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
    return;
  }

  try {
    const file = bucket.file(storagePath);
    const [meta] = await file.getMetadata();
    const [buf] = await file.download();
    const contentType = meta.contentType || 'image/jpeg';
    const b64 = buf.toString('base64');

    const source = contentType === 'application/pdf'
      ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: b64 } }
      : { type: 'image', source: { type: 'base64', media_type: contentType, data: b64 } };

    const client = new Anthropic();
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      output_config: { format: { type: 'json_schema', schema: SCHEMA } },
      messages: [{ role: 'user', content: [source, { type: 'text', text: PROMPT }] }],
    });

    const text = response.content.find((b) => b.type === 'text')?.text || '{}';
    const data = JSON.parse(text);
    res.status(200).json({ data });
  } catch (err) {
    console.error('ticket-ocr error', err);
    res.status(500).json({ error: err?.message || 'OCR failed' });
  }
}
