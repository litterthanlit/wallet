import { NumberTicker } from "@/components/ui/number-ticker";
import { money } from "../format";
import { caps } from "../theme";

const sizes = {
  lg: { digits: "text-[3.5rem]", parts: "mt-1.5 text-lead" },
  md: { digits: "text-[2.5rem]", parts: "mt-1 text-body" },
};

/**
 * Mono's balance: whole dollars large, the symbol and cents set small against
 * the top of the digits. The digits roll on the Number Ticker; screen readers
 * get the formatted amount once.
 */
export function BalanceFigure({ value, hidden, size }: { value: number; hidden: boolean; size: keyof typeof sizes }) {
  const { digits, parts } = sizes[size];
  const dollars = Math.trunc(Math.abs(value) / 100);
  const cents = Math.abs(value) % 100;

  if (hidden) {
    return (
      <p className={`leading-none tracking-[-0.04em] text-ink ${digits}`}>
        <span aria-hidden>••••</span>
        <span className="sr-only">Balance hidden</span>
      </p>
    );
  }

  return (
    <p className="flex items-start leading-none text-ink">
      <span className="sr-only">{money(value)}</span>
      <span aria-hidden className="flex items-start">
        <span className={`mr-1 text-muted ${parts}`}>{value < 0 ? "−$" : "$"}</span>
        <NumberTicker value={dollars} className={`tracking-[-0.04em] ${digits}`} />
        <span className={`ml-0.5 inline-flex ${parts}`}>
          .<NumberTicker value={cents} format={{ minimumIntegerDigits: 2 }} />
        </span>
      </span>
    </p>
  );
}

/** "▲ $945.82 (8.2%)  PAST MONTH": the change, then what it is measured against. */
export function BalanceDelta({
  delta,
  start,
  hidden,
  note,
}: {
  delta: number;
  start: number;
  hidden: boolean;
  note: string;
}) {
  const up = delta >= 0;
  const percent = Math.abs((delta / start) * 100).toFixed(1);
  return (
    <p className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-meta tabular-nums ${caps}`}>
      <span className={`transition-colors duration-(--duration-enter) ${up ? "text-ink" : "text-danger"}`}>
        <span aria-hidden>{up ? "▲" : "▼"} </span>
        <span className="sr-only">{up ? "Up" : "Down"} </span>
        {hidden ? "••••" : money(Math.abs(delta))} ({percent}%)
      </span>
      <span className="text-muted">{note}</span>
    </p>
  );
}
