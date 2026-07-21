import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Ban, AlertCircle } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { resolveDispute, banUser } from '../../services/functions';
import { formatPrice } from '../../data/mockData';

export default function AdminPage() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const snap = await getDocs(query(
        collection(db, 'disputes'),
        where('status', '==', 'open'),
        orderBy('createdAt', 'desc'),
        limit(50),
      ));
      setDisputes(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      setError(err?.message || 'לא ניתן לטעון מחלוקות.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const resolve = async (disputeId, resolution) => {
    const note = window.prompt(resolution === 'refund' ? 'הערת פתרון (החזר לקונה):' : 'הערת פתרון (שחרור למוכר):');
    if (!note) return;
    setBusyId(disputeId); setError(null);
    try {
      await resolveDispute({ disputeId, resolution, note });
      await load();
    } catch (err) {
      setError(err?.message || 'הפעולה נכשלה.');
    } finally { setBusyId(null); }
  };

  const ban = async (uid) => {
    if (!window.confirm('לחסום את המוכר?')) return;
    setError(null);
    try {
      await banUser({ uid, banned: true });
    } catch (err) {
      setError(err?.message || 'החסימה נכשלה.');
    }
  };

  return (
    <div>
      <h1 className="font-800 text-xl mb-4">פאנל ניהול</h1>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 mb-4">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-[11px] text-red-600 dark:text-red-300">{error}</span>
        </div>
      )}

      <h2 className="font-700 text-base mb-3 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-danger-400" />
        מחלוקות פתוחות {disputes.length > 0 && `(${disputes.length})`}
      </h2>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : disputes.length === 0 ? (
        <div className="card-flat text-center text-sm text-dark-400 py-8">אין מחלוקות פתוחות.</div>
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => (
            <div key={d.id} className="card-flat">
              <div className="flex items-center justify-between mb-2">
                <span className="font-600 text-sm">עסקה {d.txnId?.slice(0, 6)}</span>
                <span className="badge-danger text-[10px]">פתוח</span>
              </div>
              <p className="text-xs text-dark-400 mb-1">קונה: {d.buyerId?.slice(0, 8)} · מוכר: {d.sellerId?.slice(0, 8)}</p>
              <p className="text-xs text-dark-400 mb-2">סיבה: {d.reason}</p>
              <div className="flex gap-2">
                <button onClick={() => resolve(d.id, 'refund')} disabled={busyId === d.id} className="btn-success text-xs py-1.5 flex-1 disabled:opacity-40">החזר לקונה</button>
                <button onClick={() => resolve(d.id, 'release')} disabled={busyId === d.id} className="btn-secondary text-xs py-1.5 flex-1 disabled:opacity-40">שחרר למוכר</button>
                <button onClick={() => ban(d.sellerId)} className="p-1.5 rounded-lg bg-danger-50 dark:bg-danger-700/20" title="חסום מוכר"><Ban className="w-4 h-4 text-danger-500" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
