// Firebase Admin init for Vercel serverless functions.
// Credentials come from FIREBASE_SERVICE_ACCOUNT (base64-encoded service-account
// JSON) so the whole key rides in one Vercel env var.
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

const PROJECT_ID = 'ticketeasy-cc50c';
const STORAGE_BUCKET = 'ticketeasy-cc50c.appspot.com';

function init() {
  if (getApps().length) return;
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!b64) throw new Error('FIREBASE_SERVICE_ACCOUNT env var is not set');
  const serviceAccount = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  initializeApp({
    credential: cert(serviceAccount),
    projectId: PROJECT_ID,
    storageBucket: STORAGE_BUCKET,
  });
}

init();

export const db = getFirestore();
export const auth = getAuth();
export const bucket = getStorage().bucket();
