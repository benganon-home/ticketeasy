/**
 * PSP provider interface — payments are swappable. Phase 3 supplies a concrete
 * implementation (PayPlus first choice). Server is always authoritative on the
 * amount; the client never sees card data (hosted page / iframe, PCI SAQ-A).
 */

export interface PaymentPage {
  url: string; // hosted payment page to redirect/iframe the buyer to
  pspRef: string; // provider-side reference for reconciliation
}

export interface WebhookResult {
  ok: boolean;
  txnId: string; // our transaction id (passed through as metadata)
  amount: number; // amount the PSP actually charged, in shekels
  pspRef: string;
  idempotencyKey: string;
}

export interface PspProvider {
  /** Create a hosted payment page for a transaction total. */
  createPaymentPage(input: { txnId: string; amount: number; description: string }): Promise<PaymentPage>;
  /** Verify a webhook request's signature and parse it. Throws if invalid. */
  verifyWebhook(rawBody: string, headers: Record<string, string | undefined>): WebhookResult;
  /** Refund a previously captured payment. */
  refund(input: { pspRef: string; amount: number }): Promise<{ ok: boolean }>;
}

/**
 * Placeholder provider so the webhook/build compile before Phase 3 wiring.
 * Replace with functions/src/lib/psp/payplus.ts.
 */
export const notConfiguredProvider: PspProvider = {
  async createPaymentPage() {
    throw new Error('PSP not configured (Phase 3).');
  },
  verifyWebhook() {
    throw new Error('PSP not configured (Phase 3).');
  },
  async refund() {
    throw new Error('PSP not configured (Phase 3).');
  },
};
