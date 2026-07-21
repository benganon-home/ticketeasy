# TicketEasy test suites

Three layers, fastest first:

## 1. Functions unit tests (pure, no emulator) — RUNNABLE NOW
Escrow state machine + fee policy. No I/O.
```bash
cd functions && npm test
```
Covers: legal/illegal transitions, actor authorization, terminal-state
immutability, 5% fee rounding, 20% price cap. (10 tests, green.)

## 2. Firestore rules tests (firestore emulator) — needs Java + firebase login
Attack-case suite asserting every bypass is denied and every legit action
allowed (`tests/rules/firestore.rules.test.js`).
```bash
cd tests/rules && npm install && npm test
```
`firebase emulators:exec` boots the firestore emulator and loads
`../../firestore.rules` via the repo `firebase.json`.

## 3. Functions integration tests (full emulator) — TODO, needs emulator
Run the callables/webhook/schedulers against the auth+firestore+functions
emulators. Author under `functions/test/integration/` once the emulator runs
locally (or in CI). Required matrix:

| Case | Expected |
|---|---|
| createTransaction happy path | txn `created`, listing `reserved`, price/fee/total server-computed |
| createTransaction on own listing | rejected (`failed-precondition`) |
| createTransaction over price cap (event face value) | rejected |
| two buyers race one listing | exactly one `created`, other rejected |
| pspWebhook valid | `created`→`paid`, listing `sold`, idempotency key stored |
| pspWebhook replay (same key) | no-op |
| pspWebhook wrong amount | rejected, txn stays `created` |
| pspWebhook forged signature | 400, no state change |
| revealTicket before window | rejected |
| revealTicket by non-buyer | `permission-denied` |
| revealTicket in window | `paid`→`revealed`, signed URL returned |
| confirmReceipt | `revealed`→`released`, seller salesCount +1, buyer purchasesCount +1 |
| openDispute | `disputed`, disputes doc created, funds frozen |
| resolveDispute by non-admin | `permission-denied` |
| resolveDispute refund/release (admin) | terminal + audit log |
| rateUser before terminal | rejected |
| rateUser twice same side | `already-exists` |
| autoReleaseEscrow after event+48h | `revealed`→`released` |
| expirePendingTransactions after TTL | `created`→`cancelled`, listing back to `active` |

## CI
`.github/workflows/ci.yml` (Phase 6) runs suites 1 + 2 + 3 on every push, with
the emulator JAR cached, and gates Vercel production promotion on green.
