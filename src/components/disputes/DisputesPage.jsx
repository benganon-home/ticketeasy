import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Shield, AlertCircle } from 'lucide-react';
import { getMyPurchases } from '../../services/transactions';
import { openDispute } from '../../services/functions';
import { formatPrice } from '../../data/mockData';
import { useAuth } from '../../App';

const DISPUTABLE = ['paid', 'revealed'];
const REASONS = ['כרטיס לא עבד בכניסה', 'כרטיס מזויף', 'פרטים לא תואמים', 'המוכר לא העביר כרטיס', 'אחר'];

export default function DisputesPage() {
  const { user } = useAuth();
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState('');
  const [detail, setDetail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!user) return;
    getMyPurchases(user.id)
      .then((all) => setTxns(all.filter((t) => DISPUTABLE.includes(t.status))))
      .catch(() => setError('לא ניתן לטעון את העסקאות שלך.'))
      .finally(() => setLoading(false));
  }, [user]);

  const submit = async () => {
    if (!selected || !reason) return;
    setBusy(true); setError(null);
    try {
      const fullReason = detail.trim() ? `${reason} — ${detail.trim()}` : reason;
      await openDispute({ txnId: selected, reason: fullReason });
      setDone(true);
    } catch (err) {
      setError(err?.message || 'לא ניתן לפתוח מחלוקת כרגע.');
    } finally { setBusy(false); }
  };

  if (done) return (
    <div className="text-center py-8 animate-fade-in">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-50 dark:bg-amber-600/20 flex items-center justify-center"><Clock className="w-10 h-10 text-amber-500" /></div>
      <h2 className="font-800 text-xl mb-2">המחלוקת נפתחה</h2>
      <p className="text-sm text-dark-300 dark:text-dark-400 mb-4">הצוות שלנו יבדוק ויחזור אליך תוך 24-48 שעות</p>
      <div className="card-flat text-right mb-4">
        <div className="flex items-center gap-2 mb-2"><Shield className="w-4 h-4 text-primary-500" /><span className="text-xs font-600">הכסף מוקפא</span></div>
        <p className="text-[10px] text-dark-400">הכסף לא ישתחרר למוכר עד לסיום הבירור. אם המחלוקת מוצדקת — תקבל החזר מלא.</p>
      </div>
      <a href="/" className="btn-primary w-full inline-block text-center">חזרה לבית</a>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <h1 className="font-800 text-xl mb-1">פתיחת מחלוקת</h1>
      <p className="text-sm text-dark-300 dark:text-dark-400 mb-6">הכסף מוקפא עד לפתרון — אתה מוגן</p>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 mb-4">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-[11px] text-red-600 dark:text-red-300">{error}</span>
        </div>
      )}

      {txns.length === 0 ? (
        <div className="card-flat text-center text-sm text-dark-400 py-8">
          אין לך עסקאות פעילות שניתן לפתוח עליהן מחלוקת.
        </div>
      ) : (
        <>
          <div className="card-flat mb-4">
            <h3 className="font-600 text-sm mb-3">על איזו עסקה?</h3>
            <div className="space-y-2">
              {txns.map((t) => (
                <button key={t.id} onClick={() => setSelected(t.id)} className={`w-full text-right px-4 py-3 rounded-xl border text-sm transition-all ${selected === t.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/15' : 'border-dark-100 dark:border-dark-600'}`}>
                  <span className="font-600">{t.eventTitle || 'עסקה'}</span>
                  <span className="text-xs text-dark-400 block">{formatPrice(t.price)} · {t.status === 'revealed' ? 'כרטיס נחשף' : 'שולם'}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card-flat mb-4">
            <h3 className="font-600 text-sm mb-3">מה הבעיה?</h3>
            <div className="space-y-2">
              {REASONS.map((r) => (
                <button key={r} onClick={() => setReason(r)} className={`w-full text-right px-4 py-3 rounded-xl border text-sm transition-all ${reason === r ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/15' : 'border-dark-100 dark:border-dark-600'}`}>{r}</button>
              ))}
            </div>
          </div>

          <div className="card-flat mb-4">
            <h3 className="font-600 text-sm mb-2">פירוט (אופציונלי)</h3>
            <textarea value={detail} onChange={(e) => setDetail(e.target.value)} className="input-field text-sm h-24 resize-none" placeholder="תאר את הבעיה..." maxLength={2000} />
          </div>

          <button onClick={submit} disabled={!selected || !reason || busy} className="btn-danger w-full disabled:opacity-40 flex items-center justify-center gap-2">
            {busy ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><AlertTriangle className="w-4 h-4" />פתח מחלוקת</>}
          </button>
        </>
      )}
    </div>
  );
}
