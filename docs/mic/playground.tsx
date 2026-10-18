"use client";

import { Mic, type MicColor, type MicSize } from "@/registry/clover-ui/mic";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const colors: { value: MicColor; swatch: string }[] = [
  { value: "blue", swatch: "#3b82f6" },
  { value: "purple", swatch: "#a855f7" },
  { value: "pink", swatch: "#ec4899" },
  { value: "emerald", swatch: "#10b981" },
  { value: "orange", swatch: "#f97316" },
  { value: "default", swatch: "#71717a" },
];

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "color",
    label: "Color",
    options: colors.map((c) => ({
      label: c.value[0].toUpperCase() + c.value.slice(1),
      value: c.value,
      swatch: c.swatch,
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
  { type: "boolean", prop: "disabled", label: "Disabled" },
];

const defaultProps = {
  color: "blue",
  size: "lg",
  disabled: false,
};

export function MicPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => (
        <Mic
          color={values.color as MicColor}
          size={values.size as MicSize}
          disabled={values.disabled as boolean}
        />
      )}
    />
  );
}
