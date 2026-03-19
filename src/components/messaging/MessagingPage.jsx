import React, { useState } from 'react';
import { Send, ArrowRight } from 'lucide-react';
import { messages, users } from '../../data/mockData';

export default function MessagingPage() {
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState(messages);
  const otherUser = users.find(u => u.id === 'usr-002');

  const send = () => {
    if (!input.trim()) return;
    setMsgs([...msgs, { id: `msg-${Date.now()}`, fromId: 'usr-001', toId: 'usr-002', text: input, timestamp: new Date().toISOString(), read: false }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 pb-3 border-b border-dark-100 dark:border-dark-600 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center font-700 text-primary-600">{otherUser?.name.charAt(0)}</div>
        <div><p className="font-600 text-sm">{otherUser?.name}</p><p className="text-[10px] text-dark-300">מכבי ת"א vs הפועל ב"ש</p></div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 mb-3">
        {msgs.map(m => (
          <div key={m.id} className={`flex ${m.fromId === 'usr-001' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${m.fromId === 'usr-001' ? 'bg-primary-500 text-white rounded-br-md' : 'bg-dark-100 dark:bg-dark-700 rounded-bl-md'}`}>{m.text}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="כתוב הודעה..." className="input-field flex-1 text-sm" />
        <button onClick={send} className="btn-primary p-3"><Send className="w-5 h-5" /></button>
      </div>
    </div>
  );
}
