/**
 * Firestore rules attack-case suite. Each test asserts that a bypass attempt
 * is DENIED and that the legitimate action is ALLOWED.
 *
 * Run:  cd tests/rules && npm test
 * (firebase emulators:exec boots the firestore emulator and loads
 *  ../../firestore.rules via the repo's firebase.json)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { beforeAll, afterAll, beforeEach, describe, it } from 'vitest';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ID = 'demo-ticketeasy';

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf8') },
  });
});

afterAll(async () => { await testEnv?.cleanup(); });
beforeEach(async () => { await testEnv.clearFirestore(); });

const alice = () => testEnv.authenticatedContext('alice').firestore();
const bob = () => testEnv.authenticatedContext('bob').firestore();
const admin = () => testEnv.authenticatedContext('root', { admin: true }).firestore();
const anon = () => testEnv.unauthenticatedContext().firestore();

// Seed helper that bypasses rules.
async function seed(fn) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => fn(ctx.firestore()));
}

describe('users', () => {
  it('denies anonymous reads', async () => {
    await seed((db) => setDoc(doc(db, 'users/alice'), { name: 'Alice', rating: null }));
    await assertFails(getDoc(doc(anon(), 'users/alice')));
  });

  it('lets a user edit only profile fields', async () => {
    await seed((db) => setDoc(doc(db, 'users/alice'), { uid: 'alice', name: 'A', rating: null, ratingCount: 0, salesCount: 0, purchasesCount: 0 }));
    await assertSucceeds(updateDoc(doc(alice(), 'users/alice'), { name: 'Alice New' }));
  });

  it('DENIES a user setting their own rating', async () => {
    await seed((db) => setDoc(doc(db, 'users/alice'), { uid: 'alice', name: 'A', rating: null, ratingCount: 0 }));
    await assertFails(updateDoc(doc(alice(), 'users/alice'), { rating: 5, ratingCount: 999 }));
  });

  it('DENIES a user granting themselves admin', async () => {
    await seed((db) => setDoc(doc(db, 'users/alice'), { uid: 'alice', name: 'A', rating: null }));
    await assertFails(updateDoc(doc(alice(), 'users/alice'), { admin: true }));
  });

  it('DENIES editing another user', async () => {
    await seed((db) => setDoc(doc(db, 'users/bob'), { uid: 'bob', name: 'B', rating: null }));
    await assertFails(updateDoc(doc(alice(), 'users/bob'), { name: 'hacked' }));
  });
});

describe('listings', () => {
  it('allows a seller to create an in-cap active listing', async () => {
    await assertSucceeds(setDoc(doc(alice(), 'listings/l1'), {
      sellerId: 'alice', status: 'active', price: 100, originalPrice: 100, eventId: 'e1',
    }));
  });

  it('DENIES creating a listing over the price cap', async () => {
    await assertFails(setDoc(doc(alice(), 'listings/l2'), {
      sellerId: 'alice', status: 'active', price: 500, originalPrice: 100, eventId: 'e1',
    }));
  });

  it('DENIES creating a listing as another seller', async () => {
    await assertFails(setDoc(doc(alice(), 'listings/l3'), {
      sellerId: 'bob', status: 'active', price: 100, originalPrice: 100, eventId: 'e1',
    }));
  });

  it('DENIES a client marking a listing sold', async () => {
    await seed((db) => setDoc(doc(db, 'listings/l4'), { sellerId: 'alice', status: 'active', price: 100, originalPrice: 100 }));
    await assertFails(updateDoc(doc(alice(), 'listings/l4'), { status: 'sold' }));
  });
});

describe('transactions', () => {
  it('DENIES a client updating transaction status', async () => {
    await seed((db) => setDoc(doc(db, 'transactions/t1'), { buyerId: 'alice', sellerId: 'bob', status: 'paid', total: 105 }));
    await assertFails(updateDoc(doc(alice(), 'transactions/t1'), { status: 'released' }));
  });

  it('lets the buyer read their own transaction', async () => {
    await seed((db) => setDoc(doc(db, 'transactions/t2'), { buyerId: 'alice', sellerId: 'bob', status: 'paid' }));
    await assertSucceeds(getDoc(doc(alice(), 'transactions/t2')));
  });

  it('DENIES an unrelated user reading a transaction', async () => {
    await seed((db) => setDoc(doc(db, 'transactions/t3'), { buyerId: 'alice', sellerId: 'bob', status: 'paid' }));
    const carol = testEnv.authenticatedContext('carol').firestore();
    await assertFails(getDoc(doc(carol, 'transactions/t3')));
  });

  it('DENIES reading the private ticket subcollection', async () => {
    await seed((db) => setDoc(doc(db, 'transactions/t4/private/ticket'), { storagePath: 'tickets/x' }));
    await assertFails(getDoc(doc(alice(), 'transactions/t4/private/ticket')));
  });
});

describe('conversations', () => {
  it('lets a participant read their conversation', async () => {
    await seed((db) => setDoc(doc(db, 'conversations/alice_bob'), { participants: ['alice', 'bob'] }));
    await assertSucceeds(getDoc(doc(alice(), 'conversations/alice_bob')));
  });

  it('DENIES a non-participant reading a conversation', async () => {
    await seed((db) => setDoc(doc(db, 'conversations/alice_bob'), { participants: ['alice', 'bob'] }));
    const carol = testEnv.authenticatedContext('carol').firestore();
    await assertFails(getDoc(doc(carol, 'conversations/alice_bob')));
  });

  it('DENIES sending a message as someone else', async () => {
    await seed((db) => setDoc(doc(db, 'conversations/alice_bob'), { participants: ['alice', 'bob'] }));
    await assertFails(setDoc(doc(alice(), 'conversations/alice_bob/messages/m1'), { senderId: 'bob', text: 'spoof' }));
  });
});

describe('disputes & auditLogs', () => {
  it('DENIES client writes to disputes', async () => {
    await assertFails(setDoc(doc(alice(), 'disputes/d1'), { txnId: 't1', status: 'open' }));
  });
  it('DENIES all client access to auditLogs', async () => {
    await seed((db) => setDoc(doc(db, 'auditLogs/a1'), { action: 'x' }));
    await assertFails(getDoc(doc(admin(), 'auditLogs/a1')));
  });
});
