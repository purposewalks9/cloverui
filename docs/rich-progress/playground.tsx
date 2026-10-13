"use client";

import { useState } from "react";
import {
  RichProgress,
  type RichProgressColor,
  type RichProgressKnob,
  type RichProgressSize,
} from "@/registry/clover-ui/rich-progress";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  { type: "text", prop: "label", label: "Label" },
  { type: "number", prop: "value", label: "Value", min: 0, max: 100, step: 1 },
  {
    type: "select",
    prop: "color",
    label: "Color",
    options: [
      "default",
      "blue",
      "purple",
      "pink",
      "red",
      "orange",
      "yellow",
      "green",
      "teal",
      "cyan",
      "indigo",
      "violet",
      "rose",
      "amber",
      "lime",
      "sky",
      "emerald",
    ].map((v) => ({ label: v, value: v })),
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
  size: "default",
  knob: "square",
  showValue: true,
};

export function RichProgressPlayground() {
  const [value, setValue] = useState(defaultProps.value);

  return (
    <PlaygroundShell
      componentName="RichProgress"
      controls={controls}
      defaultProps={defaultProps}
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
