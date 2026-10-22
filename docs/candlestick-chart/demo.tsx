"use client";

import { CandlestickChart, type Candle } from "@/registry/clover-ui/candlestick-chart";

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateCandles(count: number, seed = 42): Candle[] {
  const rand = mulberry32(seed);
  const candles: Candle[] = [];
  let price = 200;

  const start = new Date(2023, 0, 1);

  for (let i = 0; i < count; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);

    const open = price;
    const drift = (rand() - 0.5) * 4 + Math.sin(i / 40) * 0.6;
    const close = Math.max(1, open + drift);

    const bodyHigh = Math.max(open, close);
    const bodyLow = Math.min(open, close);
    const wickUp = rand() * 2.2;
    const wickDown = rand() * 2.2;

    const high = bodyHigh + wickUp;
    const low = Math.max(0.5, bodyLow - wickDown);

    candles.push({
      time: date.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "2-digit",
      }),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
    });

    price = close;
  }

  return candles;
}

export const data = generateCandles(1000);

export function Demo() {
  return (
    <div className="w-full px-6 py-10">
      <CandlestickChart data={data} name="AAPL" />
    </div>
  );
}
