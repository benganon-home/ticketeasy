/**
 * Escrow state machine — pure, no I/O, fully unit-testable.
 *
 * The transaction's `status` field is authoritative and only ever changes
 * through `assertTransition`. Every transition names the actor allowed to
 * trigger it; the callables/webhooks/schedulers enforce the actor separately.
 */

export type TxnStatus =
  | 'created' // buyer initiated, awaiting payment
  | 'paid' // PSP confirmed payment; funds held by platform
  | 'revealed' // buyer viewed the ticket (escrow reveal)
  | 'released' // funds released to seller (terminal)
  | 'disputed' // buyer opened a dispute; funds frozen
  | 'refunded' // buyer refunded (terminal)
  | 'cancelled'; // never paid / aborted (terminal)

export type Actor = 'buyer' | 'seller' | 'admin' | 'psp' | 'scheduler';

export const TERMINAL: readonly TxnStatus[] = ['released', 'refunded', 'cancelled'];

export function isTerminal(status: TxnStatus): boolean {
  return TERMINAL.includes(status);
}

interface Transition {
  from: TxnStatus;
  to: TxnStatus;
  actors: readonly Actor[];
}

/** The complete, closed set of legal transitions. Anything else is rejected. */
export const TRANSITIONS: readonly Transition[] = [
  { from: 'created', to: 'paid', actors: ['psp'] },
  { from: 'created', to: 'cancelled', actors: ['buyer', 'scheduler'] },
  { from: 'paid', to: 'revealed', actors: ['buyer'] },
  { from: 'paid', to: 'disputed', actors: ['buyer'] },
  { from: 'paid', to: 'refunded', actors: ['admin', 'seller'] },
  { from: 'revealed', to: 'released', actors: ['buyer', 'scheduler', 'admin'] },
  { from: 'revealed', to: 'disputed', actors: ['buyer'] },
  { from: 'disputed', to: 'released', actors: ['admin'] },
  { from: 'disputed', to: 'refunded', actors: ['admin'] },
];

export function canTransition(from: TxnStatus, to: TxnStatus, actor: Actor): boolean {
  return TRANSITIONS.some((t) => t.from === from && t.to === to && t.actors.includes(actor));
}

export class TransitionError extends Error {
  constructor(from: TxnStatus, to: TxnStatus, actor: Actor) {
    super(`Illegal transition ${from} -> ${to} by ${actor}`);
    this.name = 'TransitionError';
  }
}

/** Throws TransitionError unless (from -> to) is legal for `actor`. */
export function assertTransition(from: TxnStatus, to: TxnStatus, actor: Actor): void {
  if (!canTransition(from, to, actor)) throw new TransitionError(from, to, actor);
}
