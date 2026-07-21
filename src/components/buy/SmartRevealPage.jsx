import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router';
import { Lock, Unlock, Shield, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { formatPrice, formatDate, formatTime } from '../../data/mockData';
import { getTransaction } from '../../services/transactions';
import { getEvent } from '../../services/events';
import { revealTicket, confirmReceipt } from '../../services/functions';
import { useAuth } from '../../App';

const REVEAL_WINDOW_MS = 4 * 60 * 60 * 1000; // matches server (revealTicket)

export default function SmartRevealPage() {
  const { txnId } = useParams();
  const { user } = useAuth();
  const [txn, setTxn] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticketUrl, setTicketUrl] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(null);

  const refresh = useCallback(async () => {
    const t = await getTransaction(txnId);
    setTxn(t);
    if (t?.eventId) setEvent(await getEvent(t.eventId));
    setLoading(false);
  }, [txnId]);

  useEffect(() => { refresh(); }, [refresh]);

  // Countdown to the reveal window (UX only; the server is authoritative).
  useEffect(() => {
    if (!event?.date) { setCountdown(null); return; }
    const revealAt = Date.parse(event.date) - REVEAL_WINDOW_MS;
    const tick = () => {
      const diff = revealAt - Date.now();
      if (diff <= 0) { setCountdown(null); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [event]);

  const handleReveal = async () => {
    setBusy(true); setError(null);
    try {
      const res = await revealTicket({ txnId });
      setTicketUrl(res.ticketUrl || null);
      await refresh();
    } catch (err) {
      setError(err?.message || 'לא ניתן לחשוף את הכרטיס כרגע.');
    } finally { setBusy(false); }
  };

  const handleConfirm = async () => {
    setBusy(true); setError(null);
    try {
      await confirmReceipt({ txnId });
      await refresh();
    } catch (err) {
      setError(err?.message || 'לא ניתן לאשר קבלה כרגע.');
    } finally { setBusy(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!txn) {
    return <div className="text-center py-12 text-dark-400">העסקה לא נמצאה</div>;
  }

  if (user && txn.buyerId !== user.id) {
    return <div className="text-center py-12 text-dark-400">אין לך הרשאה לצפות בעסקה זו</div>;
  }

  const status = txn.status;

  return (
    <div>
      <h1 className="font-800 text-xl mb-1">Smart Reveal</h1>
      <p className="text-sm text-dark-300 dark:text-dark-400 mb-6">{event?.title || txn.eventTitle}</p>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 mb-4">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-[11px] text-red-600 dark:text-red-300">{error}</span>
        </div>
      )}

      {status === 'created' && (
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-amber-50 dark:bg-amber-600/20 flex items-center justify-center">
            <Lock className="w-12 h-12 text-amber-500" />
          </div>
          <h2 className="font-700 text-lg mb-2">ממתין לתשלום</h2>
          <p className="text-sm text-dark-300 dark:text-dark-400">הכרטיס יינעל בנאמנות ברגע שהתשלום יאושר.</p>
        </div>
      )}

      {status === 'paid' && (
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
            <Lock className="w-12 h-12 text-primary-500 animate-pulse-soft" />
          </div>
          <h2 className="font-700 text-lg mb-2">הכרטיס נעול</h2>
          <p className="text-sm text-dark-300 dark:text-dark-400 mb-4">
            {countdown ? 'הכרטיס ייחשף בעוד' : 'הכרטיס מוכן לחשיפה'}
          </p>
          {countdown && (
            <div className="inline-block px-6 py-3 rounded-2xl bg-dark-800 dark:bg-dark-700 mb-4" dir="ltr">
              <span className="font-mono font-800 text-3xl text-white tracking-wider">{countdown}</span>
            </div>
          )}
          <div className="card-flat my-4 text-right">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-success-500" />
              <span className="text-xs font-600">למה הכרטיס נעול?</span>
            </div>
            <p className="text-xs text-dark-400 leading-relaxed">
              מנגנון Smart Reveal חושף את הכרטיס רק בסמוך לאירוע כדי למנוע העתקה,
              הפצה או שימוש לרעה. החשיפה מאומתת בשרת ומתאפשרת עד 4 שעות לפני האירוע.
            </p>
          </div>
          <button onClick={handleReveal} disabled={busy} className="btn-success w-full text-lg font-700 py-4 disabled:opacity-40 flex items-center justify-center gap-2">
            {busy ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Unlock className="w-5 h-5" />חשוף את הכרטיס</>}
          </button>
        </div>
      )}

      {status === 'revealed' && (
        <div className="text-center animate-bounce-in">
          <div className="card p-6 mb-4">
            <div className="w-56 h-56 mx-auto mb-4 rounded-2xl bg-white dark:bg-dark-800 border-2 border-dashed border-primary-300 flex items-center justify-center overflow-hidden">
              {ticketUrl
                ? <img src={ticketUrl} alt="הכרטיס שלך" className="w-full h-full object-contain" />
                : <p className="text-xs text-dark-400 px-4">הכרטיס נחשף. אם אינך רואה אותו, רענן את העמוד לקבלת קישור מאובטח חדש.</p>}
            </div>
            <p className="text-sm font-600">{event?.title || txn.eventTitle}</p>
            {event?.date && <p className="text-xs text-dark-400">{formatDate(event.date)} · {formatTime(event.date)}</p>}
            {event?.venue && <p className="text-xs text-dark-400">{event.venue}</p>}
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-danger-50 dark:bg-danger-700/15 mb-4">
            <AlertTriangle className="w-4 h-4 text-danger-500 flex-shrink-0" />
            <span className="text-xs text-danger-600 dark:text-danger-300">כרטיס חד-פעמי — הקישור בתוקף למספר דקות בלבד</span>
          </div>
          <button onClick={handleConfirm} disabled={busy} className="btn-primary w-full disabled:opacity-40">
            {busy ? 'מאשר...' : 'אשר קבלת כרטיס תקין'}
          </button>
        </div>
      )}

      {(status === 'released' || status === 'refunded') && (
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-success-500 flex items-center justify-center animate-bounce-in">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="font-700 text-xl mb-2 text-success-600 dark:text-success-400">
            {status === 'released' ? 'העסקה הושלמה!' : 'העסקה זוכתה'}
          </h2>
          <p className="text-sm text-dark-300 dark:text-dark-400 mb-4">
            {status === 'released' ? 'תהנה מהאירוע! הכסף שוחרר למוכר.' : 'הכסף הוחזר אליך.'}
          </p>
          <div className="card-flat">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-success-500" />
              <span className="text-xs font-600 text-success-600 dark:text-success-300">
                {formatPrice(txn.price)} · {status === 'released' ? 'שוחרר למוכר' : 'הוחזר לקונה'}
              </span>
            </div>
          </div>
        </div>
      )}

      {status === 'disputed' && (
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-amber-50 dark:bg-amber-600/20 flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-amber-500" />
          </div>
          <h2 className="font-700 text-lg mb-2">מחלוקת פתוחה</h2>
          <p className="text-sm text-dark-300 dark:text-dark-400">הצוות שלנו בוחן את המקרה. הכסף מוקפא עד להכרעה.</p>
        </div>
      )}
    </div>
  );
}
