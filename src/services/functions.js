import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

// Thin wrappers over the trusted Cloud Functions. Each returns the callable's
// `.data` payload and lets HttpsError propagate to the caller for UI handling.
const call = (name) => async (payload = {}) => {
  const fn = httpsCallable(functions, name);
  const res = await fn(payload);
  return res.data;
};

// Buyer sends ONLY { listingId }; server computes price/fee/total.
export const createTransaction = call('createTransaction');
// { txnId } -> { status, ticketUrl, expiresInMs }
export const revealTicket = call('revealTicket');
// { txnId }
export const confirmReceipt = call('confirmReceipt');
// { txnId, reason }
export const openDispute = call('openDispute');
// { txnId, stars }
export const rateUser = call('rateUser');

// Admin-only (rejected client-side by claim + server-side by assertAdmin).
export const resolveDispute = call('resolveDispute');
export const refundTransaction = call('refundTransaction');
export const releaseFunds = call('releaseFunds');
export const banUser = call('banUser');
export const setAdminClaim = call('setAdminClaim');
