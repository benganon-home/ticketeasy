import {
  collection, doc, addDoc, updateDoc, query,
  where, orderBy, onSnapshot, getDocs, getDoc,
  serverTimestamp, setDoc, limit
} from 'firebase/firestore';
import { db } from '../firebase';

// Get or create a conversation between two users
export async function getOrCreateConversation(uid1, uid2) {
  const convoId = [uid1, uid2].sort().join('_');
  const ref = doc(db, 'conversations', convoId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      participants: [uid1, uid2],
      lastMessage: null,
      lastMessageAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
  }
  return convoId;
}

// Get all conversations for a user
export async function getConversations(uid) {
  const snap = await getDocs(query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', uid),
    orderBy('lastMessageAt', 'desc')
  ));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Listen to messages in a conversation (real-time)
export function subscribeToMessages(convoId, callback) {
  const q = query(
    collection(db, 'conversations', convoId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

// Send a message
export async function sendMessage(convoId, senderId, text) {
  const msgRef = await addDoc(
    collection(db, 'conversations', convoId, 'messages'),
    { senderId, text, createdAt: serverTimestamp(), read: false }
  );
  // Update last message on conversation
  await updateDoc(doc(db, 'conversations', convoId), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
    lastSenderId: senderId,
  });
  return msgRef.id;
}

// Mark messages as read
export async function markAsRead(convoId, uid) {
  const snap = await getDocs(query(
    collection(db, 'conversations', convoId, 'messages'),
    where('read', '==', false),
    where('senderId', '!=', uid)
  ));
  const updates = snap.docs.map(d => updateDoc(d.ref, { read: true }));
  await Promise.all(updates);
}
