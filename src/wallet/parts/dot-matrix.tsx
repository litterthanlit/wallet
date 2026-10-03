import { useEffect, useLayoutEffect, useRef } from "react";
import { useTheme } from "@/components/ui/theme-toggle";

/** Delay between neighbouring columns as a new set of levels rolls in, ms. */
const STAGGER = 4;
const DURATION = 420;
const easeOut = (t: number) => 1 - (1 - t) ** 3;

type DotMatrixProps = {
  /** One level per column, 0 to 1. */
  levels: number[];
  /** The scrubbed column, or null for the resting state. */
  active: number | null;
};

/**
 * Columns of LEDs, after the Nothing OS widgets. Square grid, one column per
 * point; unlit dots stay faintly visible so it reads as a panel. Lit counts
 * are whole numbers, so a change steps dot by dot in a wave from the left
 * rather than sliding. The latest column carries the red signal dot; while
 * scrubbing, the future dims and the scrubbed column takes the dot.
 * Decorative: the slider around it carries the value.
 */
export function DotMatrix({ levels, active }: DotMatrixProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  const anim = useRef({ from: [] as number[], to: [] as number[], start: 0, raf: 0 });
  const live = useRef({ active, size: { w: 0, h: 0, dpr: 1 }, ink: "", accent: "" });

  const levelAt = (i: number, now: number) => {
    const { from, to, start } = anim.current;
    const t = Math.min(1, Math.max(0, (now - start - i * STAGGER) / DURATION));
    return (from[i] ?? 0) + ((to[i] ?? 0) - (from[i] ?? 0)) * easeOut(t);
  };

  const paint = useRef((now: number) => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    const { size, ink, accent, active } = live.current;
    const cols = anim.current.to.length;
    if (!el || !ctx || !size.w || !cols) return;
    const pitch = size.w / cols;
    const rows = Math.max(1, Math.floor(size.h / pitch));
    const r = pitch * 0.32;
    const signal = active ?? cols - 1;

    ctx.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
    ctx.clearRect(0, 0, size.w, size.h);
    for (let i = 0; i < cols; i++) {
      const lit = Math.max(1, Math.round(levelAt(i, now) * rows));
      const alpha = active === null ? 0.72 : i === active ? 1 : i < active ? 0.72 : 0.16;
      const x = (i + 0.5) * pitch;
      for (let j = 0; j < rows; j++) {
        const on = j < lit;
        const top = on && j === lit - 1 && i === signal;
        ctx.globalAlpha = top ? 1 : on ? alpha : 0.06;
        ctx.fillStyle = top ? accent : ink;
        ctx.beginPath();
        ctx.arc(x, size.h - (j + 0.5) * pitch, top ? r * 1.5 : r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });

  const run = useRef(() => {
    cancelAnimationFrame(anim.current.raf);
    const frame = (now: number) => {
      paint.current(now);
      const end = anim.current.start + (anim.current.to.length - 1) * STAGGER + DURATION;
      anim.current.raf = now < end ? requestAnimationFrame(frame) : 0;
    };
    anim.current.raf = requestAnimationFrame(frame);
  });

  // New levels roll in from wherever the dots are now (from empty on mount).
  useEffect(() => {
    const now = performance.now();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = reduced ? levels : levels.map((_, i) => (anim.current.to.length ? levelAt(i, now) : 0));
    anim.current = { ...anim.current, from, to: levels, start: now };
    run.current();
  }, [levels]);

  // Colours come from the tokens, so re-read them when the theme changes.
  useLayoutEffect(() => {
    const style = getComputedStyle(canvas.current!);
    live.current.ink = style.getPropertyValue("--ink").trim();
    live.current.accent = style.getPropertyValue("--accent").trim();
    if (!anim.current.raf) paint.current(performance.now());
  }, [theme]);

  useEffect(() => {
    live.current.active = active;
    if (!anim.current.raf) paint.current(performance.now());
  }, [active]);

  useLayoutEffect(() => {
    const el = canvas.current!;
    const observer = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      const dpr = window.devicePixelRatio || 1;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      live.current.size = { w, h, dpr };
      paint.current(performance.now());
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(anim.current.raf);
      anim.current.raf = 0;
    };
  }, []);

  return <canvas ref={canvas} aria-hidden className="absolute inset-0 size-full" />;
}
