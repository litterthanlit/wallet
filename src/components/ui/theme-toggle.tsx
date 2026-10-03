/*
 * Adapted from litterthanlit/components@afb2ce1 (src/components/gallery/theme-toggle.tsx).
 * Changes: with no saved choice the theme follows the OS (prefers-color-scheme),
 * so the effective theme reads both data-theme and the media query. A third,
 * opt-in theme, mono, joins light and dark; the toggle cycles through all three.
 */
import { useSyncExternalStore } from "react";
import { Dots, Moon, Sun } from "./icons";

export type Theme = "light" | "mono" | "dark";

export const themes: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "mono", label: "Mono" },
  { value: "dark", label: "Dark" },
];

const media = () => window.matchMedia("(prefers-color-scheme: dark)");

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const query = media();
  query.addEventListener("change", callback);
  return () => {
    observer.disconnect();
    query.removeEventListener("change", callback);
  };
}

function getTheme(): Theme {
  const explicit = document.documentElement.dataset.theme;
  if (explicit === "light" || explicit === "dark" || explicit === "mono") return explicit;
  return media().matches ? "dark" : "light";
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("wallet-theme", theme);
  } catch {
    // Storage blocked (private mode, sandboxed frame): the choice lasts this visit.
  }
}

export function useTheme() {
  return useSyncExternalStore(subscribe, getTheme, () => "light" as Theme);
}

const icons = { light: Sun, mono: Dots, dark: Moon };

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useTheme();
  const at = themes.findIndex((t) => t.value === theme);
  const next = themes[(at + 1) % themes.length];
  const icon = "absolute size-[15px] transition-[transform,opacity] duration-(--duration-move) ease-out";

  return (
    <button
      type="button"
      onClick={() => setTheme(next.value)}
      aria-label={`Switch to ${next.label.toLowerCase()} theme`}
      className={`relative inline-grid size-9 place-items-center rounded-md text-muted transition-[background-color,color,transform] duration-(--duration-exit) ease-out hover:bg-panel hover:text-ink hover:duration-(--duration-enter) active:scale-[0.97] ${className}`}
    >
      {themes.map(({ value }, i) => {
        const Icon = icons[value];
        // Icons ahead of the current one wait rotated one way, those behind the other.
        const turn = i < at ? -90 : 90;
        return (
          <Icon
            key={value}
            className={icon}
            style={{
              opacity: value === theme ? 1 : 0,
              transform: value === theme ? "none" : `rotate(${turn}deg) scale(0.5)`,
            }}
          />
        );
      })}
    </button>
  );
}
