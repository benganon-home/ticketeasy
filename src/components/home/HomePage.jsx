import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, TrendingUp, MapPin, ChevronLeft, ChevronRight, Shield, Clock, Zap, Music, Trophy, Laugh, Users } from 'lucide-react';
import { events, categories, formatPrice, formatDate, formatTime, getHotnessLabel } from '../../data/mockData';
import { useAuth } from '../../App';

const FRIENDS_EVENTS = [
  {
    id: 'fe1',
    title: 'ריטה ורמי קליינשטיין',
    venue: 'בריכת הסולטן',
    city: 'ירושלים',
    date: '28/07/2025',
    icon: '🎵',
    tickets: 57,
    floorPrice: 134,
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=120&h=120&fit=crop',
    friends: [
      { name: 'דנה', avatar: 'https://i.pravatar.cc/40?img=1' },
      { name: 'יואב', avatar: 'https://i.pravatar.cc/40?img=3' },
      { name: 'מיכל', avatar: 'https://i.pravatar.cc/40?img=5' },
    ],
    friendCount: 7,
  },
  {
    id: 'fe2',
    title: 'מכבי חיפה',
    venue: 'סמי עופר',
    city: 'חיפה',
    date: '19/04/2025',
    icon: '⚽',
    tickets: 248,
    floorPrice: 64,
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=120&h=120&fit=crop',
    friends: [
      { name: 'רון', avatar: 'https://i.pravatar.cc/40?img=8' },
      { name: 'שיר', avatar: 'https://i.pravatar.cc/40?img=9' },
      { name: 'אורי', avatar: 'https://i.pravatar.cc/40?img=12' },
    ],
    friendCount: 36,
  },
  {
    id: 'fe3',
    title: 'עידן רייכל פרויקט',
    venue: 'פארק הירקון',
    city: 'תל אביב',
    date: '14/06/2025',
    icon: '🎶',
    tickets: 92,
    floorPrice: 210,
    image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=120&h=120&fit=crop',
    friends: [
      { name: 'נועה', avatar: 'https://i.pravatar.cc/40?img=16' },
      { name: 'תום', avatar: 'https://i.pravatar.cc/40?img=17' },
      { name: 'גל', avatar: 'https://i.pravatar.cc/40?img=20' },
    ],
    friendCount: 14,
  },
  {
    id: 'fe4',
    title: 'סטנד-אפ: אסי כהן',
    venue: 'זאפה תל אביב',
    city: 'תל אביב',
    date: '03/05/2025',
    icon: '😂',
    tickets: 18,
    floorPrice: 89,
    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=120&h=120&fit=crop',
    friends: [
      { name: 'ליאור', avatar: 'https://i.pravatar.cc/40?img=22' },
      { name: 'בר', avatar: 'https://i.pravatar.cc/40?img=25' },
      { name: 'יעל', avatar: 'https://i.pravatar.cc/40?img=27' },
    ],
    friendCount: 5,
  },
];

function FriendTicketCard({ event }) {
  return (
    <Link to={`/event/${event.id}`} className="flex-shrink-0 w-52 select-none">
      {/* Ticket body */}
      <div className="relative rounded-2xl overflow-visible" style={{ background: 'linear-gradient(135deg, #7c6ff7 0%, #a78bfa 100%)' }}>
        {/* Top section */}
        <div className="p-4 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-sm">{event.icon}</span>
                <span className="text-white font-700 text-sm leading-tight line-clamp-2">{event.title}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-white/70 flex-shrink-0" />
                <span className="text-white/70 text-[11px] truncate">{event.venue}</span>
              </div>
              <p className="text-white/60 text-[11px] mt-0.5">{event.date}</p>
            </div>
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
              <img src={event.image} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Ticket tear line with notches */}
        <div className="relative flex items-center">
          <div className="absolute -right-2.5 w-5 h-5 rounded-full bg-dark-900 dark:bg-dark-900" />
          <div className="flex-1 border-t-2 border-dashed border-white/25 mx-2" />
          <div className="absolute -left-2.5 w-5 h-5 rounded-full bg-dark-900 dark:bg-dark-900" />
        </div>

        {/* Bottom section */}
        <div className="p-4 pt-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white/60 text-[10px] mb-0.5">כרטיסים</p>
              <p className="text-white font-700 text-base">{event.tickets}</p>
            </div>
            <div className="text-left">
              <p className="text-white/60 text-[10px] mb-0.5">מחיר רצפה</p>
              <p className="text-white font-700 text-base flex items-center gap-1">
                ₪{event.floorPrice} <span className="text-green-300 text-sm">↘</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Friends row below card */}
      <div className="flex items-center gap-2 mt-2 px-1">
        <div className="flex -space-x-2 space-x-reverse">
          {event.friends.slice(0, 3).map((f) => (
            <img key={f.name} src={f.avatar} alt={f.name} className="w-7 h-7 rounded-full border-2 border-white dark:border-dark-900 object-cover" />
          ))}
        </div>
        <span className="text-[11px] text-dark-400 dark:text-dark-300 font-500">+ {event.friendCount} חברים הולכים</span>
      </div>
    </Link>
  );
}

function FriendsEventsSection() {
  const scrollRef = useRef(null);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? -220 : 220, behavior: 'smooth' });
  };

  return (
    <section className="mb-6 -mx-4">
      {/* Dark background container */}
      <div className="px-4 pt-6 pb-5" style={{ background: 'linear-gradient(135deg, #1a1040 0%, #2d1b69 100%)' }}>
        {/* Header */}
        <div className="mb-5">
          <h2 className="text-white font-800 text-2xl leading-tight mb-1">
            אירועים שחברים<br />
            הולכים. <span style={{ color: '#a78bfa' }}>לא תצטרף?</span>
          </h2>
        </div>

        {/* Scrollable cards */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {FRIENDS_EVENTS.map((event) => (
            <div key={event.id} style={{ scrollSnapAlign: 'start' }}>
              <FriendTicketCard event={event} />
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <div className="flex gap-2 mt-3">
          <button onClick={() => scroll('right')} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
          <button onClick={() => scroll('left')} className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </section>
  );
}

function HeroSection() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="relative -mx-4 -mt-4 px-4 pt-8 pb-10 mb-6 overflow-hidden rounded-b-[2rem]" style={{ background: 'var(--gradient-hero)' }}>
      {/* Decorative elements */}
      <div className="absolute top-4 left-8 w-24 h-24 rounded-full bg-primary-500/10 blur-2xl" />
      <div className="absolute bottom-8 right-4 w-32 h-32 rounded-full bg-purple-400/10 blur-3xl" />
      
      <div className="relative z-10">
        <h1 className="text-white font-heebo font-800 text-2xl mb-1 text-balance">
          כרטיסים יד שנייה
          <br />
          <span className="gradient-text text-3xl">בלי פחד מעקיצה</span>
        </h1>
        <p className="text-dark-200 text-sm mb-5 font-300">
          הכסף שלך מוגן עד שהכרטיס אמיתי. ואם לא — מחזירים הכל.
        </p>

        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-300" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חפש אירוע, אמן, קבוצה..."
            className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-dark-300 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:bg-white/15 transition-all font-heebo"
          />
        </form>

        {/* Trust badges */}
        <div className="flex gap-3 mt-4 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { icon: Shield, text: 'הכסף מוגן', color: 'text-green-400' },
            { icon: Clock, text: 'כרטיס אמיתי, מובטח', color: 'text-blue-400' },
            { icon: Zap, text: 'מחיר הוגן', color: 'text-amber-400' },
          ].map(({ icon: Icon, text, color }) => (
            <div key={text} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm whitespace-nowrap">
              <Icon className={`w-3.5 h-3.5 ${color}`} />
              <span className="text-[11px] font-500 text-white/80">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoriesSection() {
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title mb-0">קטגוריות</h2>
        <Link to="/search" className="text-primary-500 text-sm font-500 flex items-center gap-1 hover:gap-2 transition-all">
          הכל <ChevronLeft className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/search?cat=${cat.id}`}
            className="card-flat flex flex-col items-center gap-1.5 py-3 hover:border-primary-300 dark:hover:border-primary-600 transition-all group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
            <span className="text-xs font-600">{cat.name}</span>
            <span className="text-[10px] text-dark-300 dark:text-dark-400">{cat.count} כרטיסים</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function EventCard({ event }) {
  const hotness = getHotnessLabel(event.hotness);
  return (
    <Link to={`/event/${event.id}`} className="card p-0 overflow-hidden group">
      <div className="relative h-36 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Hotness badge */}
        <span className={`absolute top-2 right-2 badge badge-${hotness.color}`}>
          {hotness.text}
        </span>
        
        {/* Price */}
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm">
          <span className="text-sm font-700 text-primary-600 dark:text-primary-400">
            מ-{formatPrice(event.originalPrice)}
          </span>
        </div>
        
        {/* Tickets available */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm">
          <span className="text-[10px] text-white font-500">{event.ticketsAvailable} כרטיסים</span>
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="font-600 text-sm mb-1 line-clamp-1">{event.title}</h3>
        <div className="flex items-center gap-1 text-dark-300 dark:text-dark-400 text-xs mb-1.5">
          <Clock className="w-3 h-3" />
          <span>{formatDate(event.date)} · {formatTime(event.date)}</span>
        </div>
        <div className="flex items-center gap-1 text-dark-300 dark:text-dark-400 text-xs">
          <MapPin className="w-3 h-3" />
          <span>{event.venue}, {event.city}</span>
        </div>
        
        {/* Tags */}
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {event.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-300 text-[10px] font-500">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function PopularSection() {
  const sorted = [...events].sort((a, b) => b.hotness - a.hotness);
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title mb-0 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-danger-400" />
          הכי חמים עכשיו
        </h2>
        <Link to="/search?sort=hot" className="text-primary-500 text-sm font-500 flex items-center gap-1 hover:gap-2 transition-all">
          הכל <ChevronLeft className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {sorted.slice(0, 4).map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="mb-6">
      <h2 className="section-title">למה TicketEasy?</h2>
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: '🔒', title: 'הכסף אצלנו', desc: 'משתחרר למוכר רק אחרי שנכנסת' },
          { icon: '📱', title: 'כרטיס שלא ניתן לזייף', desc: 'נחשף שעתיים לפני — חד פעמי' },
          { icon: '🚫', title: 'מחירים הוגנים', desc: 'תקרת מחיר קבועה, בלי ניפוח' },
          { icon: '⭐', title: 'מוכרים עם היסטוריה', desc: 'ביקורות אמיתיות, שקיפות מלאה' },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="card-flat text-center">
            <span className="text-2xl mb-2 block">{icon}</span>
            <h3 className="font-600 text-sm mb-0.5">{title}</h3>
            <p className="text-xs text-dark-300 dark:text-dark-400">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  return (
    <div className="-mt-4">
      <HeroSection />
      {user && <FriendsEventsSection />}
      <CategoriesSection />
      <PopularSection />
      <TrustSection />
      
      {/* Footer links */}
      <div className="border-t border-dark-100 dark:border-dark-700 pt-4 pb-2">
        <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center text-xs text-dark-300 dark:text-dark-400">
          <Link to="/faq" className="hover:text-primary-500 transition-colors">שאלות נפוצות</Link>
          <Link to="/terms" className="hover:text-primary-500 transition-colors">תנאי שימוש</Link>
          <Link to="/escrow-policy" className="hover:text-primary-500 transition-colors">הגנת תשלום</Link>
          <Link to="/disclaimer" className="hover:text-primary-500 transition-colors">כתב ויתור</Link>
          <Link to="/privacy" className="hover:text-primary-500 transition-colors">מדיניות פרטיות</Link>
        </div>
        <p className="text-center text-[10px] text-dark-200 dark:text-dark-500 mt-3">
          © 2026 TicketEasy. כל הזכויות שמורות.
        </p>
      </div>
    </div>
  );
}
