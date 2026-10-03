/*
 * Adapted from litterthanlit/components@afb2ce1 (src/components/gallery/theme-toggle.tsx).
 * Changes: with no saved choice the theme follows the OS (prefers-color-scheme),
 * so the effective theme reads both data-theme and the media query.
 */
import { useSyncExternalStore } from "react";
import { Moon, Sun } from "./icons";

type Theme = "light" | "dark";

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
  if (explicit === "light" || explicit === "dark") return explicit;
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

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  const icon = "absolute size-[15px] transition-[transform,opacity] duration-(--duration-move) ease-out";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      className={`relative inline-grid size-9 place-items-center rounded-md text-muted transition-[background-color,color,transform] duration-(--duration-exit) ease-out hover:bg-panel hover:text-ink hover:duration-(--duration-enter) active:scale-[0.97] ${className}`}
    >
      <Sun
        className={icon}
        style={{
          opacity: theme === "light" ? 1 : 0,
          transform: theme === "light" ? "none" : "rotate(-90deg) scale(0.5)",
        }}
      />
      <Moon
        className={icon}
        style={{ opacity: theme === "dark" ? 1 : 0, transform: theme === "dark" ? "none" : "rotate(90deg) scale(0.5)" }}
      />
    </button>
  );
}
