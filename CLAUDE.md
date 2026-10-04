# Wallet: notes for agents

A digital wallet prototype on the litt design system (source: github.com/litterthanlit/components). Match it.

- Read `src/design-system/tokens.css` before UI work. Style with token utilities only (`bg-surface`, `text-muted`,
  `shadow-md`, `rounded-lg`, `ease-out`, `duration-(--duration-enter)`). No literal colours in components; artwork
  palettes in `gradient-field.tsx` are the one exception.
- Type: Geist, weights 400 and 500 only, scale `text-meta` / `body` / `lead` / `title` / `display`. Mono for card
  and account numbers. `tabular-nums` for columns of figures.
- Lime (`bg-accent`) is a fill for status and success, never text on a light ground; `text-accent-strong` is its
  text form. Destructive is `danger`.
- Raised objects get `shadow-sm|md|lg` (a ring plus a soft shadow). Flat groups get `bg-panel` with an inset
  `--line` ring.
- Motion: `ease-out` for anything responding to input, exits faster than entrances, `active:scale-[0.97]` on
  clickables. Use `createSpring` for pointer-driven or interruptible motion. Never animate from `scale(0)`. Respect
  reduced motion.
- Writing: sentence case, labels say what happens ("Send $240.00", then "Sent"), status in parentheses with a lime
  dot: "Metro Transit (Pending)".
- Mono theme (`data-theme="mono"`, Nothing OS-style): tokens in `src/app.css`, shape changes via the `mono:` variant,
  caps labels via `caps` from `src/wallet/theme.ts` (meta-size labels only, never titles or sentences). In mono,
  `accent` is red and a status dot only (pending, toasts); actions and success use ink, never red. No outlines: group
  with white cards on the grey ground and space, not rings or dividers. Mark a choice with a pill (`TextTabs`), not
  a dot. 24px page gutter, 48px between sections. Check new UI in all three themes.
- Don't override a component's own position or size utilities through `className`. Tailwind applies the
  conflicting class by stylesheet order, not by the order you wrote them. Wrap the component instead.
- Vendored files (see README) stay as they are upstream: don't reformat them, and record any change in the file's
  header comment.
- Money is integer cents. Format with `money()` / `signedMoney()` from `src/wallet/format.ts`.
- Run `npm run check` before committing; `npm run build:artifact` for the shareable single file.
