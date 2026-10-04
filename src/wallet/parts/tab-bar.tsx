import { useLayoutEffect, useRef, type ComponentType, type SVGProps } from "react";
import { CardIcon, Home, ListIcon } from "@/components/ui/icons";
import { createSpring, springs, type Spring } from "@/design-system";
import type { Tab } from "../store";
import { caps } from "../theme";

const tabs: { value: Tab; label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }[] = [
  { value: "home", label: "Home", Icon: Home },
  { value: "cards", label: "Cards", Icon: CardIcon },
  { value: "activity", label: "Activity", Icon: ListIcon },
];

/**
 * Primary navigation as a floating, frosted pill. One indicator springs
 * between items (position and width are separate springs, as in the
 * Segmented Control), so it stretches a little on the way. Mono drops the
 * icons for caps words; the indicator alone marks the current tab.
 */
export function TabBar({ tab, onChange, inert }: { tab: Tab; onChange: (tab: Tab) => void; inert?: boolean }) {
  const list = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);
  const s = useRef<{ x: Spring; w: Spring } | null>(null);
  const placed = useRef(false);

  useLayoutEffect(() => {
    const el = indicator.current!;
    const x = createSpring(0, springs.snappy, (v) => (el.style.transform = `translateX(${v}px)`));
    const w = createSpring(0, { stiffness: 420, damping: 34 }, (v) => (el.style.width = `${v}px`));
    s.current = { x, w };
    return () => {
      x.stop();
      w.stop();
      placed.current = false;
    };
  }, []);

  useLayoutEffect(() => {
    const active = list.current?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!active || !s.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const move = placed.current && !reduced ? "set" : "jump";
    s.current.x[move](active.offsetLeft);
    s.current.w[move](active.offsetWidth);
    placed.current = true;
    indicator.current!.style.opacity = "1";
  }, [tab]);

  return (
    <nav
      aria-label="Primary"
      inert={inert}
      className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-[max(14px,env(safe-area-inset-bottom))]"
    >
      <div
        ref={list}
        className="pointer-events-auto relative rounded-full bg-surface/75 mono:rounded-xl p-1 shadow-lg backdrop-blur-xl backdrop-saturate-150"
      >
        <span
          ref={indicator}
          aria-hidden
          className="absolute inset-y-1 left-0 rounded-full bg-ink/[0.07] mono:rounded-lg opacity-0 will-change-transform"
        />
        <ul className="flex items-center">
          {tabs.map(({ value, label, Icon }) => {
            const current = value === tab;
            return (
              <li key={value}>
                <button
                  type="button"
                  aria-current={current ? "page" : undefined}
                  onClick={() => onChange(value)}
                  className={`relative z-10 flex h-11 items-center gap-2 rounded-full px-4 mono:rounded-lg text-meta font-medium transition-[color,transform] duration-(--duration-enter) ease-out active:scale-[0.97] mono:font-normal ${caps} ${
                    current ? "text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  <Icon className="size-4 mono:hidden" />
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
