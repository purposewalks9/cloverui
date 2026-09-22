"use client";

import { useState } from "react";
import { RichProgress } from "@/registry/clover-ui/rich-progress";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  {
    type: "number",
    prop: "value",
    label: "Value",
    min: 0,
    max: 100,
    step: 1,
  },
  {
    type: "color",
    prop: "color",
    label: "Color",
  },
  {
    type: "text",
    prop: "size",
    label: "Size (sm | default | lg)",
  },
  {
    type: "boolean",
    prop: "showValue",
    label: "Show value",
  },
  {
    type: "boolean",
    prop: "knob",
    label: "Knob",
  },
  {
    type: "boolean",
    prop: "sound",
    label: "Sound",
  },
];

const defaultProps = {
  value: 65,
  color: "red",
  size: "default",
  showValue: true,
  knob: true,
  sound: false,
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
            color={values.color as any}
            size={values.size as any}
            showValue={values.showValue as boolean}
            knob={values.knob as boolean}
            sound={values.sound as boolean}
          />
        </div>
      )}
    />
  );
}
