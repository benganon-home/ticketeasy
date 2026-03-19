import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB0NHCfps8O6gdCX0WEgvodw547P1eluCk",
  authDomain: "ticketeasy-cc50c.firebaseapp.com",
  projectId: "ticketeasy-cc50c",
  storageBucket: "ticketeasy-cc50c.firebasestorage.app",
  messagingSenderId: "382968723010",
  appId: "1:382968723010:web:5d12bc8947d36eabcc5fdb",
  measurementId: "G-7WVT46VPVN",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
