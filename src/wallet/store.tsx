import { createContext, use, useMemo, useReducer, type Dispatch, type ReactNode } from "react";
import type { Toast } from "@/components/ui/toast-stack";
import {
  INITIAL_BALANCE,
  funding,
  reference,
  seedCards,
  seedTransactions,
  type Card,
  type Contact,
  type Txn,
} from "./data";

export type WalletState = {
  balance: number;
  txns: Txn[];
  cards: Card[];
  /** Privacy mode: the balance is masked. */
  hidden: boolean;
  toasts: Toast[];
  /** Monotonic id source for new transactions and toasts. */
  seq: number;
  /** Bumped on reset so stateful views remount fresh. */
  epoch: number;
};

export type WalletAction =
  | { type: "send"; contact: Contact; amount: number; note: string }
  | { type: "receive"; contact: Contact; amount: number; note: string }
  | { type: "topUp"; amount: number }
  | { type: "toggleHidden" }
  | { type: "updateCard"; id: string; patch: Partial<Card> }
  | { type: "addCard"; card: Card }
  | { type: "cancelCard"; id: string }
  | { type: "toast"; title: string; body: string }
  | { type: "dismissToast"; id: number }
  | { type: "reset" };

function initial(epoch = 0): WalletState {
  return {
    balance: INITIAL_BALANCE,
    txns: seedTransactions(),
    cards: seedCards(),
    hidden: false,
    toasts: [],
    seq: 1,
    epoch,
  };
}

function addTxn(state: WalletState, txn: Omit<Txn, "id" | "reference" | "at" | "status">): WalletState {
  const next: Txn = {
    ...txn,
    id: `t-${state.seq}`,
    reference: reference(state.seq + 101),
    at: Date.now(),
    status: "completed",
  };
  return { ...state, seq: state.seq + 1, balance: state.balance + txn.amount, txns: [next, ...state.txns] };
}

function reducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case "send":
      return addTxn(state, {
        name: action.contact.name,
        category: "transfer",
        amount: -action.amount,
        contactId: action.contact.id,
        note: action.note || undefined,
      });
    case "receive":
      return addTxn(state, {
        name: action.contact.name,
        category: "transfer",
        amount: action.amount,
        contactId: action.contact.id,
        note: action.note || undefined,
      });
    case "topUp":
      return addTxn(state, {
        name: "Top up",
        category: "topup",
        amount: action.amount,
        note: `From ${funding.name} •••• ${funding.last4}`,
      });
    case "toggleHidden":
      return { ...state, hidden: !state.hidden };
    case "updateCard":
      return { ...state, cards: state.cards.map((c) => (c.id === action.id ? { ...c, ...action.patch } : c)) };
    case "addCard":
      return { ...state, cards: [...state.cards, action.card] };
    case "cancelCard":
      return { ...state, cards: state.cards.filter((c) => c.id !== action.id) };
    case "toast":
      return {
        ...state,
        seq: state.seq + 1,
        toasts: [...state.toasts, { id: state.seq, title: action.title, body: action.body }],
      };
    case "dismissToast":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case "reset":
      return initial(state.epoch + 1);
  }
}

const WalletContext = createContext<{ state: WalletState; dispatch: Dispatch<WalletAction> } | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, 0, initial);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <WalletContext value={value}>{children}</WalletContext>;
}

export function useWallet() {
  const ctx = use(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside <WalletProvider>");
  return ctx;
}

/* ---------------------------------------------------------------------- */
/* UI state: which tab is showing and which sheet is open                  */
/* ---------------------------------------------------------------------- */

export type Tab = "home" | "cards" | "activity";

export type SheetState =
  { kind: "send"; contactId?: string } | { kind: "request" } | { kind: "topUp" } | { kind: "txn"; id: string } | null;

export type UI = {
  tab: Tab;
  setTab: (tab: Tab) => void;
  sheet: SheetState;
  openSheet: (sheet: NonNullable<SheetState>) => void;
  closeSheet: () => void;
};

export const UIContext = createContext<UI | null>(null);

export function useUI() {
  const ctx = use(UIContext);
  if (!ctx) throw new Error("useUI must be used inside the app shell");
  return ctx;
}
