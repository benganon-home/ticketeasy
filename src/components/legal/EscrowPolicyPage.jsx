import React from 'react';
import { Lock } from 'lucide-react';

export default function EscrowPolicyPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6"><Lock className="w-6 h-6 text-primary-500" /><h1 className="font-800 text-xl">מדיניות Escrow והחזרים</h1></div>
      <p className="text-xs text-dark-300 mb-6">עדכון אחרון: מרץ 2026</p>
      <div className="space-y-6 text-sm text-dark-600 dark:text-dark-300 leading-relaxed">
        <section>
          <h2 className="font-700 text-base mb-2">1. מהו Escrow?</h2>
          <p>Escrow (נאמנות) הוא מנגנון שבו כספי הקונה מוחזקים על ידי צד שלישי מורשה (הסולק הפיננסי) ואינם מועברים ישירות למוכר. מנגנון זה מבטיח שהכסף מוגן עד להשלמת העסקה בהצלחה.</p>
        </section>
        <section>
          <h2 className="font-700 text-base mb-2">2. תהליך התשלום</h2>
          <p>הקונה משלם באמצעות כרטיס אשראי ישראלי דרך סולק מורשה (PayPlus/Tranzila). הסליקה מתבצעת בעיכוב — כלומר, הסכום נתפס בכרטיס האשראי אך לא מועבר לאף צד עד לאישור שחרור.</p>
        </section>
        <section>
          <h2 className="font-700 text-base mb-2">3. תנאי שחרור הכסף למוכר</h2>
          <p>הכסף ישוחרר למוכר כאשר מתקיים לפחות אחד מהתנאים הבאים:</p>
          <p className="mr-4">א. <strong>סריקה מוצלחת</strong> — הכרטיס נסרק בהצלחה בכניסה לאירוע והמערכת אישרה את תקינותו.</p>
          <p className="mr-4">ב. <strong>אישור ידני מהקונה</strong> — הקונה לחץ על "הכל תקין" באפליקציה ואישר שהכרטיס עבד.</p>
          <p className="mr-4">ג. <strong>חלוף 48 שעות</strong> — חלפו 48 שעות מתום האירוע ללא שנפתחה מחלוקת מצד הקונה.</p>
        </section>
        <section>
          <h2 className="font-700 text-base mb-2">4. החזר כספי לקונה</h2>
          <p>הקונה זכאי להחזר כספי מלא (כולל עמלת השירות) במקרים הבאים:</p>
          <p className="mr-4">• הכרטיס לא נסרק או לא עבד בכניסה לאירוע</p>
          <p className="mr-4">• הכרטיס התגלה כמזויף</p>
          <p className="mr-4">• המוכר לא העביר את הכרטיס במועד</p>
          <p className="mr-4">• פרטי הכרטיס אינם תואמים את המפורסם במודעה</p>
          <p className="mr-4">• האירוע בוטל על ידי המפיק (החזר אוטומטי)</p>
          <p className="mt-2">ההחזר יבוצע לכרטיס האשראי ששימש לתשלום תוך 5-10 ימי עסקים.</p>
        </section>
        <section>
          <h2 className="font-700 text-base mb-2">5. תהליך מחלוקת</h2>
          <p>לקונה עומדות 48 שעות מתום האירוע לפתוח מחלוקת. במהלך תקופה זו הכסף מוקפא. צוות TicketEasy יבדוק את המחלוקת ויקבל החלטה תוך 24-48 שעות. ההחלטה עשויה לכלול: החזר מלא לקונה, שחרור הכסף למוכר, או חלוקה בין הצדדים במקרים חריגים.</p>
        </section>
        <section>
          <h2 className="font-700 text-base mb-2">6. ביטול אירוע</h2>
          <p>במידה ואירוע מבוטל על ידי המפיק, כל הקונים יקבלו החזר אוטומטי מלא. המוכרים יקבלו התראה ולא יחויבו. החברה תעשה מאמץ סביר לזהות ביטולי אירועים, אך האחריות הסופית לזיהוי ביטול מוטלת על המשתמשים.</p>
        </section>
        <section>
          <h2 className="font-700 text-base mb-2">7. פיצוי העמלה</h2>
          <p>במקרה של החזר מלא לקונה, עמלת השירות (5%) מוחזרת במלואה. TicketEasy אינה גובה עמלה על עסקאות שלא הושלמו.</p>
        </section>
      </div>
    </div>
  );
}
