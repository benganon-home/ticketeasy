import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, Lock, CreditCard, CheckCircle, Clock, AlertCircle, ChevronDown } from 'lucide-react';
import { ticketOffers, events, users, formatPrice } from '../../data/mockData';

export default function BuyPage() {
  const { offerId } = useParams();
  const offer = ticketOffers.find((o) => o.id === offerId) || ticketOffers[0];
  const event = events.find((e) => e.id === offer.eventId);
  const seller = users.find((u) => u.id === offer.sellerId);
  const [step, setStep] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const serviceFee = Math.round(offer.price * 0.05);
  const total = offer.price + serviceFee;

  if (step === 3) {
    return (
      <div className="text-center py-8 animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-success-50 dark:bg-success-700/20 flex items-center justify-center animate-bounce-in">
          <CheckCircle className="w-10 h-10 text-success-500" />
        </div>
        <h2 className="font-800 text-xl mb-2">העסקה בוצעה בהצלחה!</h2>
        <p className="text-sm text-dark-300 dark:text-dark-400 mb-6">
          הכסף מוחזק בנאמנות. הכרטיס ייחשף 2-4 שעות לפני האירוע.
        </p>

        <div className="card-flat mb-4 text-right">
          <h3 className="font-600 text-sm mb-3">מה עכשיו?</h3>
          {[
            { icon: '🔒', text: 'הכסף שלך מוגן בנאמנות (Escrow)' },
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

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-6">
        {['סיכום', 'תשלום'].map((label, i) => (
          <React.Fragment key={label}>
            <div className={`flex items-center gap-1.5 ${step > i + 1 ? 'text-success-500' : step === i + 1 ? 'text-primary-500' : 'text-dark-300'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-700 ${
                step > i + 1 ? 'bg-success-500 text-white' : step === i + 1 ? 'bg-primary-500 text-white' : 'bg-dark-100 dark:bg-dark-600'
              }`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className="text-xs font-600">{label}</span>
            </div>
            {i < 1 && <div className="flex-1 h-0.5 bg-dark-100 dark:bg-dark-600" />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div className="animate-fade-in">
          {/* Event summary */}
          <div className="card-flat mb-4">
            <h3 className="font-600 text-sm mb-2">{event?.title}</h3>
            <p className="text-xs text-dark-400 mb-1">{offer.section} · שורה {offer.row} · מושב {offer.seats}</p>
            <p className="text-xs text-dark-400">{offer.quantity} כרטיסים</p>
          </div>

          {/* Price breakdown */}
          <div className="card-flat mb-4">
            <h3 className="font-600 text-sm mb-3">פירוט מחיר</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>מחיר כרטיס</span>
                <span className="font-600">{formatPrice(offer.price)}</span>
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

          {/* Escrow explanation */}
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-primary-50 dark:bg-primary-900/15 mb-4">
            <Lock className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-600 text-primary-700 dark:text-primary-300">הכסף מוחזק בנאמנות</p>
              <p className="text-[10px] text-primary-600 dark:text-primary-400 mt-0.5">
                הכסף לא עובר למוכר עד שהכרטיס נסרק בהצלחה בכניסה לאירוע, או שאישרת קבלה, או שעברו 48 שעות ללא מחלוקת.
              </p>
            </div>
          </div>

          {/* Terms agreement */}
          <label className="flex items-start gap-2 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-dark-300 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-xs text-dark-400">
              קראתי ואני מסכים ל
              <Link to="/terms" className="text-primary-500 underline mr-1">תנאי שימוש</Link>
              ול
              <Link to="/escrow-policy" className="text-primary-500 underline mr-1">מדיניות Escrow</Link>
              ול
              <Link to="/disclaimer" className="text-primary-500 underline">כתב הוויתור</Link>
            </span>
          </label>

          <button
            onClick={() => setStep(2)}
            disabled={!agreed}
            className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
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

          {/* Security note */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-success-50 dark:bg-success-700/15 mb-4">
            <Shield className="w-4 h-4 text-success-500" />
            <span className="text-[10px] text-success-600 dark:text-success-300">
              התשלום מאובטח בתקן PCI DSS. הכסף מוחזק בנאמנות ולא עובר ישירות למוכר.
            </span>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">חזרה</button>
            <button onClick={() => setStep(3)} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Lock className="w-4 h-4" />
              שלם {formatPrice(total)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
