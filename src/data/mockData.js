// === קטגוריות ===
export const categories = [
  { id: 'sports', name: 'ספורט', icon: '⚽', color: 'success', count: 234 },
  { id: 'music', name: 'מוזיקה', icon: '🎵', color: 'primary', count: 189 },
  { id: 'theater', name: 'תיאטרון', icon: '🎭', color: 'danger', count: 87 },
  { id: 'standup', name: 'סטנדאפ', icon: '🎤', color: 'amber', count: 156 },
  { id: 'festivals', name: 'פסטיבלים', icon: '🎪', color: 'primary', count: 42 },
  { id: 'family', name: 'משפחה', icon: '👨‍👩‍👧‍👦', color: 'success', count: 93 },
];

// === אירועים ===
export const events = [
  {
    id: 'evt-001',
    title: 'מכבי תל אביב vs הפועל באר שבע',
    category: 'sports',
    date: '2026-04-05T20:00:00',
    venue: 'אצטדיון בלומפילד',
    city: 'תל אביב',
    lat: 32.0627,
    lng: 34.7692,
    originalPrice: 120,
    image: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=600&h=400&fit=crop',
    ticketsAvailable: 8,
    hotness: 95,
    tags: ['ליגת העל', 'כדורגל'],
  },
  {
    id: 'evt-002',
    title: 'עידן רייכל — מופע סיום',
    category: 'music',
    date: '2026-04-12T21:00:00',
    venue: 'היכל מנורה מבטחים',
    city: 'תל אביב',
    lat: 32.0731,
    lng: 34.7825,
    originalPrice: 350,
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop',
    ticketsAvailable: 3,
    hotness: 98,
    tags: ['מופע אחרון', 'VIP'],
  },
  {
    id: 'evt-003',
    title: 'שלומי שבן — סטנדאפ חדש',
    category: 'standup',
    date: '2026-03-28T21:30:00',
    venue: 'זאפה הרצליה',
    city: 'הרצליה',
    lat: 32.1629,
    lng: 34.7936,
    originalPrice: 150,
    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=600&h=400&fit=crop',
    ticketsAvailable: 12,
    hotness: 72,
    tags: ['סטנדאפ', 'חדש'],
  },
  {
    id: 'evt-004',
    title: 'הפנטום של האופרה',
    category: 'theater',
    date: '2026-04-20T20:00:00',
    venue: 'תיאטרון הבימה',
    city: 'תל אביב',
    lat: 32.0726,
    lng: 34.7790,
    originalPrice: 280,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
    ticketsAvailable: 5,
    hotness: 85,
    tags: ['מחזמר', 'קלאסי'],
  },
  {
    id: 'evt-005',
    title: 'אינדיניגב 2026',
    category: 'festivals',
    date: '2026-05-14T16:00:00',
    venue: 'פארק אשכול',
    city: 'ניצנה',
    lat: 30.8878,
    lng: 34.3905,
    originalPrice: 450,
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=400&fit=crop',
    ticketsAvailable: 20,
    hotness: 90,
    tags: ['פסטיבל', 'מדבר', '3 ימים'],
  },
  {
    id: 'evt-006',
    title: 'מכבי תל אביב vs ריאל מדריד — יורוליג',
    category: 'sports',
    date: '2026-04-08T20:30:00',
    venue: 'היכל מנורה מבטחים',
    city: 'תל אביב',
    lat: 32.0731,
    lng: 34.7825,
    originalPrice: 250,
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=400&fit=crop',
    ticketsAvailable: 2,
    hotness: 99,
    tags: ['יורוליג', 'כדורסל'],
  },
  {
    id: 'evt-007',
    title: 'נועה קירל — אולם מנורה',
    category: 'music',
    date: '2026-04-15T21:00:00',
    venue: 'היכל מנורה מבטחים',
    city: 'תל אביב',
    lat: 32.0731,
    lng: 34.7825,
    originalPrice: 200,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop',
    ticketsAvailable: 15,
    hotness: 88,
    tags: ['פופ', 'הופעה'],
  },
  {
    id: 'evt-008',
    title: 'ברוך וברונשטיין — הצגה למשפחה',
    category: 'family',
    date: '2026-04-02T17:00:00',
    venue: 'תיאטרון גשר',
    city: 'יפו',
    lat: 32.0544,
    lng: 34.7558,
    originalPrice: 90,
    image: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&h=400&fit=crop',
    ticketsAvailable: 25,
    hotness: 55,
    tags: ['ילדים', 'משפחה'],
  },
];

// === הצעות לכרטיסים (לדף אירוע ספציפי) ===
export const ticketOffers = [
  {
    id: 'off-001',
    eventId: 'evt-001',
    sellerId: 'usr-002',
    price: 130,
    originalPrice: 120,
    markup: 8.3,
    section: 'יציע מזרחי',
    row: 12,
    seats: '15-16',
    quantity: 2,
    uploadedAt: '2026-03-15T10:30:00',
    verified: true,
    sellerRating: 4.8,
    sellerSales: 12,
  },
  {
    id: 'off-002',
    eventId: 'evt-001',
    sellerId: 'usr-003',
    price: 140,
    originalPrice: 120,
    markup: 16.7,
    section: 'יציע מערבי',
    row: 5,
    seats: '8',
    quantity: 1,
    uploadedAt: '2026-03-16T14:00:00',
    verified: true,
    sellerRating: 4.5,
    sellerSales: 7,
  },
  {
    id: 'off-003',
    eventId: 'evt-001',
    sellerId: 'usr-005',
    price: 120,
    originalPrice: 120,
    markup: 0,
    section: 'יציע צפוני',
    row: 20,
    seats: '3-4',
    quantity: 2,
    uploadedAt: '2026-03-17T09:15:00',
    verified: false,
    sellerRating: 3.9,
    sellerSales: 2,
  },
];

// === משתמשים ===
export const users = [
  {
    id: 'usr-001',
    name: 'יוסי כהן',
    phone: '050-1234567',
    verified: true,
    rating: 4.9,
    totalSales: 23,
    totalPurchases: 15,
    joinedAt: '2025-06-10',
    badges: ['מוכר מאומת', 'סופר-מוכר'],
    trustScore: 98,
  },
  {
    id: 'usr-002',
    name: 'דנה לוי',
    phone: '052-9876543',
    verified: true,
    rating: 4.8,
    totalSales: 12,
    totalPurchases: 8,
    joinedAt: '2025-09-20',
    badges: ['מוכר מאומת'],
    trustScore: 92,
  },
  {
    id: 'usr-003',
    name: 'אבי מזרחי',
    phone: '054-5551234',
    verified: true,
    rating: 4.5,
    totalSales: 7,
    totalPurchases: 20,
    joinedAt: '2025-11-05',
    badges: ['מוכר מאומת'],
    trustScore: 85,
  },
  {
    id: 'usr-004',
    name: 'נועם ברק',
    phone: '058-7778899',
    verified: false,
    rating: 0,
    totalSales: 0,
    totalPurchases: 1,
    joinedAt: '2026-03-01',
    badges: ['חדש'],
    trustScore: 40,
  },
  {
    id: 'usr-005',
    name: 'מיכל אברהם',
    phone: '053-2223344',
    verified: true,
    rating: 3.9,
    totalSales: 2,
    totalPurchases: 5,
    joinedAt: '2026-01-15',
    badges: [],
    trustScore: 65,
  },
];

// === הודעות ===
export const messages = [
  {
    id: 'msg-001',
    fromId: 'usr-002',
    toId: 'usr-001',
    eventId: 'evt-001',
    text: 'היי, הכרטיסים עדיין זמינים?',
    timestamp: '2026-03-17T15:30:00',
    read: true,
  },
  {
    id: 'msg-002',
    fromId: 'usr-001',
    toId: 'usr-002',
    eventId: 'evt-001',
    text: 'כן! 2 כרטיסים ליציע מזרחי, שורה 12',
    timestamp: '2026-03-17T15:32:00',
    read: true,
  },
  {
    id: 'msg-003',
    fromId: 'usr-002',
    toId: 'usr-001',
    eventId: 'evt-001',
    text: 'מעולה, אני קונה!',
    timestamp: '2026-03-17T15:33:00',
    read: false,
  },
];

// === עסקאות ===
export const transactions = [
  {
    id: 'txn-001',
    buyerId: 'usr-002',
    sellerId: 'usr-001',
    eventId: 'evt-001',
    offerId: 'off-001',
    price: 130,
    serviceFee: 6.5,
    total: 136.5,
    status: 'escrow', // pending, escrow, revealed, scanned, completed, disputed, refunded
    createdAt: '2026-03-17T16:00:00',
    escrowReleasedAt: null,
    smartRevealAt: '2026-04-05T16:00:00',
    disputeDeadline: '2026-04-07T20:00:00',
  },
];

// === FAQ ===
export const faqItems = [
  {
    category: 'כללי',
    items: [
      {
        q: 'מה זה TicketEasy?',
        a: 'TicketEasy היא פלטפורמה מאובטחת לקנייה ומכירה של כרטיסים יד שנייה לאירועים בישראל. אנחנו מגינים על הקונים והמוכרים באמצעות מנגנון Escrow, אימות כרטיסים, וחשיפה חכמה.',
      },
      {
        q: 'איך אני יודע שהכרטיס אמיתי?',
        a: 'כל כרטיס עובר בדיקה אוטומטית (OCR + זיהוי ברקוד). בנוסף, הכסף שלך מוחזק בנאמנות ומשתחרר למוכר רק אחרי שהכרטיס נסרק בהצלחה בכניסה לאירוע.',
      },
      {
        q: 'מה העמלה?',
        a: 'עמלת שירות של 5% מהקונה בלבד. המוכר לא משלם עמלה.',
      },
    ],
  },
  {
    category: 'קנייה',
    items: [
      {
        q: 'מתי אני מקבל את הכרטיס?',
        a: 'הכרטיס (QR/ברקוד) נחשף באפליקציה 2-4 שעות לפני תחילת האירוע. זה חלק ממנגנון Smart Reveal שמגן עליך מפני הונאות.',
      },
      {
        q: 'מה קורה אם הכרטיס לא עובד?',
        a: 'אם הכרטיס לא נסרק בכניסה, הכסף שלך מוחזר במלואו. יש לך 48 שעות מסיום האירוע לפתוח מחלוקת.',
      },
      {
        q: 'אפשר להציע מחיר?',
        a: 'כן! בכל מודעה יש כפתור "הצע מחיר". המוכר יכול לאשר או לדחות את ההצעה שלך.',
      },
    ],
  },
  {
    category: 'מכירה',
    items: [
      {
        q: 'מתי אני מקבל את הכסף?',
        a: 'הכסף משתחרר אליך אחרי שהכרטיס נסרק בהצלחה בכניסה, או אחרי שהקונה אישר קבלה, או 48 שעות אחרי האירוע (אם לא הוגשה מחלוקת).',
      },
      {
        q: 'מה המחיר המקסימלי?',
        a: 'ניתן למכור עד 20% מעל המחיר המקורי. המערכת בודקת אוטומטית מול הקבלה שהעלית.',
      },
      {
        q: 'כמה כרטיסים אפשר למכור?',
        a: 'עד 4 כרטיסים לאותו אירוע. ההגבלה מונעת ספסרות ומבטיחה שוק הוגן.',
      },
    ],
  },
  {
    category: 'בטיחות',
    items: [
      {
        q: 'מה זה Escrow?',
        a: 'Escrow (נאמנות) זה מנגנון שבו הכסף מוחזק אצל צד שלישי (הסולק שלנו) ולא עובר ישירות למוכר. הכסף משתחרר רק כשהעסקה מושלמת בהצלחה.',
      },
      {
        q: 'מה זה Smart Reveal?',
        a: 'Smart Reveal הוא מנגנון שחושף את הכרטיס (QR) רק 2-4 שעות לפני האירוע, ורק פעם אחת. זה מונע העתקה והפצה של כרטיסים.',
      },
    ],
  },
];

// === Helper functions ===
export const formatPrice = (price) => `₪${price.toLocaleString('he-IL')}`;

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('he-IL', options);
};

export const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
};

export const formatRelativeTime = (dateStr) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = date - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return 'עבר';
  if (days === 0) return 'היום';
  if (days === 1) return 'מחר';
  if (days < 7) return `בעוד ${days} ימים`;
  if (days < 30) return `בעוד ${Math.floor(days / 7)} שבועות`;
  return `בעוד ${Math.floor(days / 30)} חודשים`;
};

export const getHotnessLabel = (hotness) => {
  if (hotness >= 95) return { text: '🔥 חם מאוד', color: 'danger' };
  if (hotness >= 80) return { text: '⚡ ביקוש גבוה', color: 'amber' };
  if (hotness >= 60) return { text: '📈 פופולרי', color: 'primary' };
  return { text: '✨ זמין', color: 'success' };
};

export const getStatusLabel = (status) => {
  const map = {
    pending: { text: 'ממתין', color: 'amber', icon: '⏳' },
    escrow: { text: 'בנאמנות', color: 'primary', icon: '🔒' },
    revealed: { text: 'כרטיס נחשף', color: 'success', icon: '📱' },
    scanned: { text: 'נסרק', color: 'success', icon: '✅' },
    completed: { text: 'הושלם', color: 'success', icon: '🎉' },
    disputed: { text: 'במחלוקת', color: 'danger', icon: '⚠️' },
    refunded: { text: 'הוחזר', color: 'danger', icon: '↩️' },
  };
  return map[status] || { text: status, color: 'dark', icon: '❓' };
};
