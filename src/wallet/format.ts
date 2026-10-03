const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** $1,234.56 from cents. */
export const money = (cents: number) => usd.format(cents / 100);

/** +$1,200.00 / −$4.80, with a true minus sign. */
export const signedMoney = (cents: number) => `${cents < 0 ? "−" : "+"}${usd.format(Math.abs(cents) / 100)}`;

export const lastFour = (number: string) => number.slice(-4);

const time = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });
const long = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

export const timeLabel = (ts: number) => time.format(ts);
export const longDate = (ts: number) => `${long.format(ts)}, ${time.format(ts)}`;

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** "Today", "Yesterday", else "Mon, Sep 29". */
export function dayLabel(ts: number, now = Date.now()) {
  const days = Math.round((startOfDay(now) - startOfDay(ts)) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return weekday.format(ts);
}

export const dayKey = (ts: number) => startOfDay(ts);

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 5) return "Good evening";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0])
    .filter((c) => c && /[A-Za-z]/.test(c))
    .slice(0, 2)
    .join("")
    .toUpperCase();

const whole = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** $250 from cents, for round preset amounts. */
export const wholeMoney = (cents: number) => whole.format(cents / 100);
