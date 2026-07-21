#!/usr/bin/env node
/*
 * Admin-only Firestore seed. NOT shipped to the browser.
 *
 * Usage:
 *   # against the local emulator (safe):
 *   FIRESTORE_EMULATOR_HOST=localhost:8080 node scripts/seed.mjs
 *
 *   # against the live project (needs a service account):
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json node scripts/seed.mjs
 *
 * Flags:
 *   --force   re-seed even if active events already exist
 */
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';

const PROJECT_ID = 'ticketeasy-cc50c';
const force = process.argv.includes('--force');
const useEmulator = !!process.env.FIRESTORE_EMULATOR_HOST;

// Future-dated catalog (refreshed from the original 2025 seed).
const SEED_EVENTS = [
  { title: 'מכבי תל אביב vs הפועל באר שבע', artist: 'מכבי תל אביב', category: 'sports', venue: 'מנורה מבטחים ארנה', city: 'תל אביב', date: '2026-09-15T20:00:00', image: 'https://images.unsplash.com/photo-1546519638405-a9d1b0e60c7b?w=800&h=400&fit=crop', originalPrice: 120, minPrice: 120, ticketsAvailable: 12, hotness: 95, tags: ['ספורט', 'כדורסל', 'ליגת העל'], active: true },
  { title: 'עידן רייכל פרויקט — הופעת פרידה', artist: 'עידן רייכל', category: 'music', venue: 'פארק הירקון', city: 'תל אביב', date: '2026-08-20T21:00:00', image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=400&fit=crop', originalPrice: 280, minPrice: 280, ticketsAvailable: 8, hotness: 99, tags: ['מוזיקה', 'פופ', 'ישראלי'], active: true },
  { title: 'שלומי שבן — סטנד אפ חדש', artist: 'שלומי שבן', category: 'standup', venue: 'זאפה תל אביב', city: 'תל אביב', date: '2026-08-10T21:30:00', image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&h=400&fit=crop', originalPrice: 150, minPrice: 150, ticketsAvailable: 5, hotness: 82, tags: ['סטנד אפ', 'קומדיה'], active: true },
  { title: 'הפנטום של האופרה', artist: 'להקת אופרה', category: 'theater', venue: 'תיאטרון הבימה', city: 'תל אביב', date: '2026-10-05T19:30:00', image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&h=400&fit=crop', originalPrice: 220, minPrice: 220, ticketsAvailable: 20, hotness: 75, tags: ['תיאטרון', 'אופרה', 'קלאסי'], active: true },
  { title: 'אינפיניטי פסטיבל 2026', artist: 'Various Artists', category: 'festivals', venue: 'שטח הצגות אשדוד', city: 'אשדוד', date: '2026-09-01T16:00:00', image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop', originalPrice: 320, minPrice: 320, ticketsAvailable: 45, hotness: 88, tags: ['פסטיבל', 'אלקטרוני', 'מוזיקה'], active: true },
  { title: 'מכבי תל אביב vs ריאל מדריד — יורוליג', artist: 'מכבי תל אביב', category: 'sports', venue: 'מנורה מבטחים ארנה', city: 'תל אביב', date: '2026-12-12T20:30:00', image: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&h=400&fit=crop', originalPrice: 180, minPrice: 180, ticketsAvailable: 3, hotness: 97, tags: ['ספורט', 'כדורסל', 'יורוליג'], active: true },
  { title: 'נועה קירל — אולם מנורה', artist: 'נועה קירל', category: 'music', venue: 'אולם מנורה', city: 'תל אביב', date: '2026-11-03T21:00:00', image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=400&fit=crop', originalPrice: 200, minPrice: 200, ticketsAvailable: 18, hotness: 91, tags: ['מוזיקה', 'פופ', 'ישראלי'], active: true },
  { title: 'ברוך ובינשטיין — מופע משפחתי', artist: 'ברוך ובינשטיין', category: 'family', venue: 'היכל התרבות', city: 'תל אביב', date: '2026-08-04T11:00:00', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=400&fit=crop', originalPrice: 90, minPrice: 90, ticketsAvailable: 30, hotness: 65, tags: ['משפחה', 'ילדים', 'קומדיה'], active: true },
];

function makeApp() {
  if (useEmulator) return initializeApp({ projectId: PROJECT_ID });
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyPath) {
    return initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, 'utf8'))), projectId: PROJECT_ID });
  }
  return initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
}

async function main() {
  console.log(useEmulator
    ? `Seeding EMULATOR at ${process.env.FIRESTORE_EMULATOR_HOST}`
    : `Seeding LIVE project ${PROJECT_ID}`);

  const db = getFirestore(makeApp());
  const active = await db.collection('events').where('active', '==', true).get();
  if (active.size > 0 && !force) {
    console.log(`Firestore already has ${active.size} active events — skipping (use --force to re-seed).`);
    return;
  }

  const batch = db.batch();
  for (const ev of SEED_EVENTS) {
    const ref = db.collection('events').doc();
    batch.set(ref, { ...ev, createdAt: FieldValue.serverTimestamp() });
  }
  await batch.commit();
  console.log(`Seeded ${SEED_EVENTS.length} events.`);
}

main().then(() => process.exit(0)).catch((err) => { console.error(err); process.exit(1); });
