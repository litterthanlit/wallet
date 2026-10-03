import { useEffect, useRef, useState } from "react";
import { NumberTicker } from "@/components/ui/number-ticker";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/design-system";
import { funding } from "../data";
import { money, wholeMoney } from "../format";
import { InfoList, InfoRow } from "../parts/info-list";
import { useWallet } from "../store";

const PRESETS = [5_000, 10_000, 25_000, 50_000];

export function TopUpSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch } = useWallet();
  const [amount, setAmount] = useState(10_000);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  function topUp() {
    if (busy) return;
    setBusy(true);
    // A short, honest wait: the bank transfer is what the user is waiting on.
    timer.current = setTimeout(() => {
      dispatch({ type: "topUp", amount });
      dispatch({
        type: "toast",
        title: "Money added",
        body: `${money(amount)} from ${funding.name} •••• ${funding.last4}.`,
      });
      onClose();
    }, 900);
  }

  return (
    <Sheet open={open} onClose={onClose} title="Top up" description={`From ${funding.name} •••• ${funding.last4}`}>
      <div className="flex flex-col items-center gap-5 pb-6 pt-3">
        <p className="text-[3rem] font-medium leading-none tracking-[-0.04em] text-ink">
          <NumberTicker
            value={amount / 100}
            format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
          />
        </p>
        <SegmentedControl
          label="Amount"
          options={PRESETS.map((c) => ({ value: String(c), label: wholeMoney(c) }))}
          value={String(amount)}
          onChange={(v) => setAmount(Number(v))}
        />
      </div>

      <InfoList>
        <InfoRow label="Balance after">
          <span className="tabular-nums">{money(state.balance + amount)}</span>
        </InfoRow>
        <InfoRow label="Fee">Free</InfoRow>
        <InfoRow label="Arrives">Instantly</InfoRow>
      </InfoList>

      <Button variant="primary" onClick={topUp} aria-disabled={busy} aria-busy={busy} className="mt-5 h-11 w-full">
        {busy ? (
          <>
            <span aria-hidden className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-1 animate-hop rounded-full bg-current"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </span>
            Adding money
          </>
        ) : (
          `Top up ${money(amount)}`
        )}
      </Button>
    </Sheet>
  );
}
