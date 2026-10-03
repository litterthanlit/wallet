import { useLayoutEffect, useRef } from "react";
import { createSpring, springs } from "@/design-system";

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Accessible name; pass `labelledBy` instead when a visible label exists. */
  label?: string;
  labelledBy?: string;
  describedBy?: string;
  disabled?: boolean;
};

const TRAVEL = 14;

/**
 * A two-state toggle. The thumb rides the design system's snappy spring, so
 * rapid toggling flows instead of restarting. On is ink, not lime: lime is
 * kept for status and success.
 */
export function Switch({ checked, onChange, label, labelledBy, describedBy, disabled = false }: SwitchProps) {
  const thumb = useRef<HTMLSpanElement>(null);
  const spring = useRef<ReturnType<typeof createSpring>>(null);

  useLayoutEffect(() => {
    const el = thumb.current!;
    const s = createSpring(0, springs.snappy, (v) => (el.style.transform = `translateX(${v}px)`));
    spring.current = s;
    return () => s.stop();
  }, []);

  const first = useRef(true);
  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    spring.current?.[first.current || reduced ? "jump" : "set"](checked ? TRAVEL : 0);
    first.current = false;
  }, [checked]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-[34px] shrink-0 items-center rounded-full p-0.5 transition-[background-color,box-shadow] duration-(--duration-enter) ease-out disabled:opacity-50 ${
        checked ? "bg-ink shadow-none" : "bg-panel shadow-[inset_0_0_0_1px_var(--line-strong)]"
      }`}
    >
      <span
        ref={thumb}
        aria-hidden
        className="size-4 rounded-full bg-surface shadow-[0_0_0_1px_var(--line),0_1px_2px_rgb(0_0_0/0.12)] will-change-transform"
      />
    </button>
  );
}
