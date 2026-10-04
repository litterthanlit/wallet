import { useEffect, useState } from "react";

/**
 * The moment of success: a lime disc that settles from 0.9 (never from 0)
 * on the spring curve, then a check that draws itself, as in the Copy Button.
 * Mono keeps red for actions and live dots, so its disc is ink.
 */
export function SuccessMark() {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <span
      aria-hidden
      className="grid size-16 place-items-center rounded-full bg-accent text-accent-ink shadow-[0_0_0_8px_color-mix(in_oklab,var(--accent)_22%,transparent)] mono:bg-ink mono:text-canvas mono:shadow-[0_0_0_8px_color-mix(in_oklab,var(--ink)_8%,transparent)] transition-[transform,opacity] duration-(--duration-move) ease-spring"
      style={{ transform: drawn ? "none" : "scale(0.9)", opacity: drawn ? 1 : 0 }}
    >
      <svg viewBox="0 0 16 16" fill="none" className="size-7">
        <path
          d="m3 8.5 3.2 3L13 4.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={drawn ? 0 : 1}
          className="transition-[stroke-dashoffset] delay-150 duration-(--duration-move) ease-out"
        />
      </svg>
    </span>
  );
}
