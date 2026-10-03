/**
 * Sample data for the prototype. Every amount is an integer number of cents;
 * signed amounts are negative for money out. Dates are generated relative to
 * "now" so the activity list always reads as recent.
 */

export type Category =
  "food" | "transport" | "shopping" | "entertainment" | "travel" | "bills" | "income" | "transfer" | "topup";

export type Txn = {
  id: string;
  name: string;
  category: Category;
  /** Signed cents. */
  amount: number;
  /** Epoch ms. */
  at: number;
  status: "completed" | "pending";
  note?: string;
  cardId?: string;
  contactId?: string;
  reference: string;
};

export type Card = {
  id: string;
  name: string;
  kind: "Debit" | "Virtual";
  number: string;
  expiry: string;
  cvv: string;
  /** Index into the gradient palettes. */
  palette: number;
  frozen: boolean;
  online: boolean;
  contactless: boolean;
  atm: boolean;
  /** Monthly spending limit, cents. */
  limit: number;
};

export type Contact = { id: string; name: string; tag: string };

export const user = {
  name: "Alex Morgan",
  first: "Alex",
  tag: "@alexmorgan",
  account: "8301 2245 0716",
  link: "litt.design/pay/alexmorgan",
};

export const funding = { name: "Checking", last4: "2231" };

export const INITIAL_BALANCE = 1_248_020;

export const categoryLabel: Record<Category, string> = {
  food: "Food and drink",
  transport: "Transport",
  shopping: "Shopping",
  entertainment: "Entertainment",
  travel: "Travel",
  bills: "Bills",
  income: "Income",
  transfer: "Transfer",
  topup: "Top up",
};

export const contacts: Contact[] = [
  { id: "ada", name: "Ada Lin", tag: "@adalin" },
  { id: "marcus", name: "Marcus Chen", tag: "@marcus" },
  { id: "priya", name: "Priya Shah", tag: "@priyashah" },
  { id: "jonah", name: "Jonah Weiss", tag: "@jonahw" },
  { id: "sofia", name: "Sofia Reyes", tag: "@sofiar" },
  { id: "theo", name: "Theo Brandt", tag: "@theob" },
  { id: "hana", name: "Hana Sato", tag: "@hanasato" },
];

export const contactById = (id?: string) => contacts.find((c) => c.id === id);

export function seedCards(): Card[] {
  return [
    {
      id: "everyday",
      name: "Everyday",
      kind: "Debit",
      number: "5355 0218 7740 4821",
      expiry: "09/29",
      cvv: "318",
      palette: 0,
      frozen: false,
      online: true,
      contactless: true,
      atm: true,
      limit: 200_000,
    },
    {
      id: "travel",
      name: "Travel",
      kind: "Debit",
      number: "5355 0218 6612 3307",
      expiry: "02/28",
      cvv: "702",
      palette: 2,
      frozen: false,
      online: true,
      contactless: true,
      atm: false,
      limit: 300_000,
    },
    {
      id: "online",
      name: "Online",
      kind: "Virtual",
      number: "4917 3300 2851 9150",
      expiry: "11/27",
      cvv: "054",
      palette: 1,
      frozen: false,
      online: true,
      contactless: false,
      atm: false,
      limit: 50_000,
    },
  ];
}

/** A new virtual card. `n` keeps numbers and palettes distinct. */
export function makeVirtualCard(n: number): Card {
  const last4 = String(1000 + ((n * 7919) % 9000));
  return {
    id: `virtual-${n}`,
    name: `Virtual ${n}`,
    kind: "Virtual",
    number: `4917 3300 ${String(2000 + ((n * 389) % 8000))} ${last4}`,
    expiry: "10/29",
    cvv: String(100 + ((n * 211) % 900)),
    palette: (n + 2) % 4,
    frozen: false,
    online: true,
    contactless: false,
    atm: false,
    limit: 50_000,
  };
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function reference(seed: number) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let x = (seed * 2654435761) >>> 0;
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += chars[x % chars.length];
    x = Math.floor(x / chars.length) + (i + 1) * 977;
  }
  return out;
}

export function seedTransactions(now = Date.now()): Txn[] {
  const midnight = new Date(now);
  midnight.setHours(0, 0, 0, 0);
  // `ago` days back at a time of day; today's entries never land in the future.
  const at = (ago: number, hour: number, minute = 0) =>
    Math.min(midnight.getTime() - ago * DAY + hour * HOUR + minute * MINUTE, now - (ago === 0 ? 12 * MINUTE : 0));

  const rows: Omit<Txn, "id" | "reference">[] = [
    {
      name: "Fieldnotes Coffee",
      category: "food",
      amount: -480,
      at: at(0, 8, 42),
      status: "completed",
      cardId: "everyday",
    },
    {
      name: "Metro Transit",
      category: "transport",
      amount: -275,
      at: at(0, 8, 5),
      status: "pending",
      cardId: "everyday",
    },
    {
      name: "Harbor Grocery",
      category: "shopping",
      amount: -6412,
      at: at(1, 18, 20),
      status: "completed",
      cardId: "everyday",
    },
    {
      name: "Ada Lin",
      category: "transfer",
      amount: 1800,
      at: at(1, 21, 3),
      status: "completed",
      contactId: "ada",
      note: "Movie tickets",
    },
    {
      name: "Cinema Nova",
      category: "entertainment",
      amount: -3100,
      at: at(1, 19, 48),
      status: "completed",
      cardId: "everyday",
    },
    { name: "Acme Studio", category: "income", amount: 420_000, at: at(2, 9, 0), status: "completed", note: "Salary" },
    {
      name: "Paper & Pine",
      category: "shopping",
      amount: -2240,
      at: at(2, 13, 15),
      status: "completed",
      cardId: "everyday",
    },
    {
      name: "Northwind Air",
      category: "travel",
      amount: -38_900,
      at: at(3, 11, 32),
      status: "completed",
      cardId: "travel",
    },
    {
      name: "Marcus Chen",
      category: "transfer",
      amount: -4500,
      at: at(3, 20, 10),
      status: "completed",
      contactId: "marcus",
      note: "Climbing gym",
    },
    {
      name: "Top up",
      category: "topup",
      amount: 50_000,
      at: at(5, 10, 2),
      status: "completed",
      note: `From ${funding.name} •••• ${funding.last4}`,
    },
    {
      name: "Lumen Electric",
      category: "bills",
      amount: -8630,
      at: at(5, 7, 30),
      status: "completed",
      cardId: "online",
    },
    {
      name: "Fieldnotes Coffee",
      category: "food",
      amount: -520,
      at: at(6, 8, 51),
      status: "completed",
      cardId: "everyday",
    },
    {
      name: "Priya Shah",
      category: "transfer",
      amount: -12_000,
      at: at(8, 17, 44),
      status: "completed",
      contactId: "priya",
      note: "Concert tickets",
    },
    {
      name: "Pantry Market",
      category: "shopping",
      amount: -4218,
      at: at(9, 12, 6),
      status: "completed",
      cardId: "everyday",
    },
    {
      name: "Streamline",
      category: "entertainment",
      amount: -1199,
      at: at(11, 6, 0),
      status: "completed",
      cardId: "online",
    },
    {
      name: "Corner Books",
      category: "shopping",
      amount: -1899,
      at: at(13, 16, 22),
      status: "completed",
      cardId: "everyday",
    },
  ];

  return rows.map((row, i) => ({ ...row, id: `seed-${i}`, reference: reference(i + 11) })).sort((a, b) => b.at - a.at);
}

/** Rolling 30 days, so totals don't reset to zero on the 1st. */
export const recent = (t: Txn, now = Date.now()) => t.at >= now - 30 * DAY;

/** Money spent on a card in the last 30 days, in cents (positive). */
export function spentRecently(txns: Txn[], cardId: string, now = Date.now()) {
  return txns
    .filter((t) => t.cardId === cardId && t.amount < 0 && recent(t, now))
    .reduce((sum, t) => sum - t.amount, 0);
}
