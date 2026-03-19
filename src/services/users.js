import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export async function getOrCreateUser(firebaseUser) {
  const ref = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const newUser = {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'משתמש',
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL || null,
      rating: null,
      ratingCount: 0,
      salesCount: 0,
      purchasesCount: 0,
      verified: firebaseUser.emailVerified,
      createdAt: serverTimestamp(),
    };
    await setDoc(ref, newUser);
    return newUser;
  }
  return snap.data();
}

export async function getUser(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function updateUser(uid, data) {
  await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() });
}
