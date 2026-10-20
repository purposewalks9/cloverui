import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SpectrumBars, SPECTRUM_BARS_THEMES } from "@/registry/clover-ui/spectrum-bars";

test("renders a hidden, click-through canvas background", () => {
  const html = renderToStaticMarkup(h(SpectrumBars, {}));
  assert.match(html, /aria-hidden="true"/);
  assert.match(html, /pointer-events-none absolute inset-0/);
  assert.match(html, /<canvas/);
  assert.match(html, /bg-background/);
});

test("every theme has a palette", () => {
  for (const list of Object.values(SPECTRUM_BARS_THEMES)) assert.ok(list.length >= 2);
});
