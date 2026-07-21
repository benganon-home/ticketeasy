/**
 * Fee policy — single source of truth for money math. The client never
 * computes or submits these; the server derives them from the listing price.
 */

export const SERVICE_FEE_RATE = 0.05; // 5% buyer service fee
export const PRICE_CAP_MULTIPLIER = 1.2; // resale capped at 20% over face value

export interface Amounts {
  price: number; // seller's asking price (from the listing doc)
  serviceFee: number; // platform fee charged to the buyer
  total: number; // what the buyer pays / PSP must confirm
}

/** Compute buyer-facing amounts from an integer shekel price. */
export function computeAmounts(price: number): Amounts {
  if (!Number.isInteger(price) || price <= 0) {
    throw new Error(`Invalid listing price: ${price}`);
  }
  const serviceFee = Math.round(price * SERVICE_FEE_RATE);
  return { price, serviceFee, total: price + serviceFee };
}

/** True if `price` is within the anti-scalping cap for a given face value. */
export function withinPriceCap(price: number, originalPrice: number): boolean {
  return price > 0 && originalPrice > 0 && price <= originalPrice * PRICE_CAP_MULTIPLIER;
}
