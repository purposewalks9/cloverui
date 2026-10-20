"use client";

import { Play } from "lucide-react";
import {
  PressButton,
  type PressButtonShape,
  type PressButtonSize,
  type PressButtonTheme,
} from "@/registry/clover-ui/press-button";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  { type: "text", prop: "label", label: "Label" },
  {
    type: "select",
    prop: "color",
    label: "Color",
    options: [
      {
        label: "Neutral",
        value: "auto",
        swatch: "linear-gradient(135deg, #eeeeef 50%, #222228 50%)",
      },
      { label: "Purple", value: "#8b5cf6", swatch: "#8b5cf6" },
      { label: "Blue", value: "#0b87da", swatch: "#0b87da" },
      { label: "Green", value: "#22c55e", swatch: "#22c55e" },
      { label: "Orange", value: "#f97316", swatch: "#f97316" },
      { label: "Pink", value: "#ec4899", swatch: "#ec4899" },
    ],
  },
  {
    type: "select",
    prop: "theme",
    label: "Theme",
    options: [
      { label: "Auto", value: "auto" },
      { label: "Light", value: "light" },
      { label: "Dark", value: "dark" },
    ],
  },
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

export function PressButtonPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={{
        label: "Run",
        shape: "pill",
        size: "lg",
        disabled: false,
        theme: "auto",
        color: "auto",
      }}
      render={(values) => (
        <div className="flex min-h-[220px] w-full items-center justify-center py-6">
          <PressButton
            theme={values.theme as PressButtonTheme}
            color={values.color === "auto" ? undefined : (values.color as string)}
            shape={values.shape as PressButtonShape}
            size={values.size as PressButtonSize}
            disabled={values.disabled as boolean}
            aria-label={values.shape === "circle" ? (values.label as string) || "Run" : undefined}
          >
            {values.shape === "circle" ? (
              <Play aria-hidden fill="currentColor" />
            ) : (
              (values.label as string)
            )}
          </PressButton>
        </div>
      )}
    />
  );
}
