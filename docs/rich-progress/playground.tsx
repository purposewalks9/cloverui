"use client";

import * as React from "react";
import {
  RichProgress,
  type RichProgressColor,
  type RichProgressKnob,
  type RichProgressSize,
} from "@/registry/clover-ui/rich-progress";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { expr, jsx, type ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  { type: "text", prop: "label", label: "Label" },
  { type: "number", prop: "value", label: "Value", min: 0, max: 100, step: 1 },
  {
    type: "select",
    prop: "color",
    label: "Color",
    options: ["default", "blue", "violet", "emerald", "rose", "amber"].map((v) => ({
      label: v,
      value: v,
    })),
  },
  {
    type: "select",
    prop: "size",
    label: "Size",
    options: [
      { label: "Small", value: "sm" },
      { label: "Default", value: "default" },
      { label: "Large", value: "lg" },
    ],
  },
  {
    type: "select",
    prop: "knob",
    label: "Knob",
    options: [
      { label: "Square", value: "square" },
      { label: "Circle", value: "circle" },
    ],
  },
  { type: "boolean", prop: "showValue", label: "Show value" },
];

const defaultProps = {
  label: "Ambient light",
  value: 65,
  color: "default",
  size: "lg",
  knob: "square",
  showValue: true,
};

export function RichProgressPlayground() {
  const [value, setValue] = React.useState(defaultProps.value);

  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      code={(values) =>
        jsx("RichProgress", {
          value: expr("value"),
          onChange: expr("setValue"),
          label: values.label,
          color: values.color,
          size: values.size,
          showValue: values.showValue,
          knob: values.knob,
        })
      }
      render={(values) => (
        <div className="flex w-full items-center justify-center px-6 py-8">
          <RichProgress
            value={value}
            onChange={setValue}
            label={values.label as string}
            color={values.color as RichProgressColor}
            size={values.size as RichProgressSize}
            showValue={values.showValue as boolean}
            knob={values.knob as RichProgressKnob}
          />
        </div>
      )}
    />
  );
}
