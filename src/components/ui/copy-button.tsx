/*
 * Vendored from litterthanlit/components@afb2ce1 (src/registry/components/copy-button.tsx).
 * Changes: gallery demo removed; copyText() is exported and falls back to
 * execCommand when the async clipboard is refused (embedded frames, webviews).
 */
import { useEffect, useRef, useState } from "react";

/** Clipboard fallback for frames that refuse the async API. */
function legacyCopy(value: string) {
  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.cssText = "position:fixed;opacity:0;pointer-events:none";
  document.body.appendChild(field);
  field.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    // Not supported here either; report failure.
  }
  field.remove();
  return ok;
}

/** Copy text, falling back to execCommand. Resolves to whether it worked. */
export async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return legacyCopy(value);
  }
}

type CopyButtonProps = {
  value: string;
  label?: string;
  className?: string;
};

/**
 * Copies `value` to the clipboard. The two icons share a slot and cross-fade
 * with a little scale and blur, and the checkmark draws itself in. A visually
 * hidden live region announces the result.
 */
export function CopyButton({ value, label = "Copy to clipboard", className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    if (!(await copyText(value))) return;
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  }

  const icon = "absolute inset-0 m-auto size-4 transition-[opacity,transform,filter] duration-(--duration-enter) ease-out";

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      className={`relative inline-grid size-8 place-items-center rounded-md text-muted transition-[background-color,color,transform] duration-(--duration-exit) ease-out hover:bg-panel hover:text-ink hover:duration-(--duration-enter) active:scale-[0.92] ${className}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        fill="none"
        className={icon}
        style={{ opacity: copied ? 0 : 1, transform: copied ? "scale(0.5)" : "none", filter: copied ? "blur(3px)" : "none" }}
      >
        <rect x="5.5" y="5.5" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M10.5 3.5v-.25A1.75 1.75 0 0 0 8.75 1.5h-5.5A1.75 1.75 0 0 0 1.5 3.25v5.5c0 .97.78 1.75 1.75 1.75h.25" stroke="currentColor" strokeWidth="1.3" />
      </svg>
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        fill="none"
        className={`${icon} text-accent-strong`}
        style={{ opacity: copied ? 1 : 0, transform: copied ? "none" : "scale(0.5)", filter: copied ? "none" : "blur(3px)" }}
      >
        <path
          d="m3 8.5 3.2 3L13 4.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={copied ? 0 : 1}
          className="transition-[stroke-dashoffset] delay-75 duration-(--duration-move) ease-out"
        />
      </svg>
      <span className="sr-only" role="status">
        {copied ? "Copied" : ""}
      </span>
    </button>
  );
}
