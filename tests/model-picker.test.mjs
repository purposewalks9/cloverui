import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ModelPicker } from "@/registry/clover-ui/model-picker";

const text = (html) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const render = (props = {}) => renderToStaticMarkup(h(ModelPicker, props));

test("starts as a small closed pill with the model and effort", () => {
  const html = render();
  assert.match(html, /aria-haspopup="menu"/);
  assert.match(html, /aria-expanded="false"/);
  assert.equal(text(html), "GPT-5.5 Medium");
  assert.doesNotMatch(html, /role="menu"/);
});

test("controlled model and effort", () => {
  const html = render({ model: "grok-4", effort: 3 });
  assert.equal(text(html), "Grok 4 Max");
  assert.match(html, /aria-label="Model: Grok 4, effort: Max"/);
});

test("custom models and levels", () => {
  const html = render({
    models: [{ value: "a", label: "Swift 2" }],
    effortLevels: ["Quick", "Deep"],
    defaultEffort: 0,
  });
  assert.equal(text(html), "Swift 2 Quick");
});

test("closed pill shows the name without the model logo", () => {
  const html = render();
  assert.doesNotMatch(html, /fill="currentColor"/);
  assert.doesNotMatch(html, /role="menu"/);
});
