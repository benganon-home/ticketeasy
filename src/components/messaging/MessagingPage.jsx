import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { Send, ArrowRight } from 'lucide-react';
import { useAuth } from '../../App';
import {
  getConversations,
  subscribeToMessages,
  sendMessage,
  markAsRead,
} from '../../services/messages';
import { getUser } from '../../services/users';

export default function MessagingPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activeConvoId, setActiveConvoId] = useState(location.state?.convoId || null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [names, setNames] = useState({}); // uid -> { name, photoURL }
  const bottomRef = useRef(null);

  const displayName = (uid) => names[uid]?.name || 'משתמש';

  // Load conversation list + resolve the other participants' names
  useEffect(() => {
    if (!user) return;
    getConversations(user.id).then(async (convos) => {
      setConversations(convos);
      setLoadingConvos(false);
      const otherIds = [...new Set(convos.flatMap((c) => c.participants || []).filter((p) => p !== user.id))];
      const resolved = await Promise.all(otherIds.map((uid) => getUser(uid).catch(() => null)));
      const map = {};
      otherIds.forEach((uid, i) => { map[uid] = { name: resolved[i]?.name || null, photoURL: resolved[i]?.photoURL || null }; });
      setNames(map);
    });
  }, [user]);

  // Subscribe to messages in active conversation
  useEffect(() => {
    if (!activeConvoId) return;
    const unsubscribe = subscribeToMessages(activeConvoId, (msgs) => {
      setMessages(msgs);
      markAsRead(activeConvoId, user.id);
    });
    return unsubscribe;
  }, [activeConvoId, user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeConvoId) return;
    const text = input;
    setInput('');
    await sendMessage(activeConvoId, user.id, text);
  };

  const activeConvo = conversations.find((c) => c.id === activeConvoId);
  const otherParticipantId = activeConvo?.participants?.find((p) => p !== user?.id) || location.state?.otherId;
  const otherName = names[otherParticipantId]?.name || location.state?.otherName || 'משתמש';

  // Conversation list view
  if (!activeConvoId) {
    return (
      <div>
        <h1 className="font-800 text-xl mb-4">הודעות</h1>
        {loadingConvos ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12 card-flat">
            <span className="text-3xl mb-3 block">💬</span>
            <p className="font-600 mb-1">אין שיחות עדיין</p>
            <p className="text-xs text-dark-400">כשתצור קשר עם מוכר, השיחה תופיע כאן</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((convo) => {
              const otherId = convo.participants?.find((p) => p !== user?.id);
              return (
                <button
                  key={convo.id}
                  onClick={() => setActiveConvoId(convo.id)}
                  className="card-flat w-full text-right flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-700 text-primary-600 flex-shrink-0 overflow-hidden">
                    {names[otherId]?.photoURL
                      ? <img src={names[otherId].photoURL} alt="" className="w-full h-full object-cover" />
                      : displayName(otherId).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-600 text-sm truncate">{displayName(otherId)}</p>
                    <p className="text-xs text-dark-400 truncate">{convo.lastMessage || 'אין הודעות עדיין'}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Chat view
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 pb-3 border-b border-dark-100 dark:border-dark-600 mb-3">
        <button onClick={() => { setActiveConvoId(null); setMessages([]); }} className="p-1">
          <ArrowRight className="w-5 h-5 text-dark-400" />
        </button>
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-700 text-primary-600 overflow-hidden">
          {names[otherParticipantId]?.photoURL
            ? <img src={names[otherParticipantId].photoURL} alt="" className="w-full h-full object-cover" />
            : otherName.charAt(0).toUpperCase()}
        </div>
        <p className="font-600 text-sm">{otherName}</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 mb-3 px-1">
        {messages.length === 0 && (
          <p className="text-center text-xs text-dark-400 py-6">אין הודעות עדיין — שלח הודעה ראשונה!</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.senderId === user?.id ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
              m.senderId === user?.id
                ? 'bg-primary-500 text-white rounded-br-md'
                : 'bg-dark-100 dark:bg-dark-700 rounded-bl-md'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="כתוב הודעה..."
          className="input-field flex-1 text-sm"
        />
        <button onClick={handleSend} disabled={!input.trim()} className="btn-primary p-3 disabled:opacity-40">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
