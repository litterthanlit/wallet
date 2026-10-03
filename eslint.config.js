import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  { ignores: ["dist", "artifact"] },
  js.configs.recommended,
  tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  {
    // Vendored from litterthanlit/components: kept verbatim so they diff cleanly against upstream.
    files: [
      "src/design-system/**",
      "src/components/ui/{gradient-field,hold-to-confirm,number-ticker,segmented-control,toast-stack}.tsx",
    ],
    rules: { "no-empty": "off", "no-useless-assignment": "off" },
  },
);
