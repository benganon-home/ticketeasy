import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Clock, Zap, Star, ArrowLeft, Lock, Users, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative px-6 pt-16 pb-20 overflow-hidden" style={{background:'var(--gradient-hero)'}}>
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="absolute bottom-10 right-5 w-60 h-60 rounded-full bg-purple-400/10 blur-3xl" />
        <div className="relative z-10 max-w-lg mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6">
            <img src="/icons/favicon.svg" alt="" className="w-5 h-5" />
            <span className="text-xs text-white/80 font-500">פלטפורמה מאובטחת #1 בישראל</span>
          </div>
          <h1 className="text-white font-heebo font-900 text-4xl mb-4 leading-tight">
            כרטיסים יד שנייה
            <br />
            <span className="gradient-text text-5xl">בלי לפחד</span>
          </h1>
          <p className="text-dark-200 text-base mb-8 font-300 max-w-sm mx-auto">
            קנה מישהו אחר — הכסף שלך מוגן אצלנו עד שהכרטיס אמיתי.
            לא עבד? מקבל הכל בחזרה.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn-primary text-lg py-4 px-8 flex items-center justify-center gap-2">
              התחל עכשיו <ArrowLeft className="w-5 h-5" />
            </Link>
            <a href="#how" className="btn-secondary text-lg py-4 px-8 border-white/30 text-white hover:bg-white/10">
              איך זה עובד?
            </a>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div id="how" className="px-6 py-16 max-w-lg mx-auto">
        <h2 className="font-800 text-2xl text-center mb-8">איך TicketEasy עובד?</h2>
        <div className="space-y-6">
          {[
            {step:'1',icon:Users,title:'מוכר מעלה כרטיס',desc:'מצלמים את הכרטיס, המערכת מאמתת אותו ובודקת שהוא לא מופיע כפול.',color:'coral'},
            {step:'2',icon:Lock,title:'קונה משלם — הכסף אצלנו',desc:'הכסף לא עובר למוכר עד שנכנסת לאירוע. בינתיים הוא מוגן אצלנו.',color:'amber'},
            {step:'3',icon:Clock,title:'הכרטיס מגיע אליך שעתיים לפני',desc:'ישר לנייד. לא ניתן להעתיק — ככה יודעים שהוא אמיתי ולא זיוף.',color:'primary'},
            {step:'4',icon:CheckCircle,title:'נכנסת? הכסף עובר למוכר',desc:'הכרטיס נסרק בכניסה — המוכר מקבל את כספו. לא עבד? מחזירים לך הכל.',color:'success'},
          ].map(({step,icon:Icon,title,desc,color})=>(
            <div key={step} className="flex gap-4 items-start">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 bg-${color}-50 dark:bg-${color}-700/20`}>
                <Icon className={`w-6 h-6 text-${color}-500`} />
              </div>
              <div>
                <p className="text-xs text-dark-300 mb-0.5">שלב {step}</p>
                <h3 className="font-700 text-base mb-1">{title}</h3>
                <p className="text-sm text-dark-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust */}
      <div className="px-6 py-12 bg-dark-50 dark:bg-dark-800">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="font-800 text-2xl mb-6">למה TicketEasy?</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              {icon:'🔒',title:'הכסף מוגן',desc:'אצלנו עד שנכנסת בשער'},
              {icon:'🚫',title:'מחיר הוגן',desc:'תקרה קבועה, בלי ניפוח'},
              {icon:'📱',title:'כרטיס שלא ניתן לזייף',desc:'מגיע שעתיים לפני, חד פעמי'},
              {icon:'⭐',title:'מוכרים עם דירוג',desc:'ביקורות אמיתיות בלבד'},
              {icon:'💬',title:'תקשורת ישירה',desc:'דברו עם המוכר באפליקציה'},
              {icon:'↩️',title:'לא עבד? מחזירים',desc:'החזר מלא, ללא שאלות'},
            ].map(({icon,title,desc})=>(
              <div key={title} className="card text-center">
                <span className="text-2xl mb-2 block">{icon}</span>
                <h3 className="font-700 text-sm mb-0.5">{title}</h3>
                <p className="text-xs text-dark-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 py-16 text-center" style={{background:'var(--gradient-hero)'}}>
        <h2 className="text-white font-800 text-2xl mb-4">מוכנים?</h2>
        <p className="text-dark-200 mb-6">הצטרפו לאלפי ישראלים שמצאו כרטיסים בלי לקחת סיכון</p>
        <Link to="/" className="btn-primary text-lg py-4 px-10 inline-flex items-center gap-2">
          כניסה לאתר <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {/* Footer */}
      <div className="px-6 py-8 bg-dark-900 text-center">
        <p className="text-dark-400 text-xs mb-3">© 2026 TicketEasy. כל הזכויות שמורות.</p>
        <div className="flex flex-wrap gap-4 justify-center text-xs text-dark-500">
          <Link to="/terms" className="hover:text-primary-400">תנאי שימוש</Link>
          <Link to="/escrow-policy" className="hover:text-primary-400">הגנת תשלום</Link>
          <Link to="/disclaimer" className="hover:text-primary-400">כתב ויתור</Link>
          <Link to="/privacy" className="hover:text-primary-400">פרטיות</Link>
        </div>
      </div>
    </div>
  );
}
