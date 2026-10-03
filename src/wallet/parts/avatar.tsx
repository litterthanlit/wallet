import type { ComponentType, SVGProps } from "react";
import { Bag, Bolt, Cash, Cup, Plane, Plus, Ticket, Tram } from "@/components/ui/icons";
import type { Category, Txn } from "../data";
import { initials } from "../format";

const sizes = {
  sm: "size-8 text-meta",
  md: "size-9 text-meta",
  lg: "size-12 text-body",
  xl: "size-14 text-lead",
};

type Size = keyof typeof sizes;

/** A person: initials on a panel disc with a hairline ring. */
export function Avatar({ name, size = "md", className = "" }: { name: string; size?: Size; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-grid shrink-0 select-none place-items-center rounded-full bg-panel font-medium text-ink shadow-[inset_0_0_0_1px_var(--line)] ${sizes[size]} ${className}`}
    >
      {initials(name)}
    </span>
  );
}

const glyphs: Partial<Record<Category, ComponentType<SVGProps<SVGSVGElement>>>> = {
  food: Cup,
  transport: Tram,
  shopping: Bag,
  entertainment: Ticket,
  travel: Plane,
  bills: Bolt,
  income: Cash,
  topup: Plus,
};

/** A transaction's mark: a category glyph for merchants, initials for people. */
export function TxnAvatar({ txn, size = "md" }: { txn: Txn; size?: Size }) {
  const Glyph = glyphs[txn.category];
  if (!Glyph) return <Avatar name={txn.name} size={size} />;
  return (
    <span
      aria-hidden
      className={`inline-grid shrink-0 place-items-center rounded-full bg-panel text-ink shadow-[inset_0_0_0_1px_var(--line)] ${sizes[size]}`}
    >
      <Glyph className={size === "lg" || size === "xl" ? "size-5" : "size-4"} />
    </span>
  );
}
