# Wallet

A digital wallet prototype built on the litt design system from
[litterthanlit/components](https://github.com/litterthanlit/components). Colour, type, radii, elevation, motion
curves, springs and six of the gallery's components come straight from that repo. Everything new is built to the
same rules.

Sample data only. No real money moves.

## Run it

```bash
npm install
npm run dev              # http://localhost:5173
npm run check            # typecheck, lint, formatting
npm run build            # production build → dist/
npm run build:artifact   # one self-contained HTML file → artifact/litt-wallet.html
```

## What's in it

- **Home.** The balance rolls into place on the Number Ticker. The chart scrubs with a pointer or the arrow keys, and
  the hero follows it. A Segmented Control morphs the line between week, month and year. Send, Request and Top up
  sit underneath, then recent activity.
- **Cards.** Each card face is the Gradient Card's live WebGL mesh: it swirls on hover and pulses on press. Freeze a
  card and the art drains to grey. Show details reveals the number and security code with Copy Buttons. Spend for
  the last 30 days is shown against the card limit, and switches control online, contactless and ATM use. Cancelling
  needs a Hold to Confirm. The + button creates a virtual card.
- **Activity.** Money in and out for the last 30 days, search, a filter, and day groups with sticky frosted headers.
- **Sheets.** Send runs recipient → keypad (you can also type) → review → hold to send in lime → success. Request
  shares account details and a payment link. Top up adds money from a linked account. Tapping any transaction opens
  its details, with Send again for people.
- **Feedback.** Every action lands in the Toast Stack. A few seconds after load, Ada pays you back, so you can watch
  the ticker and a toast arrive together.
- **Mono theme.** A third, quieter light theme. A grey ground with pale, hairline widgets; Geist for reading and
  Geist Mono for small caps labels. The balance becomes one widget: period as words in the corner, the figure with
  its symbol and cents set small, and a fine grey line over a soft grey wash. Red is the one
  accent: the Send tile, hold to send, live dots and the active tab. Card art keeps its colour, the only vivid
  thing on the screen.
- **Keyboard.** `1` `2` `3` switch tabs, `S` send, `R` request, `T` top up, `H` hide the balance, `Esc` closes a sheet.

## Design system

`src/design-system` and six files in `src/components/ui` are copied from `litterthanlit/components@afb2ce1`. They
are left exactly as they are upstream (Prettier skips them) so they diff cleanly against it. Each file's header
records any local change.

| Here                                      | Upstream                                    | Local change                                                                |
| ----------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------- |
| `src/design-system/*`                     | `src/design-system/*`                       | `ButtonLink` removed (Next.js only); `tokens.css` also follows the OS theme |
| `src/components/ui/number-ticker.tsx`     | `src/registry/components/number-ticker`     | Demo removed                                                                |
| `src/components/ui/segmented-control.tsx` | `src/registry/components/segmented-control` | Demo removed                                                                |
| `src/components/ui/hold-to-confirm.tsx`   | `src/registry/components/hold-to-confirm`   | `tone` (danger or accent), `size`, `hint`, `disabled`                       |
| `src/components/ui/toast-stack.tsx`       | `src/registry/components/toast-stack`       | Toasts behind the front one hide their text while collapsed                 |
| `src/components/ui/copy-button.tsx`       | `src/registry/components/copy-button`       | Exports `copyText()`, with an `execCommand` fallback for sandboxed frames   |
| `src/components/ui/gradient-field.tsx`    | `src/registry/components/gradient-card`     | Only `GradientField` and `palettes`                                         |
| `src/components/ui/theme-toggle.tsx`      | `src/components/gallery/theme-toggle`       | Reads the OS theme when no choice is saved; cycles light, mono and dark     |

New pieces built to the same rules: `sheet.tsx` (spring-driven, drag to dismiss, focus trapped), `switch.tsx`
(snappy spring), `icons.tsx` (16px grid, 1.4 stroke), the tab bar and the balance chart.

The rules, in short. Style only with token utilities (`bg-surface`, `text-muted`, `shadow-md`, `ease-out`,
`duration-(--duration-enter)`). Use weights 400 and 500. Lime is a fill for status and success; `accent-strong` is
its text form. Raised things get a ring and a soft shadow, flat groups get a panel tint. Exits are faster than
entrances, and springs drive anything pointer-driven or interruptible.

## Structure

```
src/
  design-system/        tokens, primitives, springs (vendored)
  components/ui/        gallery components (vendored) and new primitives
  wallet/
    app.tsx             shell: device frame, desktop intro, shortcuts, sheets
    store.tsx           wallet reducer and UI context
    data.ts             sample people, cards and transactions (cents, relative dates)
    history.ts          seeded balance history for the chart
    format.ts           money and date formatting
    views/              home, cards, activity
    sheets/             send, request, top up, transaction
    parts/              chart, payment card, tab bar, rows, avatars
scripts/artifact.mjs    folds the artifact build into one HTML file
```

## Notes

- **Vite, not Next.js.** This is a client-only prototype, and the design system has nothing Next-specific apart from
  `ButtonLink`. Vite also makes the single-file build simple.
- **Money is integer cents** everywhere, formatted with `Intl.NumberFormat` only at the edge.
- **Theme.** Upstream is light-first. Here, with no saved choice, the app follows the OS; the toggle saves a choice.
  Mono is opt-in only. Its tokens live in `src/app.css` (not the vendored `tokens.css`), and components opt into
  its shape changes with the `mono:` variant and the `caps` class list from `src/wallet/theme.ts`.
- **Responsive.** On phones the app is full-bleed. From `sm` it sits in a device frame, and from `lg` an editorial
  column with things to try sits beside it.
