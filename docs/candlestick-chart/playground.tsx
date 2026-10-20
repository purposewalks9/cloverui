"use client";

import { CandleChartStick } from "@/registry/clover-ui/candlestick-chart";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import { expr, jsx, type ControlDef } from "@/lib/playground";
import { data } from "./demo";

const controls: ControlDef[] = [
  { type: "color", prop: "upColor", label: "Up color" },
  { type: "color", prop: "downColor", label: "Down color" },
  { type: "boolean", prop: "showXAxis", label: "X axis" },
  { type: "boolean", prop: "animated", label: "Animated" },
  { type: "boolean", prop: "zoomable", label: "Zoomable" },
  {
    type: "number",
    prop: "bodyWidthRatio",
    label: "Body width",
    min: 0.2,
    max: 1,
    step: 0.05,
  },
];

const defaultProps = {
  upColor: "#22c55e",
  downColor: "#ef4444",
  showXAxis: true,
  animated: true,
  zoomable: true,
  bodyWidthRatio: 0.6,
};

export function CandlestickPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      stageClassName="w-full"
      code={(values) =>
        jsx("CandleChartStick", {
          data: expr("data"),
          name: "AAPL",
          upColor: values.upColor,
          downColor: values.downColor,
          showXAxis: values.showXAxis,
          animated: values.animated,
          zoomable: values.zoomable,
          bodyWidthRatio: values.bodyWidthRatio,
        })
      }
      render={(values) => (
        <div className="flex w-full justify-center">
          <CandleChartStick
            data={data}
            name="AAPL"
            upColor={values.upColor as string}
            downColor={values.downColor as string}
            showXAxis={values.showXAxis as boolean}
            animated={values.animated as boolean}
            zoomable={values.zoomable as boolean}
            bodyWidthRatio={values.bodyWidthRatio as number}
          />
        </div>
      )}
    />
  );
}
