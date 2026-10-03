import { Check, Repeat } from "@/components/ui/icons";
import { Sheet } from "@/components/ui/sheet";
import { Badge, Button, Dot } from "@/design-system";
import { categoryLabel, contactById } from "../data";
import { lastFour, longDate, signedMoney } from "../format";
import { TxnAvatar } from "../parts/avatar";
import { InfoList, InfoRow } from "../parts/info-list";
import { useUI, useWallet } from "../store";

export function TxnSheet({ open, id, onClose }: { open: boolean; id?: string; onClose: () => void }) {
  const { state } = useWallet();
  const { openSheet } = useUI();
  const txn = state.txns.find((t) => t.id === id);
  if (!txn) return null;

  const card = state.cards.find((c) => c.id === txn.cardId);
  const contact = contactById(txn.contactId);
  const incoming = txn.amount > 0;

  return (
    <Sheet open={open} onClose={onClose} title={txn.name} description={categoryLabel[txn.category]}>
      <div className="flex flex-col items-center gap-2 pb-6 pt-1 text-center">
        <TxnAvatar txn={txn} size="xl" />
        <p className={`mt-2 text-display font-medium tabular-nums ${incoming ? "text-accent-strong" : "text-ink"}`}>
          {signedMoney(txn.amount)}
        </p>
        <p className="text-body text-muted">{longDate(txn.at)}</p>
        {txn.status === "pending" ? (
          <Badge>
            <Dot pulse />
            Pending
          </Badge>
        ) : (
          <Badge>
            <Check className="size-3" />
            Completed
          </Badge>
        )}
      </div>

      <InfoList>
        {contact && <InfoRow label={incoming ? "From" : "To"}>{`${contact.name} · ${contact.tag}`}</InfoRow>}
        {txn.note && <InfoRow label="Note">{txn.note}</InfoRow>}
        {txn.cardId && (
          <InfoRow label="Card">{card ? `${card.name} •••• ${lastFour(card.number)}` : "Cancelled card"}</InfoRow>
        )}
        <InfoRow label="Category">{categoryLabel[txn.category]}</InfoRow>
        <InfoRow label="Reference" copy={txn.reference} mono>
          {txn.reference}
        </InfoRow>
      </InfoList>

      {contact && (
        <Button onClick={() => openSheet({ kind: "send", contactId: contact.id })} className="mt-5 h-11 w-full">
          <Repeat />
          {incoming ? `Pay ${contact.name.split(" ")[0]}` : "Send again"}
        </Button>
      )}
    </Sheet>
  );
}
