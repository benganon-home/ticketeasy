import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { MapPin, Calendar, Tag, Ticket, ShieldCheck, XCircle, AlertCircle, ChevronLeft, MessageCircle } from 'lucide-react';
import { formatPrice, formatDate } from '../../data/mockData';
import { getListing, cancelListing } from '../../services/listings';
import { getEvent } from '../../services/events';
import { getOrCreateConversation } from '../../services/messages';
import { useAuth } from '../../App';

const STATUS = {
  active: { text: 'פעיל למכירה', cls: 'badge-success' },
  reserved: { text: 'שמור לקונה', cls: 'badge-amber' },
  sold: { text: 'נמכר', cls: 'badge-primary' },
  cancelled: { text: 'בוטל', cls: 'badge-danger' },
};

export default function ListingPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      const l = await getListing(id);
      setListing(l);
      if (l?.eventId) setEvent(await getEvent(l.eventId).catch(() => null));
      setLoading(false);
    }
    load();
  }, [id]);

  const contactSeller = async () => {
    if (!user) { navigate('/auth'); return; }
    setBusy(true); setError(null);
    try {
      const convoId = await getOrCreateConversation(user.id, listing.sellerId);
      navigate('/messages', { state: { convoId, otherId: listing.sellerId, otherName: listing.sellerName } });
    } catch (err) {
      setError(err?.message || 'לא ניתן לפתוח שיחה כרגע.');
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('לבטל את המודעה? הכרטיס לא יוצג יותר למכירה.')) return;
    setBusy(true); setError(null);
    try {
      await cancelListing(id);
      setListing((l) => ({ ...l, status: 'cancelled' }));
    } catch (err) {
      setError(err?.message || 'לא ניתן לבטל את המודעה כרגע.');
    } finally { setBusy(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return <div className="text-center py-12 text-dark-400">המודעה לא נמצאה</div>;
  }

  const isOwner = user && listing.sellerId === user.id;
  const status = STATUS[listing.status] || { text: listing.status, cls: 'badge' };

  return (
    <div>
      <h1 className="font-800 text-xl mb-1">{listing.eventTitle || 'כרטיס למכירה'}</h1>
      <div className="flex items-center gap-2 mb-4">
        <span className={`${status.cls} text-[10px]`}>{status.text}</span>
        {isOwner && <span className="text-[11px] text-dark-300">המודעה שלך</span>}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 mb-4">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-[11px] text-red-600">{error}</span>
        </div>
      )}

      <div className="card-flat mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-dark-400">מחיר</span>
          <span className="font-800 text-primary-600 text-lg">{formatPrice(listing.price)}</span>
        </div>
        {listing.originalPrice != null && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-dark-400">מחיר מקורי</span>
            <span className="text-sm">{formatPrice(listing.originalPrice)}</span>
          </div>
        )}
        <div className="border-t border-dark-100 pt-3 space-y-2">
          {(listing.section || listing.row || listing.seats) && (
            <div className="flex items-center gap-2 text-sm">
              <Ticket className="w-4 h-4 text-primary-500 flex-shrink-0" />
              <span>{[listing.section, listing.row && `שורה ${listing.row}`, listing.seats && `מושב ${listing.seats}`].filter(Boolean).join(' · ')}</span>
            </div>
          )}
          {listing.quantity && (
            <div className="flex items-center gap-2 text-sm">
              <Tag className="w-4 h-4 text-primary-500 flex-shrink-0" />
              <span>{listing.quantity} כרטיסים</span>
            </div>
          )}
          {event?.date && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-primary-500 flex-shrink-0" />
              <span>{formatDate(event.date)}</span>
            </div>
          )}
          {event?.venue && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
              <span>{event.venue}{event.city ? `, ${event.city}` : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Event linkage warning for the owner (invisible-to-buyers case) */}
      {isOwner && !listing.eventId && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 mb-4">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <span className="text-[11px] text-amber-700">
            המודעה אינה משויכת לאירוע מהקטלוג, ולכן לא תופיע בדף אירוע לקונים.
            כדי שתהיה גלויה — פרסם מחדש ובחר אירוע מרשימת ההצעות.
          </span>
        </div>
      )}

      {event && (
        <Link to={`/event/${listing.eventId}`} className="card-flat flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-primary-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-600 text-sm truncate">{event.title}</p>
            <p className="text-[10px] text-dark-400">צפייה בדף האירוע וכל המודעות</p>
          </div>
          <ChevronLeft className="w-4 h-4 text-dark-300" />
        </Link>
      )}

      {/* Actions */}
      {isOwner ? (
        listing.status === 'active' && (
          <button onClick={handleCancel} disabled={busy} className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-40">
            <XCircle className="w-4 h-4" />
            {busy ? 'מבטל...' : 'בטל מודעה'}
          </button>
        )
      ) : listing.status === 'active' ? (
        <div className="space-y-3">
          <button onClick={() => navigate(`/buy/${listing.id}`)} className="btn-primary w-full flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            קנייה מאובטחת · {formatPrice(listing.price)}
          </button>
          <button onClick={contactSeller} disabled={busy} className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-40">
            <MessageCircle className="w-4 h-4" />
            צור קשר עם המוכר
          </button>
        </div>
      ) : (
        <div className="text-center text-sm text-dark-400 py-3">הכרטיס אינו זמין לרכישה</div>
      )}
    </div>
  );
}
