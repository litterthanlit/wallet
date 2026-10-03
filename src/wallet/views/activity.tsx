import { useMemo, useState } from "react";
import { Search } from "@/components/ui/icons";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Button } from "@/design-system";
import { categoryLabel, recent, type Txn } from "../data";
import { dayKey, dayLabel, money, signedMoney } from "../format";
import { TxnRow } from "../parts/txn-row";
import { useWallet } from "../store";
import { caps } from "../theme";

type Filter = "all" | "in" | "out";

const filters = [
  { value: "all", label: "All" },
  { value: "in", label: "Money in" },
  { value: "out", label: "Money out" },
];

export function ActivityView() {
  const { state } = useWallet();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const { moneyIn, moneyOut } = useMemo(() => {
    const last30 = state.txns.filter((t) => recent(t));
    return {
      moneyIn: last30.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0),
      moneyOut: last30.filter((t) => t.amount < 0).reduce((s, t) => s - t.amount, 0),
    };
  }, [state.txns]);

  const groups = useMemo(() => {
    const matches = state.txns.filter((t) => {
      if (filter === "in" && t.amount < 0) return false;
      if (filter === "out" && t.amount > 0) return false;
      if (!q) return true;
      return [t.name, categoryLabel[t.category], t.note ?? ""].some((s) => s.toLowerCase().includes(q));
    });
    const byDay = new Map<number, Txn[]>();
    for (const t of matches) {
      const key = dayKey(t.at);
      byDay.set(key, [...(byDay.get(key) ?? []), t]);
    }
    return [...byDay.entries()].map(([key, txns]) => ({ key, txns, net: txns.reduce((s, t) => s + t.amount, 0) }));
  }, [state.txns, filter, q]);

  const count = groups.reduce((n, g) => n + g.txns.length, 0);
  let row = 0;

  return (
    <div className="flex flex-col">
      <h1 className="text-title font-medium text-ink">Activity</h1>

      <dl className="mt-5 grid grid-cols-2 gap-2">
        <Stat label="Money in" value={money(moneyIn)} />
        <Stat label="Money out" value={money(moneyOut)} />
      </dl>

      <div className="mt-5 flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            id="activity-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search activity"
            aria-label="Search activity"
            autoComplete="off"
            className="h-10 w-full rounded-md bg-surface pl-9 mono:rounded-full pr-3 text-body text-ink shadow-sm transition-shadow duration-(--duration-exit) placeholder:text-muted hover:shadow-[0_0_0_1px_var(--line-strong),0_1px_2px_rgb(0_0_0/0.04)] hover:duration-(--duration-enter)"
          />
        </div>
        <div>
          <SegmentedControl label="Show" options={filters} value={filter} onChange={(v) => setFilter(v as Filter)} />
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {q || filter !== "all" ? `${count} ${count === 1 ? "result" : "results"}` : ""}
      </p>

      {groups.length ? (
        <div className="mt-4 flex flex-col">
          {groups.map((group) => (
            <section key={group.key} aria-label={dayLabel(group.key)}>
              <h2
                className={`sticky top-[env(safe-area-inset-top,0px)] z-10 -mx-5 flex items-baseline justify-between bg-canvas/60 px-5 pb-1 pt-3 text-meta text-muted backdrop-blur-xl ${caps}`}
              >
                <span>{dayLabel(group.key)}</span>
                <span className="tabular-nums">{signedMoney(group.net)}</span>
              </h2>
              <ul>
                {group.txns.map((txn) => (
                  <TxnRow
                    key={txn.id}
                    txn={txn}
                    style={{ animationDelay: `calc(${Math.min(row++, 8)} * var(--stagger))` }}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-10 flex animate-enter flex-col items-center gap-2 text-center">
          <p className="text-body font-medium text-ink">
            Nothing matches “{query.trim() || filters.find((f) => f.value === filter)?.label}”
          </p>
          <p className="text-body text-muted">Try a merchant, a person or a category.</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-1"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-panel px-4 py-3 shadow-[inset_0_0_0_1px_var(--line)] mono:rounded-[22px] mono:bg-surface mono:px-4 mono:py-4">
      <dt className={`text-meta text-muted ${caps}`}>{label}, 30 days</dt>
      <dd className="mt-0.5 text-lead font-medium tabular-nums text-ink mono:mt-2 mono:text-title">{value}</dd>
    </div>
  );
}
