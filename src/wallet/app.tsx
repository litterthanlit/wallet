import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { setTheme, themes, useTheme, type Theme } from "@/components/ui/theme-toggle";
import { ToastStack } from "@/components/ui/toast-stack";
import { Button, Dot, Kbd } from "@/design-system";
import { contactById } from "./data";
import { TabBar } from "./parts/tab-bar";
import { RequestSheet } from "./sheets/request-sheet";
import { SendSheet } from "./sheets/send-sheet";
import { TopUpSheet } from "./sheets/top-up-sheet";
import { TxnSheet } from "./sheets/txn-sheet";
import { UIContext, WalletProvider, useWallet, type SheetState, type Tab, type UI } from "./store";
import { caps } from "./theme";
import { ActivityView } from "./views/activity";
import { CardsView } from "./views/cards";
import { HomeView } from "./views/home";

type Opened = NonNullable<SheetState>;

export function App() {
  return (
    <WalletProvider>
      <Shell />
    </WalletProvider>
  );
}

function Shell() {
  const { state, dispatch } = useWallet();
  const [tab, setTabState] = useState<Tab>("home");
  const [sheet, setSheet] = useState<SheetState>(null);
  // The last payload and an open count per sheet kind: a closing sheet keeps
  // its content through the exit, and reopening starts the flow fresh.
  const [opened, setOpened] = useState<Partial<Record<Opened["kind"], { n: number; payload: Opened }>>>({});
  const main = useRef<HTMLElement>(null);

  const setTab = useCallback((next: Tab) => {
    setTabState(next);
    main.current?.scrollTo({ top: 0 });
  }, []);

  const openSheet = useCallback((next: Opened) => {
    setSheet(next);
    setOpened((o) => ({ ...o, [next.kind]: { n: (o[next.kind]?.n ?? 0) + 1, payload: next } }));
  }, []);

  const closeSheet = useCallback(() => setSheet(null), []);
  const dismissToast = useCallback((id: number) => dispatch({ type: "dismissToast", id }), [dispatch]);

  const ui = useMemo<UI>(
    () => ({ tab, setTab, sheet, openSheet, closeSheet }),
    [tab, setTab, sheet, openSheet, closeSheet],
  );

  // Single-key shortcuts, ignored while typing or while a sheet is open.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (sheet || event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if ((event.target as HTMLElement).closest("input, textarea, [contenteditable='true']")) return;
      const actions: Record<string, () => void> = {
        "1": () => setTab("home"),
        "2": () => setTab("cards"),
        "3": () => setTab("activity"),
        s: () => openSheet({ kind: "send" }),
        r: () => openSheet({ kind: "request" }),
        t: () => openSheet({ kind: "topUp" }),
        h: () => dispatch({ type: "toggleHidden" }),
      };
      const action = actions[event.key.toLowerCase()];
      if (!action) return;
      event.preventDefault();
      action();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet, setTab, openSheet, dispatch]);

  // A few seconds in, Ada pays Alex back: the ticker and a toast arrive together.
  useEffect(() => {
    const id = setTimeout(() => {
      dispatch({ type: "receive", contact: contactById("ada")!, amount: 4200, note: "Dinner on Friday" });
      dispatch({ type: "toast", title: "Ada Lin sent you $42.00", body: "“Dinner on Friday”" });
    }, 6000);
    return () => clearTimeout(id);
  }, [dispatch, state.epoch]);

  function reset() {
    dispatch({ type: "reset" });
    setSheet(null);
    setTab("home");
  }

  const sendPayload = opened.send?.payload;
  const txnPayload = opened.txn?.payload;

  return (
    <UIContext value={ui}>
      <div className="relative isolate min-h-full">
        <div aria-hidden className="atmosphere pointer-events-none fixed inset-0 -z-10 hidden sm:block" />
        <div className="mx-auto flex min-h-dvh w-full max-w-[1104px] items-center justify-center gap-16 sm:px-6 sm:py-6 lg:justify-between">
          <Intro onReset={reset} />

          {/* The device: full-bleed on phones, a framed object on larger screens. */}
          <div className="fixed inset-0 overflow-hidden bg-canvas sm:relative sm:inset-auto sm:h-[min(844px,calc(100dvh-48px))] sm:min-h-[600px] sm:w-[390px] sm:shrink-0 sm:rounded-[44px] sm:shadow-lg">
            <div aria-hidden className="atmosphere pointer-events-none absolute inset-0" />
            <div className="relative flex h-full flex-col">
              <StatusBar />
              <main
                ref={main}
                inert={!!sheet}
                className="no-scrollbar relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-32"
              >
                {/* Top padding lives inside the scroller so sticky headers pin flush to its edge. */}
                <div
                  key={`${tab}-${state.epoch}`}
                  className="animate-enter pt-[max(16px,env(safe-area-inset-top))] sm:pt-3"
                >
                  {tab === "home" ? <HomeView /> : tab === "cards" ? <CardsView /> : <ActivityView />}
                </div>
              </main>

              <TabBar tab={tab} onChange={setTab} inert={!!sheet} />

              <div className="pointer-events-none absolute inset-x-3 top-[max(12px,env(safe-area-inset-top))] z-40 flex justify-center sm:top-12">
                <div className="pointer-events-auto w-full max-w-[340px]">
                  <ToastStack toasts={state.toasts} onDismiss={dismissToast} />
                </div>
              </div>

              <SendSheet
                key={`send-${opened.send?.n ?? 0}-${state.epoch}`}
                open={sheet?.kind === "send"}
                contactId={sendPayload?.kind === "send" ? sendPayload.contactId : undefined}
                onClose={closeSheet}
              />
              <RequestSheet
                key={`request-${opened.request?.n ?? 0}`}
                open={sheet?.kind === "request"}
                onClose={closeSheet}
              />
              <TopUpSheet key={`topUp-${opened.topUp?.n ?? 0}`} open={sheet?.kind === "topUp"} onClose={closeSheet} />
              <TxnSheet
                key={`txn-${opened.txn?.n ?? 0}`}
                open={sheet?.kind === "txn"}
                id={txnPayload?.kind === "txn" ? txnPayload.id : undefined}
                onClose={closeSheet}
              />
            </div>
          </div>
        </div>
      </div>
    </UIContext>
  );
}

/** iOS-style status bar, only on the framed device. Decorative. */
function StatusBar() {
  return (
    <div
      aria-hidden
      className="hidden h-12 shrink-0 items-center justify-between px-8 pt-2 text-[15px] font-medium tracking-tight text-ink sm:flex"
    >
      <span className="tabular-nums">9:41</span>
      <span className="flex items-center gap-1.5">
        <svg viewBox="0 0 18 12" className="h-3 w-[18px]" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg
          viewBox="0 0 16 12"
          className="h-3 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <path d="M1.5 4.5a9.5 9.5 0 0 1 13 0M4 7.2a5.8 5.8 0 0 1 8 0" />
          <circle cx="8" cy="10" r="1" fill="currentColor" stroke="none" />
        </svg>
        <svg viewBox="0 0 27 13" className="h-[13px] w-[27px]" fill="none">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="17" height="9" rx="2" fill="currentColor" />
          <path d="M25 4.5v4a2 2 0 0 0 0-4Z" fill="currentColor" opacity="0.4" />
        </svg>
      </span>
    </div>
  );
}

const tries = [
  {
    title: "Scrub the balance",
    body: "Drag across the chart, or focus it and use the arrow keys. The digits roll to each point.",
  },
  { title: "Hold to send", body: "Pick someone, type an amount, then hold. Letting go early rewinds the fill." },
  { title: "Freeze a card", body: "On Cards, the art drains to grey. Press a card to send a pulse through it." },
  { title: "Wait a moment", body: "Ada pays you back a few seconds in. The toast and the balance arrive together." },
  {
    title: "Switch to mono",
    body: "A Nothing-style light theme: monospace caps, an LED chart, card art seen through dots, one red signal.",
  },
];

const shortcuts: [string[], string][] = [
  [["1", "2", "3"], "Switch tabs"],
  [["S"], "Send"],
  [["R"], "Request"],
  [["T"], "Top up"],
  [["H"], "Hide balance"],
  [["Esc"], "Close a sheet"],
];

/** The editorial column beside the device on wide screens. */
function Intro({ onReset }: { onReset: () => void }) {
  const theme = useTheme();
  return (
    <aside aria-label="About this prototype" className="hidden max-w-[420px] flex-col lg:flex">
      <p className="text-body">
        <span className="font-medium text-ink">Wallet</span>
        <span className="text-muted"> · Prototype v0.1</span>
      </p>
      <p className="mt-3 text-lead text-ink">
        A digital wallet built from the litt design system. Tokens, type, motion and components come straight from the
        components gallery.
      </p>

      <h2 className={`mt-12 text-body text-ink mono:text-meta ${caps}`}>Try this</h2>
      <ol className="mt-3 flex flex-col gap-4">
        {tries.map((t, i) => (
          <li key={t.title}>
            <p className="text-body font-medium text-ink">
              <span className="mr-2 tabular-nums text-subtle">{i + 1}</span>
              {t.title}
            </p>
            <p className="mt-0.5 text-body text-muted">{t.body}</p>
          </li>
        ))}
      </ol>

      <h2 className={`mt-12 text-body text-ink mono:text-meta ${caps}`}>Keyboard</h2>
      <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
        {shortcuts.map(([keys, label]) => (
          <li key={label} className="flex items-center gap-2 text-body text-muted">
            <span className="flex gap-1">
              {keys.map((k) => (
                <Kbd key={k}>{k}</Kbd>
              ))}
            </span>
            {label}
          </li>
        ))}
      </ul>

      <div className="mt-12 flex flex-wrap items-center gap-3">
        <Button onClick={onReset}>Reset prototype</Button>
        <SegmentedControl label="Theme" options={themes} value={theme} onChange={(v) => setTheme(v as Theme)} />
      </div>
      <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Dot />
          Sample data, no real money moves
        </span>
        <span aria-hidden>·</span>
        <a
          href="https://github.com/litterthanlit/components"
          target="_blank"
          rel="noreferrer"
          className="rounded-sm transition-colors duration-(--duration-exit) hover:text-ink hover:duration-(--duration-enter)"
        >
          litterthanlit/components ↗
        </a>
      </p>
    </aside>
  );
}
