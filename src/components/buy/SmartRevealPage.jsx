import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Lock, Unlock, MapPin, Clock, Shield, Smartphone, AlertTriangle, CheckCircle } from 'lucide-react';
import { transactions, events, formatDate, formatTime } from '../../data/mockData';

export default function SmartRevealPage() {
  const { txnId } = useParams();
  const txn = transactions.find((t) => t.id === txnId) || transactions[0];
  const event = events.find((e) => e.id === txn.eventId);
  const [status, setStatus] = useState('locked'); // locked, time_ok, location_ok, revealed, scanned
  const [countdown, setCountdown] = useState(null);
  const [locationGranted, setLocationGranted] = useState(false);

  useEffect(() => {
    const eventDate = new Date(event.date);
    const revealTime = new Date(eventDate.getTime() - 3 * 60 * 60 * 1000);
    const interval = setInterval(() => {
      const now = new Date();
      const diff = revealTime - now;
      if (diff <= 0) {
        setStatus('time_ok');
        setCountdown(null);
      } else {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setCountdown(`${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [event]);

  const handleLocationCheck = () => {
    setLocationGranted(true);
    setTimeout(() => setStatus('location_ok'), 1500);
  };

  const handleReveal = () => {
    setStatus('revealed');
  };

  const handleScan = () => {
    setStatus('scanned');
  };

  const steps = [
    { id: 'time', label: 'זמן', desc: '2-4 שעות לפני', icon: Clock, done: ['time_ok','location_ok','revealed','scanned'].includes(status) },
    { id: 'location', label: 'מיקום', desc: 'בטווח 2 ק"מ', icon: MapPin, done: ['location_ok','revealed','scanned'].includes(status) },
    { id: 'reveal', label: 'חשיפה', desc: 'חד פעמית', icon: Unlock, done: ['revealed','scanned'].includes(status) },
    { id: 'scan', label: 'סריקה', desc: 'בכניסה', icon: CheckCircle, done: status === 'scanned' },
  ];

  return (
    <div>
      <h1 className="font-800 text-xl mb-1">Smart Reveal</h1>
      <p className="text-sm text-dark-300 dark:text-dark-400 mb-6">{event?.title}</p>

      {/* Progress */}
      <div className="flex items-center justify-between mb-8 px-2">
        {steps.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                s.done ? 'bg-success-500 text-white scale-110' : 'bg-dark-100 dark:bg-dark-600 text-dark-400'
              }`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-600">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 transition-colors duration-500 ${s.done ? 'bg-success-500' : 'bg-dark-100 dark:bg-dark-600'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Content by status */}
      {status === 'locked' && (
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <Lock className="w-12 h-12 text-primary-500 animate-pulse-soft" />
          </div>
          <h2 className="font-700 text-lg mb-2">הכרטיס נעול</h2>
          <p className="text-sm text-dark-300 dark:text-dark-400 mb-4">
            הכרטיס ייחשף {countdown ? `בעוד` : 'כשיגיע הזמן'}
          </p>
          {countdown && (
            <div className="inline-block px-6 py-3 rounded-2xl bg-dark-800 dark:bg-dark-700" dir="ltr">
              <span className="font-mono font-800 text-3xl text-white tracking-wider">{countdown}</span>
            </div>
          )}
          <div className="card-flat mt-6 text-right">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-success-500" />
              <span className="text-xs font-600">למה הכרטיס נעול?</span>
            </div>
            <p className="text-xs text-dark-400 leading-relaxed">
              מנגנון Smart Reveal מגן עליך על ידי חשיפת הכרטיס רק בסמוך לאירוע.
              זה מונע העתקה, הפצה או שימוש לרעה בכרטיס.
              הכרטיס ייחשף פעם אחת בלבד ולא ניתן לצלם או לשתף אותו.
            </p>
          </div>
          {/* Demo button */}
          <button onClick={() => setStatus('time_ok')} className="btn-secondary mt-4 text-xs">(דמו: דלג על זמן)</button>
        </div>
      )}

      {status === 'time_ok' && (
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-amber-50 dark:bg-amber-600/20 flex items-center justify-center">
            <MapPin className="w-12 h-12 text-amber-500" />
          </div>
          <h2 className="font-700 text-lg mb-2">אימות מיקום</h2>
          <p className="text-sm text-dark-300 dark:text-dark-400 mb-4">
            כדי לחשוף את הכרטיס, נוודא שאתה בקרבת מקום האירוע
          </p>
          <p className="text-xs text-dark-400 mb-6">{event?.venue}, {event?.city}</p>
          <button onClick={handleLocationCheck} className="btn-primary w-full flex items-center justify-center gap-2">
            <MapPin className="w-5 h-5" />
            {locationGranted ? 'בודק מיקום...' : 'אשר מיקום'}
          </button>
          <button onClick={() => setStatus('location_ok')} className="btn-secondary mt-3 text-xs w-full">(דמו: דלג על מיקום)</button>
        </div>
      )}

      {status === 'location_ok' && (
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-success-50 dark:bg-success-700/20 flex items-center justify-center">
            <Unlock className="w-12 h-12 text-success-500" />
          </div>
          <h2 className="font-700 text-lg mb-2">מוכן לחשיפה!</h2>
          <p className="text-sm text-dark-300 dark:text-dark-400 mb-2">זמן ומיקום אומתו בהצלחה</p>
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-600/15 mb-6 text-right">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <span className="text-xs text-amber-700 dark:text-amber-300">
              שים לב: הכרטיס ייחשף פעם אחת בלבד. לאחר החשיפה לא ניתן לחשוף אותו שוב.
            </span>
          </div>
          <button onClick={handleReveal} className="btn-success w-full text-lg font-700 py-4">
            חשוף את הכרטיס
          </button>
        </div>
      )}

      {status === 'revealed' && (
        <div className="text-center animate-bounce-in">
          <div className="card p-6 mb-4">
            <div className="w-48 h-48 mx-auto mb-4 rounded-2xl bg-white dark:bg-dark-800 border-2 border-dashed border-primary-300 flex items-center justify-center">
              <div className="text-center">
                <Smartphone className="w-10 h-10 text-primary-500 mx-auto mb-2" />
                <p className="text-xs text-dark-400">[QR Code]</p>
                <p className="text-[10px] text-dark-300 mt-1">הראה בכניסה</p>
              </div>
            </div>
            <p className="text-sm font-600">{event?.title}</p>
            <p className="text-xs text-dark-400">{formatDate(event?.date)} · {formatTime(event?.date)}</p>
            <p className="text-xs text-dark-400">{event?.venue}</p>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-danger-50 dark:bg-danger-700/15 mb-4">
            <AlertTriangle className="w-4 h-4 text-danger-500" />
            <span className="text-xs text-danger-600 dark:text-danger-300">
              כרטיס חד-פעמי — לא ניתן לצלם מסך או לשתף
            </span>
          </div>
          <button onClick={handleScan} className="btn-primary w-full">(דמו: סרוק כרטיס)</button>
        </div>
      )}

      {status === 'scanned' && (
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-success-500 flex items-center justify-center animate-bounce-in">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="font-700 text-xl mb-2 text-success-600 dark:text-success-400">הכרטיס נסרק בהצלחה!</h2>
          <p className="text-sm text-dark-300 dark:text-dark-400 mb-4">תהנה מהאירוע! הכסף ישוחרר למוכר.</p>
          <div className="card-flat">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-success-500" />
              <span className="text-xs font-600 text-success-600 dark:text-success-300">העסקה הושלמה</span>
            </div>
            <p className="text-[10px] text-dark-400 mt-1">
              {formatPrice(txn?.price || 130)} ישוחרר למוכר. אם יש בעיה — יש לך 48 שעות לפתוח מחלוקת.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function formatPrice(p) { return `₪${p}`; }
