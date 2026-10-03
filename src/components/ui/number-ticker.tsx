/*
 * Vendored from litterthanlit/components@afb2ce1 (src/registry/components/number-ticker.tsx).
 * Changes: gallery demo removed.
 */
const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

function Digit({ value, delay }: { value: number; delay: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden leading-none">
      <span
        className="absolute inset-x-0 top-0 flex flex-col transition-transform duration-[800ms] ease-out"
        style={{ transform: `translateY(-${value * 10}%)`, transitionDelay: `${delay}ms` }}
      >
        {DIGITS.map((d) => (
          <span key={d} className="h-[1em] text-center leading-none">
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

type NumberTickerProps = {
  value: number;
  /** Intl options, e.g. { style: "currency", currency: "USD" } */
  format?: Intl.NumberFormatOptions;
  locale?: string;
  className?: string;
};

/**
 * Rolls each digit into place like a mechanical counter. Separators and
 * symbols come from Intl.NumberFormat, so any locale or currency works.
 * Screen readers get the formatted value once; the reels are hidden.
 */
export function NumberTicker({ value, format, locale = "en-US", className = "" }: NumberTickerProps) {
  const formatted = new Intl.NumberFormat(locale, format).format(value);
  const chars = formatted.split("");
  const digitCount = chars.filter((c) => /\d/.test(c)).length;
  let digitIndex = 0;

  return (
    <span className={`inline-flex items-baseline tabular-nums ${className}`}>
      <span className="sr-only">{formatted}</span>
      <span aria-hidden className="inline-flex">
        {chars.map((char, i) => {
          if (!/\d/.test(char)) {
            return (
              <span key={`s-${i}`} className="inline-block leading-none">
                {char}
              </span>
            );
          }
          // Key from the right so reels stay stable when the length changes.
          const fromRight = digitCount - digitIndex++;
          return <Digit key={`d-${fromRight}`} value={Number(char)} delay={fromRight * 40} />;
        })}
      </span>
    </span>
  );
}
