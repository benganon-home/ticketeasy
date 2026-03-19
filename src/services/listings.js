import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp
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
  const snap = await getDocs(query(
    collection(db, 'listings'),
    where('eventId', '==', eventId),
    where('status', '==', 'active'),
    orderBy('price', 'asc')
  ));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getMyListings(uid) {
  const snap = await getDocs(query(
    collection(db, 'listings'),
    where('sellerId', '==', uid),
    orderBy('createdAt', 'desc')
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

export async function deleteListing(id) {
  await deleteDoc(doc(db, 'listings', id));
}
