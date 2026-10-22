import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CandlestickChart } from "@/registry/clover-ui/candlestick-chart";
import { EffortSlider } from "@/registry/clover-ui/effort-slider";
import { GaugeText } from "@/registry/clover-ui/gauge-text";
import { GridReveal } from "@/registry/clover-ui/grid-reveal";
import { ModelSwitcher } from "@/registry/clover-ui/model-switcher";
import { PriceRange } from "@/registry/clover-ui/price-range";
import { RichProgress } from "@/registry/clover-ui/rich-progress";
import { forAll, numbers } from "./random.mjs";

const render = (Component, props) => renderToStaticMarkup(h(Component, props));
const finite = (html) => assert.doesNotMatch(html, /\bNaN\b|\bInfinity\b/);

test("rich progress always reports a whole percentage from 0 to 100", () => {
  forAll(
    "RichProgress",
    (random) => ({ value: random.edgy(-1000, 1000) }),
    ({ value }) => {
      const html = render(RichProgress, { value });
      finite(html);
      const [now] = numbers(html, "aria-valuenow");
      assert.ok(Number.isInteger(now) && now >= 0 && now <= 100, `aria-valuenow=${now}`);
    },
  );
});

test("price range keeps both knobs inside the range and in order", () => {
  forAll(
    "PriceRange",
    (random) => {
      const min = random.int(-500, 500);
      const max = min + random.int(1, 5000);
      return {
        min,
        max,
        defaultValue: [random.edgy(min - 100, max + 100), random.edgy(min - 100, max + 100)],
      };
    },
    (props) => {
      const html = render(PriceRange, props);
      finite(html);
      const [low, high] = numbers(html, "aria-valuenow");
      assert.ok(props.min <= low && low <= high && high <= props.max, `knobs ${low}, ${high}`);
    },
  );
});

test("effort slider always lands on a real level", () => {
  forAll(
    "EffortSlider",
    (random) => {
      const levels = Array.from({ length: random.int(1, 8) }, (_, i) => `Level ${i}`);
      return { levels, value: random.edgy(-3, levels.length + 3) };
    },
    ({ levels, value }) => {
      const html = render(EffortSlider, { levels, value });
      finite(html);
      const [now] = numbers(html, "aria-valuenow");
      assert.ok(Number.isInteger(now) && now >= 0 && now < levels.length, `aria-valuenow=${now}`);
      assert.match(html, new RegExp(`aria-valuetext="${levels[now]}"`));
    },
  );
});

test("model switcher always shows one of its effort levels", () => {
  forAll(
    "ModelSwitcher",
    (random) => {
      const effortLevels = Array.from({ length: random.int(1, 6) }, (_, i) => `Effort${i}`);
      return { effortLevels, effort: random.edgy(-4, effortLevels.length + 4) };
    },
    (props) => {
      const html = render(ModelSwitcher, props);
      finite(html);
      const shown = props.effortLevels.filter((level) => html.includes(`effort: ${level}"`));
      assert.equal(shown.length, 1, `shown levels: ${shown}`);
    },
  );
});

test("grid reveal draws exactly rows times columns blocks", () => {
  forAll(
    "GridReveal",
    (random) => ({ rows: random.int(1, 16), cols: random.int(1, 16) }),
    (props) => {
      const html = render(GridReveal, props);
      finite(html);
      assert.equal(html.match(/<div style="background-color:/g)?.length, props.rows * props.cols);
    },
  );
});

test("gauge text starts at zero with the requested decimals", () => {
  forAll(
    "GaugeText",
    (random) => ({ value: random.float(-1e6, 1e6), decimals: random.int(0, 4), label: "Speed" }),
    (props) => {
      const html = render(GaugeText, props);
      finite(html);
      const zero = props.decimals ? `0.${"0".repeat(props.decimals)}` : "0";
      assert.match(html, new RegExp(`>${zero.replace(".", "\\.")}x?<`));
    },
  );
});

test("candlestick chart keeps every candle finite and inside the chart", () => {
  forAll(
    "CandlestickChart",
    (random) => {
      const length = random.int(1, 240);
      let price = random.float(0.01, 5000);
      const data = Array.from({ length }, (_, i) => {
        const open = price;
        const close = Math.max(0.01, open * random.float(0.9, 1.1));
        price = close;
        const high = Math.max(open, close) * random.float(1, 1.05);
        const low = Math.min(open, close) * random.float(0.95, 1);
        return { time: `T${i}`, open, high, low, close };
      });
      return {
        data,
        defaultIndex: random.int(-5, length + 5),
        defaultVisibleCount: random.int(1, length + 20),
      };
    },
    (props) => {
      const html = render(CandlestickChart, props);
      finite(html);
      const [, , width, height] = html
        .match(/viewBox="([^"]+)"/)[1]
        .split(" ")
        .map(Number);
      for (const attribute of ["y", "y1", "y2"]) {
        for (const y of numbers(html, attribute))
          assert.ok(y >= 0 && y <= height, `${attribute}=${y}`);
      }
      for (const attribute of ["x", "x1", "x2"]) {
        for (const x of numbers(html, attribute))
          assert.ok(x >= 0 && x <= width, `${attribute}=${x}`);
      }
      for (const size of numbers(html, "height").filter(Number.isFinite))
        assert.ok(size >= 0, `height=${size}`);
    },
  );
});
