import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * `vite build` is the normal app build. `--mode artifact` builds one
 * self-contained page (fonts inlined as data URIs, a single JS chunk) that
 * scripts/artifact.mjs then folds into a single HTML file for sharing.
 */
export default defineConfig(({ mode }) => {
  const artifact = mode === "artifact";
  return {
    plugins: [react(), tailwindcss()],
    resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
    base: "./",
    build: artifact
      ? { outDir: "artifact", assetsInlineLimit: () => true, cssCodeSplit: false, modulePreload: false }
      : undefined,
  };
});
