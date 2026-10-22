import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const registry = JSON.parse(fs.readFileSync(new URL("../registry.json", import.meta.url), "utf8"));
const items = registry.items.filter((item) => item.name !== "all");

const exportName = (name) =>
  name === "404-block"
    ? "Block404"
    : name
        .split("-")
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join("");

const requiredProps = {
  CandlestickChart: {
    data: [
      { time: "Mon", open: 10, high: 12, low: 9, close: 11 },
      { time: "Tue", open: 11, high: 11.5, low: 8, close: 8.5 },
    ],
  },
  GaugeText: { value: 42, label: "Speed" },
  RichProgress: { value: 40 },
  TextGif: { src: "/demo.gif" },
};

test("every registry component renders on the server without NaN or Infinity", async () => {
  assert.ok(items.length > 0);
  for (const item of items) {
    const name = exportName(item.name);
    const source = await import(`@/${item.files[0].path.replace(/\.tsx$/, "")}`);
    assert.ok(source[name], `${item.name} exports ${name}`);
    const html = renderToStaticMarkup(h(source[name], requiredProps[name] ?? {}, "Clover"));
    assert.ok(html.length > 0, `${item.name} renders markup`);
    assert.doesNotMatch(html, /\bNaN\b|\bInfinity\b/, `${item.name} renders finite numbers`);
  }
});
