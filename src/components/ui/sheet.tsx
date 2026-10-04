import { useEffect, useId, useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { createSpring, IconButton, type Spring } from "@/design-system";
import { Close } from "./icons";

/** Critically damped (2·√380 ≈ 39): settles fast and never overshoots the bottom edge. */
const SHEET_SPRING = { stiffness: 380, damping: 40 };
const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])';

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  /** Slot before the title, e.g. a back button in a multi-step flow. */
  leading?: ReactNode;
  /** Fill most of the screen instead of hugging the content. */
  tall?: boolean;
  children: ReactNode;
};

/**
 * A modal bottom sheet, positioned inside its nearest positioned ancestor (the
 * device frame). It rides a spring, so a drag hands off to the release motion
 * without a jump: drag the handle down past a third, or flick it, to dismiss.
 * Focus moves in on open, is trapped while open and returns on close; Escape
 * and the scrim close it.
 */
export function Sheet(props: SheetProps) {
  const [mounted, setMounted] = useState(props.open);
  if (props.open && !mounted) setMounted(true);
  return mounted ? <SheetPanel {...props} onExited={() => setMounted(false)} /> : null;
}

function SheetPanel({
  open,
  onClose,
  onExited,
  title,
  description,
  leading,
  tall,
  children,
}: SheetProps & { onExited: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const spring = useRef<Spring>(null);
  const height = useRef(0);
  const closing = useRef(false);
  const exited = useRef(onExited);
  const drag = useRef<{ y: number; from: number; lastY: number; lastT: number; v: number } | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    exited.current = onExited;
  }, [onExited]);

  useLayoutEffect(() => {
    const el = panel.current!;
    const bg = scrim.current!;
    const s = createSpring(0, SHEET_SPRING, (y) => {
      el.style.transform = `translate3d(0, ${y}px, 0)`;
      bg.style.opacity = String(Math.min(1, Math.max(0, 1 - y / (height.current || 1))));
      if (closing.current && y >= height.current - 0.5) {
        closing.current = false;
        exited.current();
      }
    });
    spring.current = s;
    height.current = el.offsetHeight;
    s.jump(height.current);
    return () => s.stop();
  }, []);

  useLayoutEffect(() => {
    const s = spring.current!;
    height.current = panel.current!.offsetHeight;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    closing.current = !open;
    const target = open ? 0 : height.current;
    if (reduced) s.jump(target);
    else s.set(target);
  }, [open]);

  // Move focus in, and give it back to whatever opened the sheet.
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const el = panel.current!;
    (el.querySelector<HTMLElement>("[data-autofocus]") ?? el).focus({ preventScroll: true });
    return () => previous?.focus?.({ preventScroll: true });
  }, [open]);

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;
    const items = [...panel.current!.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement as HTMLElement;
    const inside = items.includes(active);
    if (event.shiftKey && (active === first || !inside)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !inside)) {
      event.preventDefault();
      first.focus();
    }
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("button, input, a")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const from = spring.current!.value;
    drag.current = { y: event.clientY, from, lastY: event.clientY, lastT: event.timeStamp, v: 0 };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    const dy = event.clientY - d.y;
    const next = d.from + dy;
    // Rubber-band upward drags so the sheet never detaches from the bottom.
    spring.current!.jump(next < 0 ? next * 0.2 : next);
    const dt = Math.max(1, event.timeStamp - d.lastT);
    d.v = (event.clientY - d.lastY) / dt;
    d.lastY = event.clientY;
    d.lastT = event.timeStamp;
  }

  function onPointerUp() {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    const y = spring.current!.value;
    if (y > height.current / 3 || d.v > 0.5) onClose();
    else spring.current!.set(0);
  }

  return (
    <>
      <div ref={scrim} aria-hidden onClick={onClose} className="absolute inset-0 z-30 bg-(--scrim) opacity-0" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        style={{ transform: "translate3d(0, 100%, 0)" }}
        className={`absolute inset-x-0 bottom-0 z-30 flex flex-col rounded-t-xl bg-surface shadow-lg outline-none will-change-transform mono:bg-canvas ${
          tall ? "h-[calc(100%-44px)]" : "max-h-[calc(100%-44px)]"
        }`}
      >
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="shrink-0 cursor-grab touch-none select-none active:cursor-grabbing"
        >
          <div aria-hidden className="mx-auto mt-2 h-1 w-9 rounded-full bg-line-strong" />
          <header className="flex items-start gap-2 px-5 pb-4 pt-3">
            {leading}
            <div className="min-w-0 flex-1 pt-1">
              <h2 id={titleId} className="text-title font-medium text-ink">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="mt-0.5 text-body text-muted">
                  {description}
                </p>
              )}
            </div>
            <IconButton label="Close" onClick={onClose} className="-mr-2">
              <Close />
            </IconButton>
          </header>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 pb-[max(20px,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </>
  );
}
