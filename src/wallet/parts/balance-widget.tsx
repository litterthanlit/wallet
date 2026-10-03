import { useRef, type KeyboardEvent } from "react";
import { NumberTicker } from "@/components/ui/number-ticker";
import { money } from "../format";
import { periods, pointLabel, rangeStartLabel, type Period, type Point } from "../history";
import { caps } from "../theme";
import { BalanceChart } from "./balance-chart";

type BalanceWidgetProps = {
  period: Period;
  onPeriod: (period: Period) => void;
  points: Point[];
  scrub: Point | null;
  onScrub: (point: Point | null) => void;
  /** The figure on show: the live balance, or the scrubbed point's. */
  shown: number;
  balance: number;
  start: number;
  hidden: boolean;
  summary: string;
  since: string;
  now: number;
};

/**
 * The mono theme's balance: one widget, after the Nothing OS sleep and
 * revenue cards. A caps header with the period as plain words, the figure
 * with its symbol and cents set small against the top of the digits, a
 * hairline, then the balance line over a soft grey, both ends labelled underneath.
 */
export function BalanceWidget(props: BalanceWidgetProps) {
  const { period, onPeriod, points, scrub, onScrub, shown, balance, start, hidden, summary, since, now } = props;
  const delta = shown - start;
  const up = delta >= 0;
  const percent = Math.abs((delta / start) * 100).toFixed(1);
  const dollars = Math.trunc(Math.abs(shown) / 100);
  const cents = Math.abs(shown) % 100;
  const mask = "••••";

  return (
    <section aria-labelledby="balance-label" className="mt-7 rounded-[28px] bg-surface shadow-sm">
      <div className="px-5 pb-5 pt-4">
        <div className="flex h-8 items-center justify-between gap-3">
          <h1 id="balance-label" className={`text-meta text-ink ${caps}`}>
            {scrub ? pointLabel(period, scrub.t) : "Balance"}
          </h1>
          <PeriodTabs value={period} onChange={onPeriod} />
        </div>

        <p className="mt-6 flex items-start leading-none text-ink">
          {hidden ? (
            <>
              <span aria-hidden className="text-[3.25rem] tracking-[-0.04em]">
                ••••
              </span>
              <span className="sr-only">Balance hidden</span>
            </>
          ) : (
            <>
              <span className="sr-only">{money(shown)}</span>
              <span aria-hidden className="flex items-start">
                <span className="mr-1 mt-1 text-lead text-muted">{shown < 0 ? "−$" : "$"}</span>
                <NumberTicker value={dollars} className="text-[3.25rem] tracking-[-0.04em]" />
                <span className="ml-0.5 mt-1 inline-flex text-lead">
                  .<NumberTicker value={cents} format={{ minimumIntegerDigits: 2 }} />
                </span>
              </span>
            </>
          )}
        </p>

        <p className={`mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-meta tabular-nums ${caps}`}>
          <span className={`transition-colors duration-(--duration-enter) ${up ? "text-ink" : "text-danger"}`}>
            <span aria-hidden>{up ? "▲" : "▼"} </span>
            <span className="sr-only">{up ? "Up" : "Down"} </span>
            {hidden ? mask : money(Math.abs(delta))} ({percent}%)
          </span>
          <span className="text-muted">{scrub ? `since ${rangeStartLabel(period, now)}` : since}</span>
        </p>
      </div>

      <div className="border-t border-line px-5 pb-4 pt-5">
        {/* Markers ring in the widget's own ground, not the page's. */}
        <div className="[--chart-ground:var(--surface)]">
          <BalanceChart points={points} period={period} onScrub={onScrub} summary={summary} />
        </div>
        <div aria-hidden className={`mt-3 flex justify-between gap-3 text-meta tabular-nums ${caps}`}>
          <span className="text-muted">
            {rangeStartLabel(period, now)} {hidden ? mask : money(start)}
          </span>
          <span className="text-ink">Today {hidden ? mask : money(balance)}</span>
        </div>
      </div>
    </section>
  );
}

/**
 * The period as words in the widget's corner, the way the revenue card shows
 * Daily / Weekly / Monthly. The chosen one is ink and carries the red dot, so
 * it reads without colour too. A radio group: one tab stop, arrows move.
 */
function PeriodTabs({ value, onChange }: { value: Period; onChange: (period: Period) => void }) {
  const list = useRef<HTMLDivElement>(null);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const at = periods.findIndex((p) => p.value === value);
    const moves: Record<string, number> = {
      ArrowRight: (at + 1) % periods.length,
      ArrowDown: (at + 1) % periods.length,
      ArrowLeft: (at - 1 + periods.length) % periods.length,
      ArrowUp: (at - 1 + periods.length) % periods.length,
      Home: 0,
      End: periods.length - 1,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const next = moves[event.key];
    onChange(periods[next].value);
    list.current?.querySelectorAll<HTMLElement>('[role="radio"]')[next]?.focus();
  }

  return (
    <div ref={list} role="radiogroup" aria-label="Chart period" onKeyDown={onKeyDown} className="-mr-2 flex">
      {periods.map((p) => {
        const checked = p.value === value;
        return (
          <button
            key={p.value}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(p.value)}
            className={`flex h-8 items-center gap-1.5 rounded-md px-2 text-meta transition-[color,transform] duration-(--duration-exit) ease-out hover:duration-(--duration-enter) active:scale-[0.97] ${caps} ${
              checked ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            <span
              aria-hidden
              className={`size-1 rounded-full bg-accent transition-opacity duration-(--duration-enter) ease-out ${
                checked ? "opacity-100" : "opacity-0"
              }`}
            />
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
