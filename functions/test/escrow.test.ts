import { describe, it, expect } from 'vitest';
import {
  canTransition,
  assertTransition,
  isTerminal,
  TransitionError,
  type TxnStatus,
  type Actor,
} from '../src/lib/escrow.js';
import { computeAmounts, withinPriceCap } from '../src/lib/fees.js';

describe('escrow state machine', () => {
  it('allows the happy path created→paid→revealed→released', () => {
    expect(canTransition('created', 'paid', 'psp')).toBe(true);
    expect(canTransition('paid', 'revealed', 'buyer')).toBe(true);
    expect(canTransition('revealed', 'released', 'buyer')).toBe(true);
  });

  it('only the PSP can move created→paid', () => {
    expect(canTransition('created', 'paid', 'buyer')).toBe(false);
    expect(canTransition('created', 'paid', 'admin')).toBe(false);
    expect(canTransition('created', 'paid', 'psp')).toBe(true);
  });

  it('a buyer cannot self-release before reveal', () => {
    expect(canTransition('paid', 'released', 'buyer')).toBe(false);
  });

  it('only an admin resolves a dispute', () => {
    expect(canTransition('disputed', 'released', 'admin')).toBe(true);
    expect(canTransition('disputed', 'refunded', 'admin')).toBe(true);
    expect(canTransition('disputed', 'released', 'buyer')).toBe(false);
    expect(canTransition('disputed', 'refunded', 'seller')).toBe(false);
  });

  it('terminal states cannot transition out', () => {
    const terminals: TxnStatus[] = ['released', 'refunded', 'cancelled'];
    const actors: Actor[] = ['buyer', 'seller', 'admin', 'psp', 'scheduler'];
    const targets: TxnStatus[] = ['created', 'paid', 'revealed', 'released', 'refunded', 'cancelled', 'disputed'];
    for (const from of terminals) {
      expect(isTerminal(from)).toBe(true);
      for (const to of targets) {
        for (const a of actors) {
          expect(canTransition(from, to, a)).toBe(false);
        }
      }
    }
  });

  it('assertTransition throws TransitionError on an illegal move', () => {
    expect(() => assertTransition('created', 'released', 'buyer')).toThrow(TransitionError);
    expect(() => assertTransition('paid', 'revealed', 'buyer')).not.toThrow();
  });
});

describe('fee policy', () => {
  it('computes a 5% service fee and total', () => {
    expect(computeAmounts(100)).toEqual({ price: 100, serviceFee: 5, total: 105 });
    expect(computeAmounts(280)).toEqual({ price: 280, serviceFee: 14, total: 294 });
  });

  it('rounds the fee to the nearest shekel', () => {
    expect(computeAmounts(150).serviceFee).toBe(8); // 7.5 -> 8
    expect(computeAmounts(90).serviceFee).toBe(5); // 4.5 -> 5
  });

  it('rejects non-integer or non-positive prices', () => {
    expect(() => computeAmounts(0)).toThrow();
    expect(() => computeAmounts(-10)).toThrow();
    expect(() => computeAmounts(99.9)).toThrow();
  });

  it('enforces the 20%-over-face price cap', () => {
    expect(withinPriceCap(120, 120)).toBe(true);
    expect(withinPriceCap(144, 120)).toBe(true); // exactly +20%
    expect(withinPriceCap(145, 120)).toBe(false);
    expect(withinPriceCap(200, 120)).toBe(false);
  });
});
