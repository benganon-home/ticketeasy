#!/usr/bin/env node
/*
 * Bootstrap an admin. Grants the `admin: true` custom claim to a user by email.
 * Run locally with a service account (NEVER shipped to the browser):
 *
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json \
 *     node scripts/set-admin.mjs ben@example.com
 *
 * After this, further admin grants should go through the setAdminClaim
 * callable (which is itself admin-gated + audit-logged).
 */
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'node:fs';

const PROJECT_ID = 'ticketeasy-cc50c';
const email = process.argv[2];
const revoke = process.argv.includes('--revoke');

if (!email) {
  console.error('Usage: node scripts/set-admin.mjs <email> [--revoke]');
  process.exit(1);
}

function makeApp() {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyPath) {
    return initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, 'utf8'))), projectId: PROJECT_ID });
  }
  return initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
}

async function main() {
  const auth = getAuth(makeApp());
  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, { admin: !revoke });
  console.log(`${revoke ? 'Revoked admin from' : 'Granted admin to'} ${email} (${user.uid}).`);
  console.log('The user must sign out and back in (or refresh their ID token) for the claim to take effect.');
}

main().then(() => process.exit(0)).catch((err) => { console.error(err.message); process.exit(1); });
