/**
 * Balance history for the chart. A seeded Brownian bridge: random enough to
 * read as real, deterministic so it doesn't reshuffle on every render, and
 * pinned to a fixed start and the live balance at the end, so sending or
 * receiving money moves the right edge of the line.
 */
import { money } from "./format";

export type Period = "week" | "month" | "year";
export type Point = { t: number; v: number };

export const periods: {
  value: Period;
  label: string;
  days: number;
  growth: number;
  volatility: number;
  seed: number;
}[] = [
  { value: "week", label: "Week", days: 7, growth: 0.021, volatility: 0.0035, seed: 7 },
  { value: "month", label: "Month", days: 30, growth: 0.082, volatility: 0.011, seed: 30 },
  { value: "year", label: "Year", days: 365, growth: 0.46, volatility: 0.03, seed: 365 },
];

/** Every period has the same number of points, so the line can morph between them. */
export const POINTS = 64;
const DAY = 86_400_000;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const periodConfig = (period: Period) => periods.find((p) => p.value === period)!;

/** Balance at the start of the period, cents. Fixed, so the delta reflects real changes. */
export const periodStart = (period: Period, base: number) => Math.round(base / (1 + periodConfig(period).growth));

export function history(period: Period, end: number, base: number, now: number): Point[] {
  const config = periodConfig(period);
  const start = periodStart(period, base);
  const rand = mulberry32(config.seed);
  const walk = [0];
  for (let i = 1; i < POINTS; i++) walk.push(walk[i - 1] + (rand() - 0.5) * 2);
  const amp = base * config.volatility;
  const last = walk[POINTS - 1];
  return walk.map((w, i) => {
    const k = i / (POINTS - 1);
    return {
      t: now - config.days * DAY * (1 - k),
      v: Math.round(start + (end - start) * k + amp * (w - last * k)),
    };
  });
}

const hourly = new Intl.DateTimeFormat("en-US", { weekday: "short", hour: "numeric" });
const daily = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const yearly = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

/** Label for a scrubbed point, at the resolution the period has. */
export function pointLabel(period: Period, t: number) {
  if (period === "week") return hourly.format(t);
  if (period === "month") return daily.format(t);
  return yearly.format(t);
}

export const rangeStartLabel = (period: Period, now: number) => daily.format(now - periodConfig(period).days * DAY);

/** "past month": how far back the delta reaches. */
export const pastLabel: Record<Period, string> = { week: "past week", month: "past month", year: "past year" };

/** One sentence for screen readers describing the chart. */
export const balanceSummary = (period: Period, start: number, end: number) =>
  `Your balance went ${end >= start ? "up" : "down"} from ${money(start)} to ${money(end)} over the ${pastLabel[period]}.`;
