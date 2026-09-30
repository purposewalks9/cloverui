"use client";

import { CandleChartStick } from "@/registry/clover-ui/candlestick-chart";
import { data } from "@/docs/candlestick-chart/demo";

const candles = data.slice(-60);

export function CandlestickPreview() {
  return (
    <CandleChartStick
      data={candles}
      name="CLVR"
      zoomable={false}
      showXAxis={false}
      formatValue={(v) => `$${v.toFixed(2)}`}
    />
  );
}
