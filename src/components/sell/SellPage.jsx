import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, Camera, Shield, AlertTriangle, CheckCircle, Tag, Info, Search } from 'lucide-react';
import { categories, formatPrice } from '../../data/mockData';
import { createListing } from '../../services/listings';
import { searchEvents } from '../../services/events';
import { useAuth } from '../../App';

export default function SellPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ event: '', eventId: '', category: '', originalPrice: '', askPrice: '', section: '', row: '', seats: '', quantity: '1' });
  const [ocrDone, setOcrDone] = useState(false);
  const [duplicateCheck, setDuplicateCheck] = useState(null);
  const [saving, setSaving] = useState(false);
  const [eventSuggestions, setEventSuggestions] = useState([]);
  const [searchingEvents, setSearchingEvents] = useState(false);

  const maxPrice = form.originalPrice ? Math.round(form.originalPrice * 1.2) : 0;
  const priceValid = form.askPrice && form.originalPrice && +form.askPrice <= maxPrice;

  const simulateOCR = () => {
    setTimeout(() => {
      setForm(f => ({ ...f, event: 'מכבי תל אביב vs הפועל באר שבע', category: 'sports', originalPrice: '120', section: 'יציע מזרחי', row: '15', seats: '8-9' }));
      setOcrDone(true);
      setDuplicateCheck('clear');
    }, 2000);
  };

  const handleFileUpload = (e) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); simulateOCR(); }
  };

  const handleEventSearch = async (val) => {
    setForm(f => ({ ...f, event: val, eventId: '' }));
    if (val.length < 2) { setEventSuggestions([]); return; }
    setSearchingEvents(true);
    const results = await searchEvents(val);
    setEventSuggestions(results.slice(0, 5));
    setSearchingEvents(false);
  };

  const handleSelectEvent = (ev) => {
    setForm(f => ({ ...f, event: ev.title, eventId: ev.id, category: ev.category, originalPrice: String(ev.originalPrice || ev.minPrice || '') }));
    setEventSuggestions([]);
  };

  const handlePublish = async () => {
    if (!priceValid || !form.event || !user) return;
    setSaving(true);
    try {
      await createListing({
        eventTitle: form.event,
        eventId: form.eventId || null,
        category: form.category,
        originalPrice: +form.originalPrice,
        price: +form.askPrice,
        section: form.section,
        row: form.row,
        seats: form.seats,
        quantity: +form.quantity,
        sellerId: user.id,
        sellerName: user.name,
        sellerRating: user.rating || null,
        sellerPhotoURL: user.photoURL || null,
      });
      setStep(3);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (step === 3) {
    return (
      <div className="text-center py-8 animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-success-50 dark:bg-success-700/20 flex items-center justify-center animate-bounce-in">
          <CheckCircle className="w-10 h-10 text-success-500" />
        </div>
        <h2 className="font-800 text-xl mb-2">הכרטיס עלה בהצלחה!</h2>
        <p className="text-sm text-dark-300 dark:text-dark-400 mb-4">המודעה חיה באתר. נודיע לך כשמישהו מתעניין.</p>
        <div className="card-flat mb-4 text-right">
          {[
            { icon: '✅', text: 'כרטיס אומת ונעול במערכת' },
            { icon: '🔒', text: 'לא ניתן להעלות כרטיס זהה שוב' },
            { icon: '📱', text: 'תקבל התראה כשמישהו מתעניין' },
            { icon: '💰', text: 'כסף ישוחרר רק אחרי אימות הכרטיס' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2 py-2 border-b border-dark-50 dark:border-dark-600 last:border-0">
              <span>{icon}</span><span className="text-xs">{text}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Link to="/" className="btn-secondary flex-1">חזרה לבית</Link>
          <Link to="/profile" className="btn-primary flex-1">המודעות שלי</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-800 text-xl mb-1">מכירת כרטיס</h1>
      <p className="text-sm text-dark-300 dark:text-dark-400 mb-6">העלה את הכרטיס ואנחנו נטפל בשאר</p>

      <div className="flex items-center gap-2 mb-6">
        {['העלאה', 'פרטים'].map((label, i) => (
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
          <div className="border-2 border-dashed border-dark-200 dark:border-dark-600 rounded-2xl p-8 text-center mb-4 hover:border-primary-400 transition-colors">
            {!file ? (
              <>
                <Upload className="w-10 h-10 text-dark-300 mx-auto mb-3" />
                <p className="font-600 text-sm mb-1">העלה את הכרטיס</p>
                <p className="text-xs text-dark-300 dark:text-dark-400 mb-4">PDF, צילום מסך, או תמונה</p>
                <label className="btn-primary cursor-pointer inline-flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  בחר קובץ
                  <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileUpload} />
                </label>
              </>
            ) : !ocrDone ? (
              <div>
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="font-600 text-sm mb-1">מנתח את הכרטיס...</p>
                <p className="text-xs text-dark-300">OCR + בדיקת כפילויות + חילוץ ברקוד</p>
              </div>
            ) : (
              <div>
                <CheckCircle className="w-10 h-10 text-success-500 mx-auto mb-3" />
                <p className="font-600 text-sm text-success-600 dark:text-success-400 mb-1">הכרטיס אומת!</p>
                <p className="text-xs text-dark-300">{file.name}</p>
                <button onClick={() => { setFile(null); setOcrDone(false); }} className="text-xs text-primary-500 mt-2 underline">החלף קובץ</button>
              </div>
            )}
          </div>

          {duplicateCheck === 'clear' && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-success-50 dark:bg-success-700/15 mb-4 animate-slide-up">
              <Shield className="w-4 h-4 text-success-500" />
              <span className="text-xs text-success-600 dark:text-success-300">כרטיס ייחודי — לא נמצאו כפילויות</span>
            </div>
          )}

          {duplicateCheck === 'duplicate' && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-danger-50 dark:bg-danger-700/15 mb-4">
              <AlertTriangle className="w-4 h-4 text-danger-500" />
              <span className="text-xs text-danger-600 dark:text-danger-300">כרטיס זה כבר קיים במערכת!</span>
            </div>
          )}

          <button onClick={() => setStep(2)} disabled={!ocrDone} className="btn-primary w-full disabled:opacity-40">
            המשך לפרטים
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-in">
          <div className="card-flat mb-4">
            <h3 className="font-600 text-sm mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary-500" />פרטים שזוהו אוטומטית
            </h3>
            <div className="space-y-3">
              <div className="relative">
                <label className="text-xs font-600 text-dark-400 block mb-1">אירוע</label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.event}
                    onChange={(e) => handleEventSearch(e.target.value)}
                    className="input-field text-sm pl-8"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300" />
                </div>
                {form.eventId && (
                  <span className="text-[10px] text-success-500 mt-0.5 block">✓ מקושר לאירוע במערכת</span>
                )}
                {eventSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-800 rounded-xl shadow-lg border border-dark-100 dark:border-dark-600 overflow-hidden">
                    {eventSuggestions.map((ev) => (
                      <button
                        key={ev.id}
                        onClick={() => handleSelectEvent(ev)}
                        className="w-full text-right px-3 py-2 text-sm hover:bg-dark-50 dark:hover:bg-dark-700 border-b border-dark-50 dark:border-dark-700 last:border-0"
                      >
                        {ev.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-600 text-dark-400 block mb-1">קטגוריה</label>
                <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="input-field text-sm">
                  <option value="">בחר קטגוריה</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div><label className="text-xs font-600 text-dark-400 block mb-1">אזור</label>
                  <input type="text" value={form.section} onChange={(e) => setForm({...form, section: e.target.value})} className="input-field text-sm" /></div>
                <div><label className="text-xs font-600 text-dark-400 block mb-1">שורה</label>
                  <input type="text" value={form.row} onChange={(e) => setForm({...form, row: e.target.value})} className="input-field text-sm" /></div>
                <div><label className="text-xs font-600 text-dark-400 block mb-1">מושבים</label>
                  <input type="text" value={form.seats} onChange={(e) => setForm({...form, seats: e.target.value})} className="input-field text-sm" /></div>
              </div>
              <div>
                <label className="text-xs font-600 text-dark-400 block mb-1">כמות</label>
                <select value={form.quantity} onChange={(e) => setForm({...form, quantity: e.target.value})} className="input-field text-sm">
                  {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <span className="text-[10px] text-dark-300 mt-0.5 block">מקסימום 4 כרטיסים לאותו אירוע</span>
              </div>
            </div>
          </div>

          <div className="card-flat mb-4">
            <h3 className="font-600 text-sm mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary-500" />תמחור
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-600 text-dark-400 block mb-1">מחיר מקורי</label>
                <div className="relative">
                  <input type="number" value={form.originalPrice} onChange={(e) => setForm({...form, originalPrice: e.target.value})} className="input-field text-sm pr-8" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-300 text-sm">₪</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-600 text-dark-400 block mb-1">
                  מחיר מבוקש <span className="text-dark-300">(מקסימום {maxPrice > 0 ? formatPrice(maxPrice) : '—'})</span>
                </label>
                <div className="relative">
                  <input type="number" value={form.askPrice} onChange={(e) => setForm({...form, askPrice: e.target.value})} className="input-field text-sm pr-8" max={maxPrice} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-300 text-sm">₪</span>
                </div>
              </div>
              {form.askPrice && !priceValid && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-danger-50 dark:bg-danger-700/15">
                  <AlertTriangle className="w-3.5 h-3.5 text-danger-500" />
                  <span className="text-[10px] text-danger-600 dark:text-danger-300">מחיר חורג מתקרת 20% — {formatPrice(maxPrice)} מקסימום</span>
                </div>
              )}
              {priceValid && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-success-50 dark:bg-success-700/15">
                  <CheckCircle className="w-3.5 h-3.5 text-success-500" />
                  <span className="text-[10px] text-success-600 dark:text-success-300">מחיר תקין — {((+form.askPrice / +form.originalPrice - 1) * 100).toFixed(0)}% מעל המקור</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">חזרה</button>
            <button onClick={handlePublish} disabled={!priceValid || !form.event || saving} className="btn-primary flex-1 disabled:opacity-40">
              {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : 'פרסם כרטיס'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
