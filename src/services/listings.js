import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc,
  query, where, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

export async function createListing(data) {
  const ref = await addDoc(collection(db, 'listings'), {
    ...data,
    status: 'active', // active | sold | cancelled
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getListingsForEvent(eventId) {
  // Query by eventId only and filter status client-side, so no composite
  // (eventId + status) index is required.
  const snap = await getDocs(query(
    collection(db, 'listings'),
    where('eventId', '==', eventId)
  ));
  const docs = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(l => l.status === 'active');
  return docs.sort((a, b) => (a.price || 0) - (b.price || 0));
}

export async function getMyListings(uid) {
  const snap = await getDocs(query(
    collection(db, 'listings'),
    where('sellerId', '==', uid)
  ));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getListing(id) {
  const snap = await getDoc(doc(db, 'listings', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateListing(id, data) {
  await updateDoc(doc(db, 'listings', id), { ...data, updatedAt: serverTimestamp() });
}

// Soft-cancel — keeps the record (rules forbid hard delete + preserve history).
export async function cancelListing(id) {
  await updateDoc(doc(db, 'listings', id), { status: 'cancelled', updatedAt: serverTimestamp() });
}
