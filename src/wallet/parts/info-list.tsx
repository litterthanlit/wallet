import type { ReactNode } from "react";
import { CopyButton } from "@/components/ui/copy-button";

/** Label/value pairs on a panel tint: flat information, so no raised card. */
export function InfoList({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <dl className={`divide-y divide-line rounded-xl bg-panel shadow-[inset_0_0_0_1px_var(--line)] ${className}`}>
      {children}
    </dl>
  );
}

export function InfoRow({
  label,
  children,
  copy,
  mono = false,
}: {
  label: string;
  children: ReactNode;
  /** Text to copy; adds a copy button labelled from `label`. */
  copy?: string;
  mono?: boolean;
}) {
  return (
    <div className="relative flex min-h-11 items-center justify-between gap-4 py-2.5 pl-4 pr-4">
      <dt className="shrink-0 text-body text-muted">{label}</dt>
      <dd
        className={`min-w-0 truncate text-right text-body text-ink ${mono ? "font-mono tabular-nums" : ""} ${copy ? "pr-8" : ""}`}
      >
        {children}
        {copy && (
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2">
            <CopyButton value={copy} label={`Copy ${label.toLowerCase()}`} />
          </span>
        )}
      </dd>
    </div>
  );
}
