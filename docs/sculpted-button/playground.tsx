"use client";

import { Play } from "lucide-react";
import {
  SculptedButton,
  type SculptedButtonShape,
  type SculptedButtonSize,
} from "@/registry/clover-ui/sculpted-button";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  { type: "text", prop: "label", label: "Label" },
  {
    type: "select",
    prop: "shape",
    label: "Shape",
    options: [
      { label: "Pill", value: "pill" },
      { label: "Circle", value: "circle" },
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

export function SculptedButtonPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={{ label: "Run", shape: "pill", size: "lg", disabled: false }}
      render={(values) => (
        <div className="flex min-h-[220px] w-full items-center justify-center py-6">
          <SculptedButton
            shape={values.shape as SculptedButtonShape}
            size={values.size as SculptedButtonSize}
            disabled={values.disabled as boolean}
            aria-label={values.shape === "circle" ? (values.label as string) || "Run" : undefined}
          >
            {values.shape === "circle" ? (
              <Play aria-hidden fill="currentColor" />
            ) : (
              (values.label as string)
            )}
          </SculptedButton>
        </div>
      )}
    />
  );
}
