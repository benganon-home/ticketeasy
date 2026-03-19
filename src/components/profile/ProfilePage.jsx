import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Shield, ChevronLeft, Settings, LogOut, HelpCircle, FileText } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useAuth } from '../../App';
import { transactions, events, formatPrice, getStatusLabel } from '../../data/mockData';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('purchases');

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/auth');
  };
  return (
    <div>
      <div className="card mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center text-2xl font-800 text-white flex-shrink-0" style={{background:'var(--gradient-primary)'}}>
            {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : user.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2"><h2 className="font-700 text-lg">{user.name}</h2>{user.verified && <Shield className="w-4 h-4 text-success-500" />}</div>
            <div className="flex items-center gap-1 mt-0.5"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /><span className="text-sm font-600">{user.rating}</span></div>
            <div className="flex gap-2 mt-2"><span className="badge-success text-[10px]">מוכר מאומת</span></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-dark-100 dark:border-dark-600">
          {[{l:'מכירות',v:'23'},{l:'קניות',v:'15'},{l:'ציון אמון',v:'98%'}].map(({l,v})=>(<div key={l} className="text-center"><p className="font-800 text-lg gradient-text">{v}</p><p className="text-[10px] text-dark-300">{l}</p></div>))}
        </div>
      </div>
      <div className="flex gap-1 p-1 rounded-xl bg-dark-50 dark:bg-dark-700 mb-4">
        {['קניות','מכירות','פעילות'].map((l,i)=>(<button key={l} onClick={()=>setTab(l)} className={`flex-1 py-2 rounded-lg text-xs font-600 transition-all ${tab===l?'bg-white dark:bg-dark-600 shadow-sm text-primary-600':'text-dark-400'}`}>{l}</button>))}
      </div>
      <div className="space-y-3 mb-6">
        {transactions.map((txn)=>{const event=events.find(e=>e.id===txn.eventId);const status=getStatusLabel(txn.status);return(
          <Link key={txn.id} to={`/reveal/${txn.id}`} className="card-flat flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"><img src={event?.image} alt="" className="w-full h-full object-cover" /></div>
            <div className="flex-1 min-w-0"><p className="font-600 text-sm truncate">{event?.title}</p><span className={`badge badge-${status.color} text-[9px]`}>{status.icon} {status.text}</span></div>
            <ChevronLeft className="w-4 h-4 text-dark-300" />
          </Link>);})}
      </div>
      <div className="card-flat">
        {[{icon:Settings,label:'הגדרות',to:'#'},{icon:HelpCircle,label:'שאלות נפוצות',to:'/faq'},{icon:FileText,label:'תנאי שימוש',to:'/terms'}].map(({icon:Icon,label,to})=>(
          <Link key={label} to={to} className="flex items-center gap-3 py-3 border-b border-dark-50 dark:border-dark-600 last:border-0"><Icon className="w-4 h-4" /><span className="text-sm font-500 flex-1">{label}</span><ChevronLeft className="w-4 h-4 text-dark-300" /></Link>))}
        <button onClick={handleLogout} className="flex items-center gap-3 py-3 w-full text-danger-500">
          <LogOut className="w-4 h-4" /><span className="text-sm font-500 flex-1 text-right">יציאה</span>
        </button>
      </div>
    </div>
  );
}
