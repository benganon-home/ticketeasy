// Run this once to seed events into Firestore
// Call seedEvents() from browser console or a one-time admin button
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

const SEED_EVENTS = [
  {
    title: 'מכבי תל אביב vs הפועל באר שבע',
    artist: 'מכבי תל אביב',
    category: 'sports',
    venue: 'מנורה מבטחים ארנה',
    city: 'תל אביב',
    date: '2025-08-15T20:00:00',
    image: 'https://images.unsplash.com/photo-1546519638405-a9d1b0e60c7b?w=800&h=400&fit=crop',
    originalPrice: 120,
    minPrice: 120,
    ticketsAvailable: 12,
    hotness: 95,
    tags: ['ספורט', 'כדורסל', 'ליגת העל'],
    active: true,
  },
  {
    title: 'עידן רייכל פרויקט — הופעת פרידה',
    artist: 'עידן רייכל',
    category: 'music',
    venue: 'פארק הירקון',
    city: 'תל אביב',
    date: '2025-07-20T21:00:00',
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=400&fit=crop',
    originalPrice: 280,
    minPrice: 280,
    ticketsAvailable: 8,
    hotness: 99,
    tags: ['מוזיקה', 'פופ', 'ישראלי'],
    active: true,
  },
  {
    title: 'שלומי שבן — סטנד אפ חדש',
    artist: 'שלומי שבן',
    category: 'standup',
    venue: 'זאפה תל אביב',
    city: 'תל אביב',
    date: '2025-06-10T21:30:00',
    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&h=400&fit=crop',
    originalPrice: 150,
    minPrice: 150,
    ticketsAvailable: 5,
    hotness: 82,
    tags: ['סטנד אפ', 'קומדיה'],
    active: true,
  },
  {
    title: 'הפנטום של האופרה',
    artist: 'להקת אופרה',
    category: 'theater',
    venue: 'תיאטרון הבימה',
    city: 'תל אביב',
    date: '2025-09-05T19:30:00',
    image: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800&h=400&fit=crop',
    originalPrice: 220,
    minPrice: 220,
    ticketsAvailable: 20,
    hotness: 75,
    tags: ['תיאטרון', 'אופרה', 'קלאסי'],
    active: true,
  },
  {
    title: 'אינפינידנים פסטיבל 2025',
    artist: 'Various Artists',
    category: 'festivals',
    venue: 'שטח הצגות אשדוד',
    city: 'אשדוד',
    date: '2025-08-01T16:00:00',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop',
    originalPrice: 320,
    minPrice: 320,
    ticketsAvailable: 45,
    hotness: 88,
    tags: ['פסטיבל', 'אלקטרוני', 'מוזיקה'],
    active: true,
  },
  {
    title: 'מכבי תל אביב vs ריאל מדריד — יורוליג',
    artist: 'מכבי תל אביב',
    category: 'sports',
    venue: 'מנורה מבטחים ארנה',
    city: 'תל אביב',
    date: '2025-11-12T20:30:00',
    image: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&h=400&fit=crop',
    originalPrice: 180,
    minPrice: 180,
    ticketsAvailable: 3,
    hotness: 97,
    tags: ['ספורט', 'כדורסל', 'יורוליג'],
    active: true,
  },
  {
    title: 'נועה קירל — אולם מנורה',
    artist: 'נועה קירל',
    category: 'music',
    venue: 'אולם מנורה',
    city: 'תל אביב',
    date: '2025-10-03T21:00:00',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=400&fit=crop',
    originalPrice: 200,
    minPrice: 200,
    ticketsAvailable: 18,
    hotness: 91,
    tags: ['מוזיקה', 'פופ', 'ישראלי'],
    active: true,
  },
  {
    title: 'ברוך ובינשטיין — מופע משפחתי',
    artist: 'ברוך ובינשטיין',
    category: 'family',
    venue: 'היכל התרבות',
    city: 'תל אביב',
    date: '2025-07-04T11:00:00',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=400&fit=crop',
    originalPrice: 90,
    minPrice: 90,
    ticketsAvailable: 30,
    hotness: 65,
    tags: ['משפחה', 'ילדים', 'קומדיה'],
    active: true,
  },
];

export async function seedEvents() {
  const existing = await getDocs(query(collection(db, 'events'), where('active', '==', true)));
  if (existing.size > 0) {
    console.log(`Firestore already has ${existing.size} events, skipping seed.`);
    return;
  }
  for (const event of SEED_EVENTS) {
    await addDoc(collection(db, 'events'), event);
  }
  console.log(`Seeded ${SEED_EVENTS.length} events to Firestore.`);
}
