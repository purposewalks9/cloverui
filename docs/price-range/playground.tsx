"use client";

import * as React from "react";
import {
  PriceRange,
  type PriceRangeColor,
  type PriceRangeKnob,
  type PriceRangeValue,
} from "@/registry/clover-ui/price-range";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { expr, jsx, type ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "currency",
    label: "Currency",
    options: [
      { label: "None", value: "" },
      { label: "USD", value: "USD" },
      { label: "EUR", value: "EUR" },
      { label: "GBP", value: "GBP" },
    ],
  },
  {
    type: "select",
    prop: "color",
    label: "Color",
    options: ["default", "indigo", "blue", "emerald", "rose", "amber"].map((v) => ({
      label: v,
      value: v,
    })),
  },
  {
    type: "select",
    prop: "knob",
    label: "Knob",
    options: [
      { label: "Circle", value: "circle" },
      { label: "Ring", value: "ring" },
      { label: "Pill", value: "pill" },
      { label: "Line", value: "line" },
    ],
  },
  { type: "number", prop: "ticks", label: "Ticks", min: 2, max: 50, step: 1 },
  { type: "boolean", prop: "showTicks", label: "Show ticks" },
  { type: "boolean", prop: "disabled", label: "Disabled" },
];

const defaultProps = {
  currency: "",
  color: "indigo",
  knob: "circle",
  ticks: 25,
  showTicks: true,
  disabled: false,
};

export function PriceRangePlayground() {
  const [value, setValue] = React.useState<PriceRangeValue>([30000, 120000]);

  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      code={(values) =>
        jsx("PriceRange", {
          value: expr("value"),
          onValueChange: expr("setValue"),
          currency: values.currency,
          color: values.color,
          knob: values.knob,
          ticks: values.ticks,
          showTicks: values.showTicks,
          disabled: values.disabled,
        })
      }
      render={(values) => (
        <div className="flex w-full items-center justify-center px-4 py-10">
          <PriceRange
            value={value}
            onValueChange={setValue}
            currency={(values.currency as string) || undefined}
            color={values.color as PriceRangeColor}
            knob={values.knob as PriceRangeKnob}
            ticks={values.ticks as number}
            showTicks={values.showTicks as boolean}
            disabled={values.disabled as boolean}
          />
        </div>
      )}
    />
  );
}
