# TicketEasy 🎫✅

פלטפורמה מאובטחת לקנייה ומכירה של כרטיסים יד שנייה לאירועים בישראל.

## התקנה

```bash
npm install
npm run dev
```

## Deploy ל-Vercel

```bash
npx vercel
```

## סטאק טכנולוגי
- **Frontend**: React 18 + Tailwind CSS + Vite
- **Router**: React Router v6
- **Icons**: Lucide React
- **Animations**: Framer Motion + CSS Animations
- **PWA**: Service Worker + Web App Manifest

## מבנה הפרויקט

```
src/
├── components/
│   ├── layout/     # Header, BottomNav
│   ├── home/       # דף בית, קטגוריות, אירועים פופולריים
│   ├── search/     # חיפוש + סינון
│   ├── event/      # דף אירוע + הצעות + Make Offer
│   ├── buy/        # Escrow checkout + Smart Reveal
│   ├── sell/       # העלאת כרטיס + OCR + תמחור
│   ├── auth/       # OTP + אימות ת.ז.
│   ├── profile/    # פרופיל + דירוג + היסטוריה
│   ├── messaging/  # צ׳אט קונה-מוכר
│   ├── disputes/   # מחלוקות
│   ├── faq/        # שאלות נפוצות + צ׳אט בוט
│   ├── legal/      # 4 דפים משפטיים מלאים
│   ├── landing/    # דף נחיתה
│   └── admin/      # פאנל ניהול
├── data/           # Mock data
├── styles/         # Design tokens + Global CSS
└── App.jsx         # Routing + Theme + Auth context
```

## פיצ'רי אבטחה
- 🔒 **Escrow** — כסף בנאמנות עד אימות
- 📱 **Smart Reveal** — כרטיס נחשף 2-4 שעות לפני
- 🚫 **אנטי-ספסרות** — תקרת 20% + הגבלת 4 כרטיסים
- 🔍 **OCR + Hash** — זיהוי כפילויות ומזויפים
- ⭐ **דירוג מוכרים** — מערכת אמון שקופה
- 📍 **GPS Verify** — אימות מיקום אופציונלי
- 🛡️ **Device ID** — חסימת מכשירים חשודים

## דפים משפטיים (בעברית מלאה)
- תנאי שימוש
- מדיניות Escrow והחזרים
- כתב ויתור
- מדיניות פרטיות
