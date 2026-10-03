import { Dot } from "@/design-system";
import { categoryLabel, type Txn } from "../data";
import { signedMoney, timeLabel } from "../format";
import { useUI } from "../store";
import { TxnAvatar } from "./avatar";

/**
 * One line of activity. Money in reads in accent-strong (the accent's text
 * form); money out stays ink so a long list isn't a wall of red. Pending
 * follows the writing rule: a lime dot and "(Pending)".
 */
export function TxnRow({ txn, style }: { txn: Txn; style?: React.CSSProperties }) {
  const { openSheet } = useUI();
  const sub = txn.note ?? categoryLabel[txn.category];
  const incoming = txn.amount > 0;

  return (
    <li style={style} className="animate-enter">
      <button
        type="button"
        onClick={() => openSheet({ kind: "txn", id: txn.id })}
        className="-mx-2 flex w-[calc(100%+16px)] items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-[background-color,transform] duration-(--duration-exit) ease-out hover:bg-panel hover:duration-(--duration-enter) active:scale-[0.99]"
      >
        <TxnAvatar txn={txn} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body font-medium text-ink">{txn.name}</span>
          <span className="flex min-w-0 items-center gap-1.5 text-meta text-muted">
            <span className="truncate">
              {sub} · {timeLabel(txn.at)}
            </span>
            {txn.status === "pending" && (
              <span className="inline-flex shrink-0 items-center gap-1.5">
                <Dot />
                (Pending)
              </span>
            )}
          </span>
        </span>
        <span className={`shrink-0 text-body tabular-nums ${incoming ? "text-accent-strong" : "text-ink"}`}>
          {signedMoney(txn.amount)}
        </span>
      </button>
    </li>
  );
}
