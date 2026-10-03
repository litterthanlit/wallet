import { useEffect, useId, useRef, useState, type ComponentType, type SVGProps } from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { HoldToConfirm } from "@/components/ui/hold-to-confirm";
import { Cash, Contactless, Eye, EyeOff, Globe, Plus, Snowflake } from "@/components/ui/icons";
import { Switch } from "@/components/ui/switch";
import { Button, IconButton } from "@/design-system";
import { makeVirtualCard, spentRecently, user, type Card } from "../data";
import { lastFour, money } from "../format";
import { PaymentCard } from "../parts/payment-card";
import { useWallet } from "../store";

const GAP = 12;

/** Centre card `i` in the carousel. */
function scrollToCard(el: HTMLElement | null, i: number) {
  const child = el?.children[i] as HTMLElement | undefined;
  if (!el || !child) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollTo({
    left: child.offsetLeft - (el.clientWidth - child.offsetWidth) / 2,
    behavior: reduced ? "auto" : "smooth",
  });
}

export function CardsView() {
  const { state, dispatch } = useWallet();
  const [active, setActive] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const created = useRef(state.cards.length);
  const index = Math.min(active, state.cards.length - 1);
  const card = state.cards[index];

  const goTo = (i: number) => scrollToCard(scroller.current, i);

  function onScroll() {
    const el = scroller.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const i = Math.round(el.scrollLeft / (first.offsetWidth + GAP));
    if (i !== active) {
      setActive(i);
      setRevealed(false);
    }
  }

  // A newly created card slides into view.
  useEffect(() => {
    if (state.cards.length > created.current) scrollToCard(scroller.current, state.cards.length - 1);
    created.current = state.cards.length;
  }, [state.cards.length]);

  function createCard() {
    const n = state.cards.filter((c) => c.kind === "Virtual").length + 1;
    const next = { ...makeVirtualCard(n), id: `virtual-${state.seq}` };
    dispatch({ type: "addCard", card: next });
    dispatch({
      type: "toast",
      title: "Virtual card ready",
      body: `${next.name} •••• ${lastFour(next.number)}. Use it for subscriptions and one-off buys.`,
    });
  }

  return (
    <div className="flex flex-col">
      <header className="flex items-center justify-between">
        <h1 className="text-title font-medium text-ink">Cards</h1>
        <IconButton label="Create virtual card" onClick={createCard} className="-mr-2">
          <Plus />
        </IconButton>
      </header>

      {card ? (
        <>
          <div
            ref={scroller}
            onScroll={onScroll}
            aria-label="Your cards"
            role="group"
            className="no-scrollbar relative -mx-5 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-2"
          >
            {state.cards.map((c, i) => (
              <div
                key={c.id}
                className="w-[88%] shrink-0 snap-center animate-enter"
                style={{ animationDelay: `calc(${Math.min(i, 8)} * var(--stagger))` }}
              >
                <PaymentCard card={c} seed={i} />
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-body font-medium text-ink">
                {card.name} {card.frozen && <span className="font-normal text-muted">(Frozen)</span>}
              </p>
              <p className="text-meta text-muted">
                {card.kind} · •••• {lastFour(card.number)}
              </p>
            </div>
            {state.cards.length > 1 && (
              <div className="flex shrink-0 items-center gap-0.5">
                {state.cards.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Show ${c.name} card`}
                    aria-current={i === index || undefined}
                    className="grid size-5 place-items-center rounded-full"
                  >
                    <span
                      className={`h-1.5 rounded-full transition-[width,background-color] duration-(--duration-move) ease-out ${
                        i === index ? "w-4 bg-ink" : "w-1.5 bg-line-strong"
                      }`}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <CardPanel key={card.id} card={card} revealed={revealed} onReveal={setRevealed} />
        </>
      ) : (
        <div className="mt-6 flex animate-enter flex-col items-center gap-3 rounded-xl bg-panel px-6 py-12 text-center shadow-[inset_0_0_0_1px_var(--line)]">
          <p className="text-body font-medium text-ink">No cards yet</p>
          <p className="max-w-[240px] text-body text-muted">A virtual card works straight away for online payments.</p>
          <Button variant="primary" onClick={createCard} className="mt-2">
            <Plus />
            Create virtual card
          </Button>
        </div>
      )}
    </div>
  );
}

function CardPanel({ card, revealed, onReveal }: { card: Card; revealed: boolean; onReveal: (v: boolean) => void }) {
  const { state, dispatch } = useWallet();
  const detailsId = useId();
  const spent = spentRecently(state.txns, card.id);
  const share = Math.min(100, Math.round((spent / card.limit) * 100));
  const ending = `•••• ${lastFour(card.number)}`;

  function freeze() {
    const frozen = !card.frozen;
    dispatch({ type: "updateCard", id: card.id, patch: { frozen } });
    dispatch({
      type: "toast",
      title: frozen ? "Card frozen" : "Card unfrozen",
      body: frozen
        ? `${card.name} ${ending}. New payments are declined until you unfreeze it.`
        : `${card.name} ${ending} works again.`,
    });
  }

  function cancel() {
    dispatch({ type: "cancelCard", id: card.id });
    dispatch({ type: "toast", title: "Card cancelled", body: `${card.name} ${ending} no longer works.` });
  }

  const controls: {
    key: "online" | "contactless" | "atm";
    label: string;
    hint: string;
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
  }[] = [
    { key: "online", label: "Online payments", hint: "Shops, apps and subscriptions", Icon: Globe },
    ...(card.kind === "Debit"
      ? ([
          { key: "contactless", label: "Contactless", hint: "Tap to pay in person", Icon: Contactless },
          { key: "atm", label: "Cash withdrawals", hint: "ATMs worldwide", Icon: Cash },
        ] as const)
      : []),
  ];

  return (
    <div className="flex flex-col">
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button aria-expanded={revealed} aria-controls={detailsId} onClick={() => onReveal(!revealed)}>
          {revealed ? <EyeOff /> : <Eye />}
          {revealed ? "Hide details" : "Show details"}
        </Button>
        <Button aria-pressed={card.frozen} onClick={freeze}>
          <Snowflake />
          {card.frozen ? "Unfreeze" : "Freeze"}
        </Button>
      </div>

      <div id={detailsId}>
        {revealed && (
          <dl className="mt-3 grid animate-enter grid-cols-2 rounded-xl bg-surface shadow-sm">
            <DetailRow
              label="Card number"
              value={card.number}
              copy="Copy card number"
              className="col-span-2 border-b border-line"
            />
            <DetailRow label="Expires" value={card.expiry} className="border-b border-r border-line" />
            <DetailRow
              label="Security code"
              value={card.cvv}
              copy="Copy security code"
              className="border-b border-line"
            />
            <DetailRow label="Name on card" value={user.name} mono={false} className="col-span-2" />
          </dl>
        )}
      </div>

      <section aria-labelledby="spend-heading" className="mt-7">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="spend-heading" className="text-body text-muted">
            Spent, last 30 days
          </h2>
          <p className="text-meta tabular-nums text-muted">
            {share}% of {money(card.limit)}
          </p>
        </div>
        <p className="mt-1 text-title font-medium tabular-nums text-ink">{money(spent)}</p>
        <div
          role="meter"
          aria-labelledby="spend-heading"
          aria-valuemin={0}
          aria-valuemax={card.limit / 100}
          aria-valuenow={spent / 100}
          aria-valuetext={`${money(spent)} of ${money(card.limit)} monthly limit`}
          className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-panel shadow-[inset_0_0_0_1px_var(--line)]"
        >
          <div
            className="h-full rounded-full bg-ink transition-[width] duration-(--duration-move) ease-out"
            style={{ width: `${share}%` }}
          />
        </div>
      </section>

      <section aria-labelledby="controls-heading" className="mt-8">
        <h2 id="controls-heading" className="text-body text-muted">
          Controls
        </h2>
        <ul className="mt-2 divide-y divide-line rounded-xl bg-panel shadow-[inset_0_0_0_1px_var(--line)]">
          {controls.map(({ key, label, hint, Icon }) => (
            <li key={key} className="flex items-center gap-3 px-4 py-3">
              <Icon className="size-4 shrink-0 text-muted" />
              <div className="min-w-0 flex-1">
                <p id={`${card.id}-${key}`} className="text-body text-ink">
                  {label}
                </p>
                <p id={`${card.id}-${key}-hint`} className="text-meta text-muted">
                  {hint}
                </p>
              </div>
              <Switch
                checked={card[key]}
                onChange={(on) => dispatch({ type: "updateCard", id: card.id, patch: { [key]: on } })}
                labelledBy={`${card.id}-${key}`}
                describedBy={`${card.id}-${key}-hint`}
              />
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Cancel card" className="mt-8 flex flex-col items-start gap-2">
        <HoldToConfirm onConfirm={cancel} hint="Press and hold to cancel this card">
          Hold to cancel card
        </HoldToConfirm>
        <p className="text-meta text-muted">Payments on {ending} stop straight away. You can't undo this.</p>
      </section>
    </div>
  );
}

function DetailRow({
  label,
  value,
  copy,
  mono = true,
  className = "",
}: {
  label: string;
  value: string;
  copy?: string;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative min-w-0 py-2.5 pl-4 ${copy ? "pr-12" : "pr-4"} ${className}`}>
      <dt className="text-meta text-muted">{label}</dt>
      <dd className={`truncate text-body text-ink ${mono ? "font-mono tabular-nums tracking-wide" : ""}`}>
        {value}
        {copy && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2">
            <CopyButton value={value.replace(/\s/g, "")} label={copy} />
          </span>
        )}
      </dd>
    </div>
  );
}
