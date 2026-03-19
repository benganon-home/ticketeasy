import React, { useState } from 'react';
import { BarChart3, Users, AlertTriangle, ShieldOff, TrendingUp, Ban } from 'lucide-react';

export default function AdminPage() {
  const [tab, setTab] = useState('overview');
  const stats = [{label:'עסקאות היום',value:'47',icon:BarChart3,trend:'+12%'},{label:'משתמשים חדשים',value:'23',icon:Users,trend:'+8%'},{label:'מחלוקות פתוחות',value:'3',icon:AlertTriangle,trend:'-2'},{label:'ספסרנים שנחסמו',value:'5',icon:ShieldOff,trend:'+1'}];
  const disputes = [
    {id:1,buyer:'דנה לוי',seller:'אבי מזרחי',event:'מכבי ת"א vs הפועל ב"ש',reason:'כרטיס לא עבד',status:'פתוח',amount:'₪130'},
    {id:2,buyer:'נועם ברק',seller:'מיכל אברהם',event:'עידן רייכל',reason:'פרטים לא תואמים',status:'בבדיקה',amount:'₪350'},
  ];

  return (
    <div>
      <h1 className="font-800 text-xl mb-4">פאנל ניהול</h1>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map(({label,value,icon:Icon,trend})=>(
          <div key={label} className="card-flat">
            <div className="flex items-center justify-between mb-2"><Icon className="w-4 h-4 text-primary-500" /><span className="text-[10px] text-success-500 font-600">{trend}</span></div>
            <p className="font-800 text-xl">{value}</p>
            <p className="text-[10px] text-dark-300">{label}</p>
          </div>
        ))}
      </div>

      <h2 className="font-700 text-base mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-danger-400" />מחלוקות פתוחות</h2>
      <div className="space-y-3">
        {disputes.map(d=>(
          <div key={d.id} className="card-flat">
            <div className="flex items-center justify-between mb-2"><span className="font-600 text-sm">{d.event}</span><span className="badge-danger text-[10px]">{d.status}</span></div>
            <p className="text-xs text-dark-400 mb-1">קונה: {d.buyer} · מוכר: {d.seller}</p>
            <p className="text-xs text-dark-400 mb-2">סיבה: {d.reason} · סכום: {d.amount}</p>
            <div className="flex gap-2">
              <button className="btn-success text-xs py-1.5 flex-1">החזר לקונה</button>
              <button className="btn-secondary text-xs py-1.5 flex-1">שחרר למוכר</button>
              <button className="p-1.5 rounded-lg bg-danger-50 dark:bg-danger-700/20"><Ban className="w-4 h-4 text-danger-500" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
