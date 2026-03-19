import React, { useState } from 'react';
import { ChevronDown, Search, MessageCircle, Send } from 'lucide-react';
import { faqItems } from '../../data/mockData';

export default function FAQPage() {
  const [openId, setOpenId] = useState(null);
  const [query, setQuery] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [chatMsgs, setChatMsgs] = useState([{from:'bot',text:'היי! איך אפשר לעזור? 😊'}]);

  const filtered = faqItems.map(cat => ({
    ...cat,
    items: cat.items.filter(i => !query || i.q.includes(query) || i.a.includes(query))
  })).filter(cat => cat.items.length > 0);

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    setChatMsgs(p => [...p, {from:'user',text:chatMsg}, {from:'bot',text:'תודה על הפנייה! נציג יחזור אליך בהקדם. בינתיים, בדוק את השאלות הנפוצות למעלה 📖'}]);
    setChatMsg('');
  };

  return (
    <div>
      <h1 className="font-800 text-xl mb-1">שאלות נפוצות</h1>
      <p className="text-sm text-dark-300 dark:text-dark-400 mb-4">מצא תשובות מהירות</p>
      <div className="relative mb-4">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-300" />
        <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="חפש שאלה..." className="input-field pr-10 text-sm" />
      </div>
      {filtered.map(cat => (
        <div key={cat.category} className="mb-4">
          <h2 className="font-700 text-sm mb-2 text-primary-600 dark:text-primary-400">{cat.category}</h2>
          {cat.items.map((item, i) => {
            const id = `${cat.category}-${i}`;
            return (
              <div key={id} className="card-flat mb-2">
                <button onClick={() => setOpenId(openId === id ? null : id)} className="w-full flex items-center justify-between text-right">
                  <span className="text-sm font-600 flex-1">{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-dark-300 transition-transform flex-shrink-0 ${openId === id ? 'rotate-180' : ''}`} />
                </button>
                {openId === id && <p className="text-xs text-dark-400 mt-2 leading-relaxed">{item.a}</p>}
              </div>
            );
          })}
        </div>
      ))}

      {/* Chat bot */}
      <button onClick={() => setChatOpen(!chatOpen)} className="fixed bottom-20 left-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-40" style={{background:'var(--gradient-primary)'}}>
        <MessageCircle className="w-6 h-6 text-white" />
      </button>
      {chatOpen && (
        <div className="fixed bottom-36 left-4 w-72 bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-dark-100 dark:border-dark-700 z-50 overflow-hidden animate-slide-up">
          <div className="p-3 border-b border-dark-100 dark:border-dark-700" style={{background:'var(--gradient-primary)'}}>
            <p className="text-white font-600 text-sm">צ׳אט תמיכה</p>
          </div>
          <div className="h-48 overflow-y-auto p-3 space-y-2">
            {chatMsgs.map((m,i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs ${m.from === 'user' ? 'bg-primary-500 text-white' : 'bg-dark-50 dark:bg-dark-700'}`}>{m.text}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 p-2 border-t border-dark-100 dark:border-dark-700">
            <input type="text" value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key==='Enter' && sendChat()} placeholder="כתוב..." className="input-field text-xs flex-1 py-2" />
            <button onClick={sendChat} className="p-2 rounded-lg bg-primary-500 text-white"><Send className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
