import {
  collection, doc, getDoc, addDoc, updateDoc,
  query, where, orderBy, getDocs, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

export async function createTransaction(data) {
  const ref = await addDoc(collection(db, 'transactions'), {
    ...data,
    status: 'pending_payment', // pending_payment | escrow | revealed | scanned | completed | disputed | refunded
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getTransaction(id) {
  const snap = await getDoc(doc(db, 'transactions', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateTransaction(id, data) {
  await updateDoc(doc(db, 'transactions', id), { ...data, updatedAt: serverTimestamp() });
}

export async function getMyPurchases(uid) {
  const snap = await getDocs(query(
    collection(db, 'transactions'),
    where('buyerId', '==', uid)
  ));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getMySales(uid) {
  const snap = await getDocs(query(
    collection(db, 'transactions'),
    where('sellerId', '==', uid)
  ));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
