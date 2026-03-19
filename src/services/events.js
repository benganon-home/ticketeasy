import {
  collection, doc, getDoc, getDocs, query,
  where, orderBy, limit, serverTimestamp, addDoc
} from 'firebase/firestore';
import { db } from '../firebase';

export async function getEvents({ category, search, sort = 'hotness', max = 20 } = {}) {
  let q = collection(db, 'events');
  const constraints = [where('active', '==', true)];
  if (category) constraints.push(where('category', '==', category));
  if (sort === 'hotness') constraints.push(orderBy('hotness', 'desc'));
  else if (sort === 'date') constraints.push(orderBy('date', 'asc'));
  else if (sort === 'price') constraints.push(orderBy('minPrice', 'asc'));
  constraints.push(limit(max));
  const snap = await getDocs(query(q, ...constraints));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getEvent(id) {
  const snap = await getDoc(doc(db, 'events', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function searchEvents(term) {
  // Basic client-side search — replace with Algolia/Typesense for production
  const snap = await getDocs(query(collection(db, 'events'), where('active', '==', true), limit(50)));
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const t = term.toLowerCase();
  return all.filter(e =>
    e.title?.toLowerCase().includes(t) ||
    e.artist?.toLowerCase().includes(t) ||
    e.venue?.toLowerCase().includes(t) ||
    e.city?.toLowerCase().includes(t)
  );
}
