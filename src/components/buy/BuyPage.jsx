import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, CreditCard, CheckCircle } from 'lucide-react';
import { formatPrice } from '../../data/mockData';
import { getListing, updateListing } from '../../services/listings';
import { createTransaction } from '../../services/transactions';
import { getEvent } from '../../services/events';
import { useAuth } from '../../App';

export default function BuyPage() {
  const { offerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [paying, setPaying] = useState(false);
  const [txnId, setTxnId] = useState(null);

  useEffect(() => {
    async function load() {
      const l = await getListing(offerId);
      if (!l) { setLoading(false); return; }
      setListing(l);
      if (l.eventId) {
        const ev = await getEvent(l.eventId);
        setEvent(ev);
      }
      setLoading(false);
    }
    load();
  }, [offerId]);

  const serviceFee = listing ? Math.round(listing.price * 0.05) : 0;
  const total = listing ? listing.price + serviceFee : 0;

  const handlePay = async () => {
    if (!user || !listing) return;
    setPaying(true);
    try {
      const id = await createTransaction({
        listingId: listing.id,
        eventId: listing.eventId || null,
        eventTitle: listing.eventTitle,
        buyerId: user.id,
        buyerName: user.name,
        sellerId: listing.sellerId,
        sellerName: listing.sellerName,
        price: listing.price,
        serviceFee,
        total,
        section: listing.section,
        row: listing.row,
        seats: listing.seats,
        quantity: listing.quantity,
      });
      await updateListing(listing.id, { status: 'sold' });
      setTxnId(id);
      setStep(3);
    } catch (err) {
      console.error(err);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!listing) {
    return <div className="text-center py-12 text-dark-400">ההצעה לא נמצאה או כבר נמכרה</div>;
  }

  if (step === 3) {
    return (
      <div className="text-center py-8 animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-success-50 dark:bg-success-700/20 flex items-center justify-center animate-bounce-in">
          <CheckCircle className="w-10 h-10 text-success-500" />
        </div>
        <h2 className="font-800 text-xl mb-2">העסקה בוצעה בהצלחה!</h2>
        <p className="text-sm text-dark-300 dark:text-dark-400 mb-6">
          הכסף מוחזק אצלנו. הכרטיס ייחשף 2-4 שעות לפני האירוע.
        </p>

        <div className="card-flat mb-4 text-right">
          <h3 className="font-600 text-sm mb-3">מה עכשיו?</h3>
          {[
            { icon: '🔒', text: 'הכסף שלך מוגן אצלנו' },
            { icon: '📱', text: 'הכרטיס ייחשף באפליקציה לפני האירוע' },
            { icon: '📍', text: 'תקבל התראה כשהכרטיס מוכן' },
            { icon: '✅', text: 'אחרי הסריקה — הכסף עובר למוכר' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 py-2 border-b border-dark-50 dark:border-dark-600 last:border-0">
              <span>{icon}</span>
              <span className="text-xs">{text}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Link to="/" className="btn-secondary flex-1">חזרה לבית</Link>
          <Link to="/profile" className="btn-primary flex-1">העסקאות שלי</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-800 text-xl mb-4">השלמת קנייה</h1>

      <div className="flex items-center gap-2 mb-6">
        {['סיכום', 'תשלום'].map((label, i) => (
          <React.Fragment key={label}>
            <div className={`flex items-center gap-1.5 ${step > i + 1 ? 'text-success-500' : step === i + 1 ? 'text-primary-500' : 'text-dark-300'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-700 ${
                step > i + 1 ? 'bg-success-500 text-white' : step === i + 1 ? 'bg-primary-500 text-white' : 'bg-dark-100 dark:bg-dark-600'
              }`}>{step > i + 1 ? '✓' : i + 1}</div>
              <span className="text-xs font-600">{label}</span>
            </div>
            {i < 1 && <div className="flex-1 h-0.5 bg-dark-100 dark:bg-dark-600" />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div className="animate-fade-in">
          <div className="card-flat mb-4">
            <h3 className="font-600 text-sm mb-2">{event?.title || listing.eventTitle}</h3>
            <p className="text-xs text-dark-400 mb-1">{listing.section} · שורה {listing.row} · מושב {listing.seats}</p>
            <p className="text-xs text-dark-400">{listing.quantity} כרטיסים</p>
          </div>

          <div className="card-flat mb-4">
            <h3 className="font-600 text-sm mb-3">פירוט מחיר</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>מחיר כרטיס</span>
                <span className="font-600">{formatPrice(listing.price)}</span>
              </div>
              <div className="flex justify-between text-sm text-dark-400">
                <span>עמלת שירות (5%)</span>
                <span>{formatPrice(serviceFee)}</span>
              </div>
              <div className="border-t border-dark-100 dark:border-dark-600 pt-2 flex justify-between">
                <span className="font-700">סה"כ לתשלום</span>
                <span className="font-800 text-primary-600 dark:text-primary-400 text-lg">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-primary-50 dark:bg-primary-900/15 mb-4">
            <Lock className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-600 text-primary-700 dark:text-primary-300">הכסף מוחזק אצלנו</p>
              <p className="text-[10px] text-primary-600 dark:text-primary-400 mt-0.5">
                הכסף לא עובר למוכר עד שהכרטיס נסרק בהצלחה בכניסה לאירוע, או שאישרת קבלה, או שעברו 48 שעות ללא מחלוקת.
              </p>
            </div>
          </div>

          <label className="flex items-start gap-2 mb-4 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 w-4 h-4 rounded border-dark-300 text-primary-500 focus:ring-primary-500" />
            <span className="text-xs text-dark-400">
              קראתי ואני מסכים ל
              <Link to="/terms" className="text-primary-500 underline mr-1">תנאי שימוש</Link>
              ול
              <Link to="/disclaimer" className="text-primary-500 underline">כתב הוויתור</Link>
            </span>
          </label>

          <button onClick={() => setStep(2)} disabled={!agreed} className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed">
            המשך לתשלום
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in">
          <div className="card-flat mb-4">
            <h3 className="font-600 text-sm mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary-500" />
              פרטי תשלום
            </h3>
            <p className="text-xs text-dark-400 mb-3">תשלום מאובטח דרך PayPlus</p>
            <div className="space-y-3">
              <input type="text" placeholder="מספר כרטיס אשראי" className="input-field text-sm" dir="ltr" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="MM/YY" className="input-field text-sm text-center" dir="ltr" />
                <input type="text" placeholder="CVV" className="input-field text-sm text-center" dir="ltr" />
              </div>
              <input type="text" placeholder="שם בעל הכרטיס" className="input-field text-sm" />
              <input type="text" placeholder="תעודת זהות" className="input-field text-sm" dir="ltr" />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-success-50 dark:bg-success-700/15 mb-4">
            <Shield className="w-4 h-4 text-success-500" />
            <span className="text-[10px] text-success-600 dark:text-success-300">
              התשלום מאובטח בתקן PCI DSS. הכסף מוחזק אצלנו ולא עובר ישירות למוכר.
            </span>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">חזרה</button>
            <button onClick={handlePay} disabled={paying} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40">
              {paying
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><Lock className="w-4 h-4" />שלם {formatPrice(total)}</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
