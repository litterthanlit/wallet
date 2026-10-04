import { useMemo, useState } from "react";
import { INITIAL_BALANCE } from "../data";
import { money } from "../format";
import {
  balanceSummary,
  history,
  pastLabel,
  periodStart,
  periods,
  pointLabel,
  rangeStartLabel,
  type Period,
  type Point,
} from "../history";
import { useWallet } from "../store";
import { caps } from "../theme";
import { BalanceChart } from "./balance-chart";
import { BalanceDelta, BalanceFigure } from "./balance-figure";
import { TextTabs } from "./text-tabs";

/**
 * Mono's balance over time, on Activity: Home keeps only the figure. One white
 * card with no outline or divider. The period sits in the corner as words,
 * the figure follows a scrub, and the line runs over a soft grey with both
 * ends labelled underneath.
 */
export function BalanceTrend() {
  const { state } = useWallet();
  const [period, setPeriod] = useState<Period>("month");
  const [scrub, setScrub] = useState<Point | null>(null);
  const [now] = useState(() => Date.now());

  const points = useMemo(() => history(period, state.balance, INITIAL_BALANCE, now), [period, state.balance, now]);
  const start = periodStart(period, INITIAL_BALANCE);
  const shown = scrub?.v ?? state.balance;
  const mask = "••••";

  return (
    <section aria-labelledby="trend-label" className="rounded-xl bg-surface p-6 shadow-sm">
      <div className="flex h-7 items-center justify-between gap-3">
        <h2 id="trend-label" className={`text-meta text-muted ${caps}`}>
          {scrub ? pointLabel(period, scrub.t) : "Balance"}
        </h2>
        <TextTabs
          label="Chart period"
          options={periods.map((p) => ({ value: p.value, label: p.label }))}
          value={period}
          onChange={setPeriod}
        />
      </div>

      <div className="mt-6">
        <BalanceFigure value={shown} hidden={state.hidden} size="md" />
      </div>
      <div className="mt-3">
        <BalanceDelta
          delta={shown - start}
          start={start}
          hidden={state.hidden}
          note={scrub ? `since ${rangeStartLabel(period, now)}` : pastLabel[period]}
        />
      </div>

      {/* Markers ring in the card's own ground, not the page's. */}
      <div className="mt-8 [--chart-ground:var(--surface)]">
        <BalanceChart
          points={points}
          period={period}
          onScrub={setScrub}
          summary={balanceSummary(period, start, state.balance)}
        />
      </div>
      <div aria-hidden className={`mt-4 flex justify-between gap-3 text-meta tabular-nums ${caps}`}>
        <span className="text-muted">
          {rangeStartLabel(period, now)} {state.hidden ? mask : money(start)}
        </span>
        <span className="text-ink">Today {state.hidden ? mask : money(state.balance)}</span>
      </div>
    </section>
  );
}
