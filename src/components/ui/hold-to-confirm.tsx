/*
 * Vendored from litterthanlit/components@afb2ce1 (src/registry/components/hold-to-confirm.tsx).
 * Changes: gallery demo removed; `tone` (danger | accent), `size` and `hint` props.
 */
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

type HoldToConfirmProps = {
  onConfirm: () => void;
  children: ReactNode;
  /** Hold duration in ms. */
  duration?: number;
  /** danger for destructive actions; accent (lime) for moments of success. */
  tone?: "danger" | "accent";
  /** md is the inline pill; lg is a full-width, 48px action. */
  size?: "md" | "lg";
  /** Visually hidden instruction for screen readers. */
  hint?: string;
  disabled?: boolean;
  className?: string;
};

const tones = { danger: "bg-danger text-canvas", accent: "bg-accent text-accent-ink" };
const sizes = { md: "h-10 px-5", lg: "h-12 w-full px-6" };

/**
 * A destructive action that asks for intent: press and hold (pointer, Space or
 * Enter) until the fill completes. Releasing early rewinds the fill quickly.
 * The fill is a clip-path on a duplicate label so text stays legible on both
 * the empty and filled halves.
 */
export function HoldToConfirm({
  onConfirm,
  children,
  duration = 1200,
  tone = "danger",
  size = "md",
  hint = "Press and hold to confirm",
  disabled = false,
  className = "",
}: HoldToConfirmProps) {
  const [holding, setHolding] = useState(false);
  const hintId = useId();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function start() {
    if (holding || disabled) return;
    setHolding(true);
    timer.current = setTimeout(() => {
      setHolding(false);
      onConfirm();
    }, duration);
  }

  function cancel() {
    clearTimeout(timer.current);
    setHolding(false);
  }

  const fill = {
    clipPath: holding ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
    transition: `clip-path ${holding ? duration : 200}ms ${holding ? "linear" : "var(--ease-out)"}`,
  };

  return (
    <button
      type="button"
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat) {
          e.preventDefault();
          start();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") cancel();
      }}
      onContextMenu={(e) => e.preventDefault()}
      aria-describedby={hintId}
      disabled={disabled}
      className={`relative select-none overflow-hidden rounded-full bg-surface text-body font-medium text-ink shadow-sm transition-[transform,opacity] duration-(--duration-exit) ease-out [-webkit-touch-callout:none] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 ${sizes[size]} ${className}`}
    >
      <span className="inline-flex items-center gap-2">{children}</span>
      <span
        aria-hidden
        className={`absolute inset-0 flex items-center justify-center gap-2 ${tones[tone]}`}
        style={fill}
      >
        {children}
      </span>
      <span id={hintId} className="sr-only">
        {hint}
      </span>
    </button>
  );
}
