"use client";

import { PressButton, type PressButtonSize } from "@/registry/clover-ui/press-button";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  { type: "text", prop: "label", label: "Label" },
  {
    type: "select",
    prop: "color",
    label: "Color",
    options: [
      { label: "White", value: "white", swatch: "#ffffff" },
      { label: "Purple", value: "#8b5cf6", swatch: "#8b5cf6" },
      { label: "Blue", value: "#0b87da", swatch: "#0b87da" },
      { label: "Green", value: "#22c55e", swatch: "#22c55e" },
      { label: "Orange", value: "#f97316", swatch: "#f97316" },
      { label: "Pink", value: "#ec4899", swatch: "#ec4899" },
    ],
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
  { type: "boolean", prop: "disabled", label: "Disabled" },
];

export function PressButtonPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={{
        label: "Button",
        size: "lg",
        disabled: false,
        color: "white",
      }}
      render={(values) => (
        <div className="flex min-h-[220px] w-full items-center justify-center py-6">
          <PressButton
            color={values.color === "white" ? undefined : (values.color as string)}
            size={values.size as PressButtonSize}
            disabled={values.disabled as boolean}
          >
            {values.label as string}
          </PressButton>
        </div>
      )}
    />
  );
}
