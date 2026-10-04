import { useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { createSpring, springs, type Spring } from "@/design-system";
import { caps } from "../theme";

type TextTabsProps<T extends string> = {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

/**
 * Options as plain caps words, with a soft pill behind the chosen one that
 * springs between them (position and width separately, as in the Tab Bar).
 * No track and no outline: the pill and the ink colour carry the choice.
 * A radio group: one tab stop; arrows, Home and End move the choice.
 */
export function TextTabs<T extends string>({ label, options, value, onChange }: TextTabsProps<T>) {
  const list = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const s = useRef<{ x: Spring; w: Spring } | null>(null);
  const placed = useRef(false);

  useLayoutEffect(() => {
    const el = pill.current!;
    const x = createSpring(0, springs.snappy, (v) => (el.style.transform = `translateX(${v}px)`));
    const w = createSpring(0, { stiffness: 420, damping: 34 }, (v) => (el.style.width = `${v}px`));
    s.current = { x, w };

    // Snap, without a spring, when the words reflow (fonts loading).
    const el2 = list.current!;
    let width = el2.offsetWidth;
    const observer = new ResizeObserver(() => {
      if (el2.offsetWidth === width) return;
      width = el2.offsetWidth;
      const active = el2.querySelector<HTMLElement>('[aria-checked="true"]');
      if (active) {
        x.jump(active.offsetLeft);
        w.jump(active.offsetWidth);
      }
    });
    observer.observe(el2);

    return () => {
      observer.disconnect();
      x.stop();
      w.stop();
      placed.current = false;
    };
  }, []);

  useLayoutEffect(() => {
    const active = list.current?.querySelector<HTMLElement>('[aria-checked="true"]');
    if (!active || !s.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const move = placed.current && !reduced ? "set" : "jump";
    s.current.x[move](active.offsetLeft);
    s.current.w[move](active.offsetWidth);
    placed.current = true;
    pill.current!.style.opacity = "1";
  }, [value]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const at = options.findIndex((o) => o.value === value);
    const moves: Record<string, number> = {
      ArrowRight: (at + 1) % options.length,
      ArrowDown: (at + 1) % options.length,
      ArrowLeft: (at - 1 + options.length) % options.length,
      ArrowUp: (at - 1 + options.length) % options.length,
      Home: 0,
      End: options.length - 1,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const next = moves[event.key];
    onChange(options[next].value);
    list.current?.querySelectorAll<HTMLElement>('[role="radio"]')[next]?.focus();
  }

  return (
    <div ref={list} role="radiogroup" aria-label={label} onKeyDown={onKeyDown} className="relative flex">
      <span
        ref={pill}
        aria-hidden
        className="absolute inset-y-0 left-0 rounded-md bg-ink/[0.06] opacity-0 will-change-transform"
      />
      {options.map((o) => {
        const checked = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(o.value)}
            className={`relative z-10 flex h-7 items-center rounded-md px-2.5 text-meta transition-[color,transform] duration-(--duration-exit) ease-out hover:duration-(--duration-enter) active:scale-[0.97] ${caps} ${
              checked ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
