import { collection, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { createTransaction as createTransactionFn } from './functions';

// Transaction CREATION and all status transitions run server-side via Cloud
// Functions (see src/services/functions.js). The client only READS here.

// Buyer initiates a purchase — server computes price/fee/total from the
// listing and returns { txnId }.
export async function createTransaction(listingId) {
  const { txnId } = await createTransactionFn({ listingId });
  return txnId;
}

export async function getTransaction(id) {
  const snap = await getDoc(doc(db, 'transactions', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
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
