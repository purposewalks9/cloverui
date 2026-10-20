"use client";

import { Checkbox, type CheckboxSize } from "@/registry/clover-ui/checkbox";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const colors: Record<string, string | undefined> = {
  default: undefined,
  blue: "#3d46ff",
  green: "#16a34a",
  orange: "#f97316",
  pink: "#ec4899",
};

const controls: ControlDef[] = [
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
    prop: "color",
    label: "Checked color",
    options: Object.entries(colors).map(([value, swatch]) => ({
      label: value[0].toUpperCase() + value.slice(1),
      value,
      swatch: swatch ?? "#0a0a0a",
    })),
  },
  { type: "boolean", prop: "disabled", label: "Disabled" },
];

export function CheckboxPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={{ size: "lg", color: "default", disabled: false }}
      render={(values) => (
        <div className="flex min-h-[280px] items-center justify-center px-4">
          <Checkbox
            size={values.size as CheckboxSize}
            color={colors[values.color as string]}
            disabled={values.disabled as boolean}
            aria-label="Check option"
          />
        </div>
      )}
    />
  );
}
