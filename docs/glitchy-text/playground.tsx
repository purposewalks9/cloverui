"use client";

import {
  GlitchyText,
  type GlitchyTextColor,
  type GlitchyTextTrigger,
} from "@/registry/clover-ui/glitchy-text";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const pixelSwatch = [
  "#ef4444",
  "#facc15",
  "#22c55e",
  "#3b82f6",
  "#ec4899",
  "#f97316",
  "#a855f7",
  "#22d3ee",
  "#ef4444",
]
  .map(
    (color, index) =>
      `linear-gradient(${color}, ${color}) ${(index % 3) * 50}% ${Math.floor(index / 3) * 50}% / 34% 34% no-repeat`,
  )
  .join(", ");

const colors = [
  { value: "default", label: "Default", swatch: "#52525b" },
  { value: "red", label: "Red", swatch: "#ef4444" },
  { value: "blue", label: "Blue", swatch: "#3b82f6" },
  { value: "green", label: "Green", swatch: "#22c55e" },
  { value: "purple", label: "Purple", swatch: "#a855f7" },
  { value: "orange", label: "Orange", swatch: "#f97316" },
  { value: "pixel", label: "Pixel", swatch: pixelSwatch },
];

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "trigger",
    label: "Trigger",
    options: [
      { label: "Auto", value: "auto" },
      { label: "Hover", value: "hover" },
      { label: "Always", value: "always" },
    ],
  },
  { type: "select", prop: "color", label: "Color", options: colors },
];

const defaultProps = {
  trigger: "auto",
  color: "default",
};

export function GlitchyTextPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => (
        <div className="flex w-full justify-center px-4">
          <GlitchyText
            trigger={values.trigger as GlitchyTextTrigger}
            color={values.color as GlitchyTextColor}
            interval={2400}
            className="text-center text-4xl font-bold tracking-tight sm:text-5xl"
          >
            SIGNAL LOST
          </GlitchyText>
        </div>
      )}
    />
  );
}
