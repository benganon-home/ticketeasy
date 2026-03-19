import React, { useState } from 'react';
import { AlertTriangle, Upload, CheckCircle, Clock, Shield } from 'lucide-react';

export default function DisputesPage() {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState('');
  const reasons = ['כרטיס לא עבד בכניסה','כרטיס מזויף','פרטים לא תואמים','המוכר לא העביר כרטיס','אחר'];

  if (step === 2) return (
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

  return (
    <div>
      <h1 className="font-800 text-xl mb-1">פתיחת מחלוקת</h1>
      <p className="text-sm text-dark-300 dark:text-dark-400 mb-6">הכסף מוקפא עד לפתרון — אתה מוגן</p>
      <div className="card-flat mb-4">
        <h3 className="font-600 text-sm mb-3">מה הבעיה?</h3>
        <div className="space-y-2">
          {reasons.map(r => (
            <button key={r} onClick={() => setReason(r)} className={`w-full text-right px-4 py-3 rounded-xl border text-sm transition-all ${reason === r ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/15' : 'border-dark-100 dark:border-dark-600'}`}>{r}</button>
          ))}
        </div>
      </div>
      <div className="card-flat mb-4">
        <h3 className="font-600 text-sm mb-2">פירוט (אופציונלי)</h3>
        <textarea className="input-field text-sm h-24 resize-none" placeholder="תאר את הבעיה..." />
      </div>
      <div className="card-flat mb-4">
        <h3 className="font-600 text-sm mb-2">צרף ראיות</h3>
        <label className="flex items-center justify-center gap-2 py-6 border-2 border-dashed border-dark-200 dark:border-dark-600 rounded-xl cursor-pointer hover:border-primary-400 transition-colors">
          <Upload className="w-5 h-5 text-dark-300" /><span className="text-sm text-dark-400">צילום מסך, תמונה, וידאו</span>
          <input type="file" className="hidden" multiple />
        </label>
      </div>
      <button onClick={() => setStep(2)} disabled={!reason} className="btn-danger w-full disabled:opacity-40 flex items-center justify-center gap-2">
        <AlertTriangle className="w-4 h-4" />פתח מחלוקת
      </button>
    </div>
  );
}
