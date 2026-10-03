/**
 * Folds `vite build --mode artifact` output into one self-contained HTML
 * fragment (artifact/litt-wallet.html): the CSS and JS are inlined, fonts are
 * already data URIs, and the document wrapper is dropped so a host page can
 * supply its own <head>. Run via `npm run build:artifact`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = "artifact";
const html = readFileSync(join(dir, "index.html"), "utf8");
const read = (href) => readFileSync(join(dir, href.replace(/^\.\//, "")), "utf8");

const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] ?? "";
const body = html.match(/<body>([\s\S]*?)<\/body>/)?.[1] ?? "";

const title = head.match(/<title>[\s\S]*?<\/title>/)?.[0] ?? "";
const themeScript = head.match(/<script>[\s\S]*?<\/script>/)?.[0] ?? "";
const cssHref = head.match(/<link rel="stylesheet"[^>]*href="([^"]+)"/)?.[1];
const jsSrc = head.match(/<script type="module"[^>]*src="([^"]+)"/)?.[1];
if (!cssHref || !jsSrc) throw new Error("Expected one stylesheet and one module script in artifact/index.html");

const css = read(cssHref);
// A literal "</script" inside the bundle would end the inline tag early.
const js = read(jsSrc).replace(/<\/script/gi, "<\\/script");

const out = [
  title,
  `<style>${css}</style>`,
  themeScript,
  body.replace(/<script type="module"[^>]*><\/script>/, "").trim(),
  `<script type="module">${js}</script>`,
].join("\n");

writeFileSync(join(dir, "litt-wallet.html"), out);
console.log(`artifact/litt-wallet.html  ${(Buffer.byteLength(out) / 1024).toFixed(0)} kB`);
