import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Shield, Star, ChevronDown, ChevronUp, Tag, Users, AlertTriangle, MessageCircle, Heart } from 'lucide-react';
import { events, ticketOffers, users, formatPrice, formatDate, formatTime, getHotnessLabel } from '../../data/mockData';

function OfferCard({ offer }) {
  const seller = users.find((u) => u.id === offer.sellerId);
  return (
    <div className="card-flat mb-3">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-700 text-lg text-primary-600 dark:text-primary-400">{formatPrice(offer.price)}</span>
            {offer.markup > 0 && (
              <span className="text-[10px] text-dark-300">+{offer.markup.toFixed(0)}%</span>
            )}
            {offer.markup === 0 && (
              <span className="badge-success text-[10px]">מחיר מקורי</span>
            )}
          </div>
          <p className="text-xs text-dark-400">
            {offer.section} · שורה {offer.row} · מושב {offer.seats}
          </p>
          <p className="text-xs text-dark-300 mt-0.5">{offer.quantity} כרטיסים</p>
        </div>
        
        {offer.verified && (
          <div className="badge-success">
            <Shield className="w-3 h-3" />
            מאומת
          </div>
        )}
      </div>

      {/* Seller info */}
      <div className="flex items-center justify-between pt-2 border-t border-dark-100 dark:border-dark-600">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <span className="text-sm font-600 text-primary-600 dark:text-primary-300">{seller?.name.charAt(0)}</span>
          </div>
          <div>
            <p className="text-xs font-600">{seller?.name}</p>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-[10px] text-dark-400">{seller?.rating} · {seller?.totalSales} מכירות</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link to={`/messages`} className="p-2 rounded-xl bg-dark-50 dark:bg-dark-600 hover:bg-dark-100 dark:hover:bg-dark-500 transition-colors">
            <MessageCircle className="w-4 h-4 text-dark-400" />
          </Link>
          <Link to={`/buy/${offer.id}`} className="btn-primary text-sm py-2 px-4">
            קנייה
          </Link>
        </div>
      </div>
    </div>
  );
}

function MakeOfferModal({ event, onClose }) {
  const [price, setPrice] = useState('');
  const maxPrice = Math.round(event.originalPrice * 1.2);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-white dark:bg-dark-800 rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-700 text-lg mb-1">הצע מחיר</h3>
        <p className="text-sm text-dark-300 dark:text-dark-400 mb-4">
          מחיר מקורי: {formatPrice(event.originalPrice)} · מקסימום: {formatPrice(maxPrice)}
        </p>

        <div className="relative mb-4">
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-300 font-600">₪</span>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="הזן סכום"
            className="input-field pr-10 text-xl font-700 text-center"
            max={maxPrice}
          />
        </div>

        {price && +price > maxPrice && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-danger-50 dark:bg-danger-700/20 mb-3">
            <AlertTriangle className="w-4 h-4 text-danger-500" />
            <span className="text-xs text-danger-600 dark:text-danger-300">המחיר חורג מתקרת 20% מעל המקור</span>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">ביטול</button>
          <button
            disabled={!price || +price > maxPrice || +price <= 0}
            className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            שלח הצעה
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EventPage() {
  const { id } = useParams();
  const event = events.find((e) => e.id === id) || events[0];
  const offers = ticketOffers.filter((o) => o.eventId === event.id);
  const hotness = getHotnessLabel(event.hotness);
  const [showOffer, setShowOffer] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="-mx-4 -mt-4">
      {/* Hero image */}
      <div className="relative h-52 overflow-hidden">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-4 right-4 left-4">
          <span className={`badge badge-${hotness.color} mb-2`}>{hotness.text}</span>
          <h1 className="text-white font-800 text-xl">{event.title}</h1>
        </div>
        <button
          onClick={() => setSaved(!saved)}
          className="absolute top-4 left-4 p-2 rounded-full bg-black/30 backdrop-blur-sm"
        >
          <Heart className={`w-5 h-5 ${saved ? 'text-danger-400 fill-danger-400' : 'text-white'}`} />
        </button>
      </div>

      <div className="px-4 pt-4 pb-4">
        {/* Event info */}
        <div className="card-flat mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-500">{formatDate(event.date)} · {formatTime(event.date)}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-500">{event.venue}, {event.city}</span>
          </div>
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-500">מחיר מקורי: {formatPrice(event.originalPrice)}</span>
          </div>
        </div>

        {/* Trust banner */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-success-50 dark:bg-success-700/15 mb-4 trust-glow">
          <Shield className="w-5 h-5 text-success-500 flex-shrink-0" />
          <div>
            <p className="text-xs font-600 text-success-700 dark:text-success-300">עסקה מוגנת עם Escrow</p>
            <p className="text-[10px] text-success-600 dark:text-success-400">הכסף מוחזק בנאמנות עד אימות הכרטיס</p>
          </div>
        </div>

        {/* Available offers */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-700 text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary-500" />
            {offers.length} הצעות זמינות
          </h2>
          <button onClick={() => setShowOffer(true)} className="btn-secondary text-xs py-1.5 px-3">
            הצע מחיר
          </button>
        </div>

        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}

        {offers.length === 0 && (
          <div className="text-center py-8 card-flat">
            <span className="text-3xl mb-2 block">😢</span>
            <p className="font-600 mb-1">אין הצעות כרגע</p>
            <p className="text-xs text-dark-300 dark:text-dark-400 mb-3">שמור חיפוש ונעדכן אותך כשיעלה כרטיס</p>
            <button className="btn-primary text-sm">שמור חיפוש + התראה</button>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {event.tags.map((tag) => (
            <span key={tag} className="badge-primary text-xs">{tag}</span>
          ))}
        </div>
      </div>

      {showOffer && <MakeOfferModal event={event} onClose={() => setShowOffer(false)} />}
    </div>
  );
}
