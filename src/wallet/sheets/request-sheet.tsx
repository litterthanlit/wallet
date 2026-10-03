import { useEffect, useRef, useState } from "react";
import { copyText } from "@/components/ui/copy-button";
import { Check } from "@/components/ui/icons";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/design-system";
import { user } from "../data";
import { Avatar } from "../parts/avatar";
import { InfoList, InfoRow } from "../parts/info-list";

export function RequestSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copyLink() {
    if (!(await copyText(`https://${user.link}`))) return;
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Request money"
      description="Share your details, or send a link anyone can pay."
    >
      <div className="flex flex-col items-center gap-2 pb-6 pt-1 text-center">
        <Avatar name={user.name} size="xl" />
        <div>
          <p className="text-body font-medium text-ink">{user.name}</p>
          <p className="text-meta text-muted">{user.tag}</p>
        </div>
      </div>

      <InfoList>
        <InfoRow label="Wallet tag" copy={user.tag}>
          {user.tag}
        </InfoRow>
        <InfoRow label="Account number" copy={user.account.replace(/\s/g, "")} mono>
          {user.account}
        </InfoRow>
        <InfoRow label="Payment link" copy={`https://${user.link}`}>
          {user.link}
        </InfoRow>
      </InfoList>

      <Button variant="primary" onClick={copyLink} className="mt-5 h-11 w-full">
        {copied ? (
          <>
            <Check className="size-4 animate-enter" />
            Link copied
          </>
        ) : (
          "Copy payment link"
        )}
      </Button>
      <p className="mt-3 text-center text-meta text-muted">People who pay you by link never see your balance.</p>
      <span className="sr-only" role="status">
        {copied ? "Payment link copied" : ""}
      </span>
    </Sheet>
  );
}
