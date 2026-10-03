import { useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { money } from "../format";
import { POINTS, pointLabel, type Period, type Point } from "../history";

type BalanceChartProps = {
  points: Point[];
  period: Period;
  /** Called with the point under the pointer or keyboard, or null when scrubbing ends. */
  onScrub: (point: Point | null) => void;
  summary: string;
};

/**
 * Balance over time. A 2px ink line over a faint wash, with the live balance
 * marked by the system's lime dot. Scrub with a pointer (touch drags
 * horizontally and still lets the page scroll vertically) or, once focused,
 * the arrow keys: it is a slider whose value text is the date and balance.
 * Paths share a point count, so switching period morphs the line.
 */
export function BalanceChart({ points, period, onScrub, summary }: BalanceChartProps) {
  const [index, setIndex] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const summaryId = `${uid}-summary`;

  const { line, area, y } = useMemo(() => {
    const values = points.map((p) => p.v);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = (max - min || 1) * 0.14;
    const lo = min - pad;
    const hi = max + pad;
    const y = (v: number) => 100 - ((v - lo) / (hi - lo)) * 100;
    const x = (i: number) => (i / (POINTS - 1)) * 100;
    const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(2)} ${y(p.v).toFixed(2)}`).join(" ");
    return { line, area: `${line} L100 100 L0 100 Z`, y };
  }, [points]);

  function update(next: number | null) {
    setIndex(next);
    onScrub(next === null ? null : points[next]);
  }

  function indexAt(clientX: number) {
    const rect = ref.current!.getBoundingClientRect();
    const k = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return Math.round(k * (POINTS - 1));
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" && !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    update(indexAt(event.clientX));
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    update(indexAt(event.clientX));
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = index ?? POINTS - 1;
    const step = event.shiftKey ? 8 : 1;
    const moves: Record<string, number | null> = {
      ArrowLeft: Math.max(0, current - step),
      ArrowDown: Math.max(0, current - step),
      ArrowRight: Math.min(POINTS - 1, current + step),
      ArrowUp: Math.min(POINTS - 1, current + step),
      Home: 0,
      End: POINTS - 1,
      Escape: null,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    update(moves[event.key]);
  }

  const active = index ?? POINTS - 1;
  const point = points[active];
  const xActive = (active / (POINTS - 1)) * 100;
  const morph = "d var(--duration-move) var(--ease-out)";

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label="Balance history"
      aria-describedby={summaryId}
      aria-valuemin={0}
      aria-valuemax={POINTS - 1}
      aria-valuenow={active}
      aria-valuetext={`${pointLabel(period, point.t)}: ${money(point.v)}`}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onPointerUp={(e) => e.pointerType !== "mouse" && update(null)}
      onPointerCancel={() => update(null)}
      onPointerLeave={(e) => e.pointerType === "mouse" && update(null)}
      onKeyDown={onKeyDown}
      onBlur={() => update(null)}
      className="relative h-32 cursor-crosshair touch-pan-y select-none rounded-md outline-offset-4"
    >
      <p id={summaryId} className="sr-only">
        {summary} Use the arrow keys to read the balance at a point in time.
      </p>
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full overflow-visible"
      >
        <defs>
          <linearGradient id={`${uid}-wash`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style={{ stopColor: "var(--ink)", stopOpacity: 0.1 }} />
            <stop offset="1" style={{ stopColor: "var(--ink)", stopOpacity: 0 }} />
          </linearGradient>
          <clipPath id={`${uid}-past`}>
            <rect x="-1" y="-10" width={index === null ? 102 : xActive + 1} height="120" />
          </clipPath>
        </defs>
        <path
          d={area}
          fill={`url(#${uid}-wash)`}
          style={{ d: `path("${area}")`, transition: morph } as React.CSSProperties}
        />
        {/* The future of a scrubbed point dims; the past stays full strength. */}
        <path
          d={line}
          fill="none"
          stroke="var(--ink)"
          strokeOpacity={index === null ? 0 : 0.2}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={{ d: `path("${line}")`, transition: morph } as React.CSSProperties}
        />
        <path
          d={line}
          clipPath={`url(#${uid}-past)`}
          fill="none"
          stroke="var(--ink)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          style={{ d: `path("${line}")`, transition: morph } as React.CSSProperties}
        />
      </svg>

      {index === null ? (
        <span
          aria-hidden
          className="absolute size-2.5 -translate-1/2 transition-[top] duration-(--duration-move) ease-out"
          style={{ left: "100%", top: `${y(points[POINTS - 1].v)}%` }}
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-accent opacity-60" />
          <span className="absolute inset-0 rounded-full bg-accent shadow-[0_0_0_2px_var(--canvas),0_0_0_3px_rgb(0_0_0/0.08)]" />
        </span>
      ) : (
        <>
          <span aria-hidden className="absolute inset-y-0 w-px bg-line-strong" style={{ left: `${xActive}%` }} />
          <span
            aria-hidden
            className="absolute size-2.5 -translate-1/2 rounded-full bg-ink shadow-[0_0_0_2px_var(--canvas)]"
            style={{ left: `${xActive}%`, top: `${y(point.v)}%` }}
          />
        </>
      )}
    </div>
  );
}
