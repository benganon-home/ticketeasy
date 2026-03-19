import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Shield, ChevronLeft, Settings, LogOut, HelpCircle, FileText } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth } from '../../App';
import { formatPrice } from '../../data/mockData';
import { getMyPurchases, getMySales } from '../../services/transactions';
import { getMyListings } from '../../services/listings';

const STATUS_LABELS = {
  pending_payment: { text: 'ממתין לתשלום', color: 'warning' },
  escrow: { text: 'בנאמנות', color: 'primary' },
  revealed: { text: 'הכרטיס נחשף', color: 'primary' },
  scanned: { text: 'נסרק', color: 'success' },
  completed: { text: 'הושלם', color: 'success' },
  disputed: { text: 'במחלוקת', color: 'danger' },
  refunded: { text: 'הוחזר', color: 'dark' },
  active: { text: 'פעיל', color: 'success' },
  sold: { text: 'נמכר', color: 'dark' },
  cancelled: { text: 'בוטל', color: 'danger' },
};

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('קניות');
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      getMyPurchases(user.id).catch(() => []),
      getMySales(user.id).catch(() => []),
      getMyListings(user.id).catch(() => []),
    ]).then(([p, s, l]) => {
      setPurchases(p);
      setSales(s);
      setListings(l);
      setLoading(false);
    });
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/auth');
  };

  const tabItems = tab === 'קניות' ? purchases : tab === 'מכירות' ? sales : listings;

  return (
    <div>
      <div className="card mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center text-2xl font-800 text-white flex-shrink-0" style={{ background: 'var(--gradient-primary)' }}>
            {user.photoURL
              ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
              : user.name.charAt(0)
            }
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-700 text-lg">{user.name}</h2>
              {user.verified && <Shield className="w-4 h-4 text-success-500" />}
            </div>
            {user.rating && (
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span className="text-sm font-600">{user.rating}</span>
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <span className="badge-success text-[10px]">מוכר מאומת</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-dark-100 dark:border-dark-600">
          {[
            { l: 'מכירות', v: user.salesCount ?? sales.length },
            { l: 'קניות', v: user.purchasesCount ?? purchases.length },
            { l: 'מודעות', v: listings.length },
          ].map(({ l, v }) => (
            <div key={l} className="text-center">
              <p className="font-800 text-lg gradient-text">{v}</p>
              <p className="text-[10px] text-dark-300">{l}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-dark-50 dark:bg-dark-700 mb-4">
        {['קניות', 'מכירות', 'מודעות'].map((l) => (
          <button key={l} onClick={() => setTab(l)} className={`flex-1 py-2 rounded-lg text-xs font-600 transition-all ${tab === l ? 'bg-white dark:bg-dark-600 shadow-sm text-primary-600' : 'text-dark-400'}`}>{l}</button>
        ))}
      </div>

      <div className="space-y-3 mb-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tabItems.length === 0 ? (
          <div className="text-center py-8 card-flat">
            <p className="text-dark-400 text-sm">אין פריטים עדיין</p>
          </div>
        ) : tabItems.map((item) => {
          const statusKey = item.status || 'active';
          const status = STATUS_LABELS[statusKey] || { text: statusKey, color: 'dark' };
          return (
            <Link key={item.id} to={tab === 'מודעות' ? '#' : `/reveal/${item.id}`} className="card-flat flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🎫</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-600 text-sm truncate">{item.eventTitle || 'כרטיס'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`badge badge-${status.color} text-[9px]`}>{status.text}</span>
                  {item.price && <span className="text-[10px] text-dark-400">{formatPrice(item.price)}</span>}
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-dark-300" />
            </Link>
          );
        })}
      </div>

      <div className="card-flat">
        {[
          { icon: Settings, label: 'הגדרות', to: '#' },
          { icon: HelpCircle, label: 'שאלות נפוצות', to: '/faq' },
          { icon: FileText, label: 'תנאי שימוש', to: '/terms' },
        ].map(({ icon: Icon, label, to }) => (
          <Link key={label} to={to} className="flex items-center gap-3 py-3 border-b border-dark-50 dark:border-dark-600 last:border-0">
            <Icon className="w-4 h-4" />
            <span className="text-sm font-500 flex-1">{label}</span>
            <ChevronLeft className="w-4 h-4 text-dark-300" />
          </Link>
        ))}
        <button onClick={handleLogout} className="flex items-center gap-3 py-3 w-full text-danger-500">
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-500 flex-1 text-right">יציאה</span>
        </button>
      </div>
    </div>
  );
}
