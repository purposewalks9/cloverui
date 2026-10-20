"use client";

import { GaugeText } from "@/registry/clover-ui/gauge-text";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import { jsx, type ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  { type: "number", prop: "value", label: "Value", min: 0, max: 500, step: 1 },
  { type: "text", prop: "suffix", label: "Suffix" },
  { type: "text", prop: "label", label: "Label" },
  {
    type: "select",
    prop: "speed",
    label: "Speed",
    options: [
      { label: "Slow", value: "slow" },
      { label: "Normal", value: "normal" },
      { label: "Fast", value: "fast" },
    ],
  },
  { type: "color", prop: "color", label: "Color" },
  { type: "number", prop: "decimals", label: "Decimals", min: 0, max: 3, step: 1 },
  { type: "boolean", prop: "showIcon", label: "Show icon" },
];

const defaultProps = {
  value: 89,
  suffix: "x",
  label: "faster",
  speed: "normal",
  color: "#E1E900",
  decimals: 0,
  showIcon: true,
};

export function GaugeTextPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      code={(values) =>
        jsx("GaugeText", {
          value: values.value,
          suffix: values.suffix,
          label: values.label,
          speed: values.speed,
          color: values.color,
          decimals: values.decimals,
          showIcon: values.showIcon,
          className: "text-2xl font-semibold",
        })
      }
      render={(values) => (
        <div className="flex w-full justify-center">
          <GaugeText
            key={JSON.stringify(values)}
            value={values.value as number}
            suffix={values.suffix as string}
            label={values.label as string}
            speed={values.speed as "slow" | "normal" | "fast"}
            color={values.color as string}
            decimals={values.decimals as number}
            showIcon={values.showIcon as boolean}
            className="text-2xl font-semibold"
          />
        </div>
      )}
    />
  );
}
