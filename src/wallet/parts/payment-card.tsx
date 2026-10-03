import { useState } from "react";
import { GradientField, palettes } from "@/components/ui/gradient-field";
import { Contactless, Snowflake } from "@/components/ui/icons";
import type { Card } from "../data";
import { lastFour } from "../format";
import { caps } from "../theme";

/** The frosted chip from the Gradient Card: legible on any part of any palette. */
const frost = `inline-flex items-center justify-center gap-1.5 rounded-full bg-surface/70 text-meta font-medium text-ink shadow-sm backdrop-blur-md backdrop-saturate-150 ${caps}`;
const chip = `${frost} h-6 px-2.5`;

/**
 * A payment card whose face is a live mesh gradient. Hover swirls it, a press
 * sends a pulse from the finger (from the centre for keyboard activation).
 * Frozen cards drain to greyscale under a frost layer. In mono the art keeps
 * its colour: the one vivid thing on a quiet screen.
 */
export function PaymentCard({ card, seed = 0 }: { card: Card; seed?: number }) {
  const [focused, setFocused] = useState(false);
  const [pulse, setPulse] = useState(0);
  const palette = palettes[card.palette % palettes.length];

  return (
    <button
      type="button"
      onClick={(e) => e.detail === 0 && setPulse((n) => n + 1)}
      onFocus={(e) => setFocused(e.currentTarget.matches(":focus-visible"))}
      onBlur={() => setFocused(false)}
      aria-label={`${card.name} ${card.kind.toLowerCase()} card ending ${lastFour(card.number)}${card.frozen ? ", frozen" : ""}`}
      className="relative block aspect-[1.586] w-full max-w-full overflow-hidden rounded-xl text-left outline-offset-4 transition-[scale] duration-(--duration-exit) ease-out active:scale-[0.98] mono:rounded-[24px]"
    >
      <span
        className="absolute inset-0 transition-[filter] duration-(--duration-move) ease-out"
        style={{ filter: card.frozen ? "grayscale(1) contrast(0.85) brightness(1.08)" : "none" }}
      >
        <GradientField colors={palette.colors} seed={seed} active={focused} pulse={pulse} />
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)] mono:rounded-[24px]"
      />

      <span aria-hidden className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3.5">
        <span className="flex items-start justify-between">
          <span className={chip}>{card.name}</span>
          {card.kind === "Debit" && (
            <span className={`${frost} size-6`}>
              <Contactless className="size-3.5" />
            </span>
          )}
        </span>
        <span className="flex items-end justify-between">
          <span className={`${chip} font-mono tracking-wide`}>•••• {lastFour(card.number)}</span>
          <span className={chip}>{card.kind}</span>
        </span>
      </span>

      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 grid place-items-center bg-surface/20 transition-opacity duration-(--duration-enter) ease-out ${
          card.frozen ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className={`${frost} h-7 px-3`}>
          <Snowflake className="size-3.5" />
          Frozen
        </span>
      </span>
    </button>
  );
}
