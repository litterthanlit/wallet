import { useEffect, useMemo, useRef, useState } from "react";
import { HoldToConfirm } from "@/components/ui/hold-to-confirm";
import { Backspace, ChevronLeft, ChevronRight, Search } from "@/components/ui/icons";
import { Sheet } from "@/components/ui/sheet";
import { Button, IconButton } from "@/design-system";
import { contactById, contacts, type Contact } from "../data";
import { money } from "../format";
import { Avatar } from "../parts/avatar";
import { InfoList, InfoRow } from "../parts/info-list";
import { SuccessMark } from "../parts/success-mark";
import { useWallet } from "../store";

type Step = "to" | "amount" | "review" | "done";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"] as const;
const QUICK = ["10", "25", "50", "100"];

const toCents = (amount: string) => Math.round(parseFloat(amount || "0") * 100);

/** "1234.5" → "$1,234.5": grouped dollars, cents exactly as typed. */
function display(amount: string) {
  if (!amount) return "$0";
  const [whole, cents] = amount.split(".");
  const grouped = Number(whole || "0").toLocaleString("en-US");
  return `$${grouped}${cents !== undefined ? `.${cents}` : ""}`;
}

/** Apply one keypad press to the typed amount. Caps at $999,999.99. */
function press(amount: string, key: string) {
  if (key === "del") return amount.slice(0, -1);
  if (key === ".") return amount.includes(".") ? amount : `${amount || "0"}.`;
  const [whole, cents] = amount.split(".");
  if (cents !== undefined && cents.length >= 2) return amount;
  if (cents === undefined && whole.length >= 6) return amount;
  if (amount === "0") return key;
  return amount + key;
}

export function SendSheet({ open, contactId, onClose }: { open: boolean; contactId?: string; onClose: () => void }) {
  const { state, dispatch } = useWallet();
  const initial = contactById(contactId);
  const [step, setStep] = useState<Step>(initial ? "amount" : "to");
  const [contact, setContact] = useState<Contact | undefined>(initial);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const stepRef = useRef<HTMLDivElement>(null);
  const firstStep = useRef(true);

  const cents = toCents(amount);
  const over = cents > state.balance;
  const ready = cents > 0 && !over;

  // Move focus into each new step so keyboard users never land on <body>.
  useEffect(() => {
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    const el = stepRef.current;
    const marked = el?.querySelector<HTMLElement>("[data-autofocus]");
    const target = marked?.matches("button, input") ? marked : marked?.querySelector<HTMLElement>("button, input");
    (target ?? el)?.focus({ preventScroll: true });
  }, [step]);

  // Type the amount on a keyboard, too.
  useEffect(() => {
    if (!open || step !== "amount") return;
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea") || event.metaKey || event.ctrlKey || event.altKey) return;
      if (/^[0-9.]$/.test(event.key)) setAmount((a) => press(a, event.key));
      else if (event.key === "Backspace") setAmount((a) => press(a, "del"));
      else if (event.key === "Enter" && target.tagName !== "BUTTON" && ready) setStep("review");
      else return;
      event.preventDefault();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step, ready]);

  function choose(next: Contact) {
    setContact(next);
    setStep("amount");
  }

  function send() {
    if (!contact) return;
    dispatch({ type: "send", contact, amount: cents, note: note.trim() });
    setStep("done");
  }

  const first = contact?.name.split(" ")[0];
  const title = { to: "Send money", amount: `Send to ${first}`, review: "Check and send", done: "Sent" }[step];
  const back =
    step === "amount" || step === "review" ? (
      <IconButton label="Back" onClick={() => setStep(step === "review" ? "amount" : "to")} className="-ml-2">
        <ChevronLeft />
      </IconButton>
    ) : undefined;

  return (
    <Sheet open={open} onClose={onClose} title={title} leading={back} tall>
      <div ref={stepRef} key={step} tabIndex={-1} className="flex min-h-0 flex-1 animate-enter flex-col outline-none">
        {step === "to" && <PickContact onPick={choose} />}

        {step === "amount" && contact && (
          <div className="flex flex-1 flex-col">
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-4">
              <output
                aria-live="polite"
                aria-label="Amount"
                className={`text-[3rem] font-medium leading-none tracking-[-0.04em] tabular-nums transition-colors duration-(--duration-exit) ${
                  amount ? (over ? "text-danger" : "text-ink") : "text-subtle"
                }`}
              >
                {display(amount)}
              </output>
              <p className={`text-meta ${over ? "text-danger" : "text-muted"}`}>
                {over ? `That's more than your ${money(state.balance)} balance` : `${money(state.balance)} available`}
              </p>
            </div>

            <div className="flex justify-center gap-2">
              {QUICK.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(q)}
                  aria-pressed={amount === q}
                  className={`h-7 rounded-full px-3 text-meta font-medium tabular-nums transition-[background-color,color,transform] duration-(--duration-exit) ease-out hover:duration-(--duration-enter) active:scale-[0.97] ${
                    amount === q
                      ? "bg-ink text-canvas"
                      : "bg-panel text-muted shadow-[inset_0_0_0_1px_var(--line)] hover:text-ink"
                  }`}
                >
                  ${q}
                </button>
              ))}
            </div>

            <label htmlFor="send-note" className="sr-only">
              Note
            </label>
            <input
              id="send-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={60}
              placeholder="Add a note"
              autoComplete="off"
              className="mt-4 h-10 w-full rounded-md bg-surface px-3 text-body text-ink shadow-sm placeholder:text-muted"
            />

            <div className="mt-2 grid grid-cols-3 gap-1">
              {KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setAmount((a) => press(a, key))}
                  aria-label={key === "del" ? "Delete" : key === "." ? "Decimal point" : undefined}
                  className="grid h-12 place-items-center rounded-lg text-title font-medium text-ink transition-[background-color,transform] duration-(--duration-exit) ease-out hover:bg-panel hover:duration-(--duration-enter) active:scale-[0.97] active:bg-panel"
                >
                  {key === "del" ? <Backspace className="size-5" /> : key}
                </button>
              ))}
            </div>

            <Button variant="primary" disabled={!ready} onClick={() => setStep("review")} className="mt-3 h-11 w-full">
              Review
            </Button>
          </div>
        )}

        {step === "review" && contact && (
          <div className="flex flex-1 flex-col">
            <div className="flex flex-col items-center gap-3 py-5 text-center">
              <Avatar name={contact.name} size="xl" />
              <div>
                <p className="text-display font-medium tabular-nums text-ink">{money(cents)}</p>
                <p className="mt-1 text-body text-ink">
                  to {contact.name} <span className="text-muted">{contact.tag}</span>
                </p>
              </div>
            </div>
            <InfoList>
              <InfoRow label="From">Wallet balance</InfoRow>
              {note.trim() && <InfoRow label="Note">{note.trim()}</InfoRow>}
              <InfoRow label="Fee">Free</InfoRow>
              <InfoRow label="Arrives">Instantly</InfoRow>
              <InfoRow label="Balance after">{money(state.balance - cents)}</InfoRow>
            </InfoList>
            <div className="mt-auto flex flex-col items-center gap-2 pt-6">
              {/* Mono fills the hold in ink: red there means a signal or a loss, not success. */}
              <div data-autofocus className="w-full mono:[--accent-ink:var(--canvas)] mono:[--accent:var(--ink)]">
                <HoldToConfirm tone="accent" size="lg" duration={1000} onConfirm={send} hint="Press and hold to send">
                  Hold to send {money(cents)}
                </HoldToConfirm>
              </div>
              <p className="text-meta text-muted">Press and hold</p>
            </div>
          </div>
        )}

        {step === "done" && contact && (
          <div className="flex flex-1 flex-col">
            <div role="status" className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
              <SuccessMark />
              <div>
                <p className="text-display font-medium tabular-nums text-ink">{money(cents)}</p>
                <p className="mt-1 text-body text-muted">Sent to {contact.name}</p>
              </div>
            </div>
            <Button variant="primary" data-autofocus onClick={onClose} className="h-11 w-full">
              Done
            </Button>
          </div>
        )}
      </div>
    </Sheet>
  );
}

function PickContact({ onPick }: { onPick: (c: Contact) => void }) {
  const { state } = useWallet();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  // Recent: people you've paid or been paid by, newest first.
  const recent = useMemo(() => {
    const ids = [...new Set(state.txns.map((t) => t.contactId).filter(Boolean))] as string[];
    return ids.map((id) => contactById(id)!).slice(0, 5);
  }, [state.txns]);

  const matches = contacts.filter((c) => !q || c.name.toLowerCase().includes(q) || c.tag.toLowerCase().includes(q));

  return (
    <div className="flex flex-col">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          id="send-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name or @tag"
          aria-label="Search people"
          autoComplete="off"
          className="h-10 w-full rounded-md bg-surface pl-9 pr-3 text-body text-ink shadow-sm placeholder:text-muted"
        />
      </div>

      {!q && recent.length > 0 && (
        <>
          <h3 className="mt-6 text-body text-muted">Recent</h3>
          <ul className="no-scrollbar -mx-5 mt-2 flex gap-1 overflow-x-auto px-4">
            {recent.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => onPick(c)}
                  className="flex w-[68px] flex-col items-center gap-1.5 rounded-lg py-2 transition-[background-color,transform] duration-(--duration-exit) ease-out hover:bg-panel hover:duration-(--duration-enter) active:scale-[0.97]"
                >
                  <Avatar name={c.name} size="lg" />
                  <span className="w-full truncate px-1 text-center text-meta text-ink">{c.name.split(" ")[0]}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <h3 className="mt-5 text-body text-muted">{q ? "Results" : "Everyone"}</h3>
      {matches.length ? (
        <ul className="mt-1">
          {matches.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onPick(c)}
                className="-mx-2 flex w-[calc(100%+16px)] items-center gap-3 rounded-lg px-2 py-2 text-left transition-[background-color,transform] duration-(--duration-exit) ease-out hover:bg-panel hover:duration-(--duration-enter) active:scale-[0.99]"
              >
                <Avatar name={c.name} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body font-medium text-ink">{c.name}</span>
                  <span className="block truncate text-meta text-muted">{c.tag}</span>
                </span>
                <ChevronRight className="size-4 text-subtle" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-body text-muted">
          No one called “{query.trim()}”. Check the spelling or try their @tag.
        </p>
      )}
    </div>
  );
}
