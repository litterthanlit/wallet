import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Eye, EyeOff, Plus } from "@/components/ui/icons";
import { NumberTicker } from "@/components/ui/number-ticker";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ThemeToggle, useTheme } from "@/components/ui/theme-toggle";
import { Button, IconButton, SectionLabel } from "@/design-system";
import { INITIAL_BALANCE, user } from "../data";
import { greeting, money } from "../format";
import { history, periodStart, periods, pointLabel, rangeStartLabel, type Period, type Point } from "../history";
import { Avatar } from "../parts/avatar";
import { BalanceChart } from "../parts/balance-chart";
import { BalanceWidget } from "../parts/balance-widget";
import { TxnRow } from "../parts/txn-row";
import { useUI, useWallet } from "../store";
import { caps } from "../theme";

const since: Record<Period, string> = { week: "past week", month: "past month", year: "past year" };

// Mono makes the tiles a little taller, to match the widgets around them.
const tile =
  "flex h-[72px] flex-col items-center justify-center gap-1.5 rounded-lg text-meta font-medium transition-[background-color,box-shadow,transform,opacity] duration-(--duration-exit) ease-out hover:duration-(--duration-enter) active:scale-[0.97] mono:h-20 mono:gap-2";
const tileSecondary = `${tile} bg-surface text-ink shadow-sm hover:shadow-[0_0_0_1px_var(--line-strong),0_1px_2px_rgb(0_0_0/0.04)]`;

export function HomeView() {
  const { state, dispatch } = useWallet();
  const { openSheet, setTab } = useUI();
  const [period, setPeriod] = useState<Period>("month");
  const [scrub, setScrub] = useState<Point | null>(null);
  const [now] = useState(() => Date.now());
  const mono = useTheme() === "mono";

  const points = useMemo(() => history(period, state.balance, INITIAL_BALANCE, now), [period, state.balance, now]);
  const start = periodStart(period, INITIAL_BALANCE);
  const shown = scrub?.v ?? state.balance;
  const delta = shown - start;
  const up = delta >= 0;
  const percent = Math.abs((delta / start) * 100).toFixed(1);
  const summary = `Your balance went ${state.balance >= start ? "up" : "down"} from ${money(start)} to ${money(state.balance)} over the ${since[period]}.`;

  return (
    <div className="flex flex-col">
      <header className="flex items-center gap-3">
        <Avatar name={user.name} />
        <div className="min-w-0 flex-1">
          <p className={`text-meta text-muted ${caps}`}>{greeting()}</p>
          <p className="truncate text-body font-medium text-ink">{user.name}</p>
        </div>
        <IconButton
          label={state.hidden ? "Show balance" : "Hide balance"}
          aria-keyshortcuts="H"
          onClick={() => dispatch({ type: "toggleHidden" })}
        >
          {state.hidden ? <EyeOff /> : <Eye />}
        </IconButton>
        <ThemeToggle className="-mr-2" />
      </header>

      {mono ? (
        <BalanceWidget
          period={period}
          onPeriod={setPeriod}
          points={points}
          scrub={scrub}
          onScrub={setScrub}
          shown={shown}
          balance={state.balance}
          start={start}
          hidden={state.hidden}
          summary={summary}
          since={since[period]}
          now={now}
        />
      ) : (
        <>
          <section aria-labelledby="balance-label" className="mt-9">
            <h1 id="balance-label" className="text-body text-muted">
              {scrub ? pointLabel(period, scrub.t) : "Total balance"}
            </h1>
            <p className="mt-2 text-[3rem] font-medium leading-none tracking-[-0.04em] text-ink">
              {state.hidden ? (
                <>
                  <span aria-hidden>$••••••</span>
                  <span className="sr-only">Balance hidden</span>
                </>
              ) : (
                <NumberTicker value={shown / 100} format={{ style: "currency", currency: "USD" }} />
              )}
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-meta">
              <span
                className={`inline-flex h-5 items-center rounded-full px-2 tabular-nums transition-colors duration-(--duration-enter) ${
                  up ? "bg-accent text-accent-ink" : "bg-danger/10 text-danger"
                }`}
              >
                <span aria-hidden>{up ? "▲" : "▼"}&nbsp;</span>
                <span className="sr-only">{up ? "Up" : "Down"} </span>
                {state.hidden ? "••••" : money(Math.abs(delta))} · {percent}%
              </span>
              <span className="text-muted">{scrub ? `since ${rangeStartLabel(period, now)}` : since[period]}</span>
            </p>
          </section>

          <section aria-label="Balance chart" className="mt-7">
            <BalanceChart points={points} period={period} onScrub={setScrub} summary={summary} />
            <div aria-hidden className="mt-2 flex justify-between text-meta tabular-nums text-muted">
              <span>{rangeStartLabel(period, now)}</span>
              <span>Today</span>
            </div>
            <div className="mt-4 flex justify-center">
              <SegmentedControl
                label="Chart period"
                options={periods.map((p) => ({ value: p.value, label: p.label }))}
                value={period}
                onChange={(v) => setPeriod(v as Period)}
              />
            </div>
          </section>
        </>
      )}

      <section aria-label="Move money" className="mt-8 grid grid-cols-3 gap-2 mono:mt-3 mono:gap-3">
        <button
          type="button"
          aria-keyshortcuts="S"
          onClick={() => openSheet({ kind: "send" })}
          className={`${tile} bg-ink text-canvas hover:opacity-85 mono:bg-accent mono:text-accent-ink`}
        >
          <ArrowUpRight />
          Send
        </button>
        <button
          type="button"
          aria-keyshortcuts="R"
          onClick={() => openSheet({ kind: "request" })}
          className={tileSecondary}
        >
          <ArrowDownLeft />
          Request
        </button>
        <button
          type="button"
          aria-keyshortcuts="T"
          onClick={() => openSheet({ kind: "topUp" })}
          className={tileSecondary}
        >
          <Plus />
          Top up
        </button>
      </section>

      <section
        aria-labelledby="recent-heading"
        className="mt-10 mono:mt-3 mono:rounded-xl mono:bg-surface mono:px-6 mono:pb-4 mono:pt-5 mono:shadow-sm"
      >
        <div className="flex items-center justify-between">
          <SectionLabel id="recent-heading" className={`mono:text-meta mono:text-ink ${caps}`}>
            Recent activity
          </SectionLabel>
          <Button variant="ghost" size="sm" onClick={() => setTab("activity")} className={`-mr-2.5 ${caps}`}>
            See all
          </Button>
        </div>
        <ul className="mt-1">
          {state.txns.slice(0, 4).map((txn, i) => (
            <TxnRow key={txn.id} txn={txn} style={{ animationDelay: `calc(${i} * var(--stagger))` }} />
          ))}
        </ul>
      </section>
    </div>
  );
}
