#!/usr/bin/env node
/*
 * Deploy firestore.rules to the live project via the Admin SDK Security Rules
 * API. Uses the service account (no interactive login), and does NOT run the
 * firebase CLI's serviceusage API precheck — so it needs only Firebase Rules
 * permissions on the credential, not project-wide serviceusage.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json \
 *     node scripts/deploy-rules.mjs
 */
import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getSecurityRules } from 'firebase-admin/security-rules';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ID = 'ticketeasy-cc50c';
const rulesPath = resolve(__dirname, '../firestore.rules');

function makeApp() {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyPath) {
    return initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, 'utf8'))), projectId: PROJECT_ID });
  }
  return initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
}

async function main() {
  const source = readFileSync(rulesPath, 'utf8');
  console.log(`Deploying ${rulesPath} (${source.length} bytes) to ${PROJECT_ID}...`);
  const sr = getSecurityRules(makeApp());
  await sr.releaseFirestoreRulesetFromSource(source);
  console.log('Firestore rules published successfully.');
}

main().then(() => process.exit(0)).catch((err) => {
  console.error('Deploy failed:', err.message);
  process.exit(1);
});
