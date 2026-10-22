"use client";

import { Switch, type SwitchSize } from "@/registry/clover-ui/switch";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { jsx, type ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "color",
    label: "On color",
    options: [
      { label: "Green", value: "#42aa78", swatch: "#42aa78" },
      { label: "Black", value: "#111111", swatch: "#111111" },
      { label: "Red", value: "#ef4444", swatch: "#ef4444" },
      { label: "Orange", value: "#f97316", swatch: "#f97316" },
      { label: "Yellow", value: "#e1e900", swatch: "#e1e900" },
      { label: "Lime", value: "#22c55e", swatch: "#22c55e" },
      { label: "Blue", value: "#0b87da", swatch: "#0b87da" },
      { label: "Purple", value: "#7c3aed", swatch: "#7c3aed" },
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
  { type: "boolean", prop: "showLabels", label: "Show labels" },
  { type: "boolean", prop: "disabled", label: "Disabled" },
];

const defaultProps = {
  color: "#42aa78",
  size: "default",
  showLabels: true,
  disabled: false,
};

export function SwitchPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      code={(values) =>
        jsx("Switch", {
          "aria-label": "Power",
          color: values.color,
          size: values.size,
          showLabels: values.showLabels,
          disabled: values.disabled,
        })
      }
      render={(values) => (
        <div className="flex min-h-[220px] w-full items-center justify-center">
          <Switch
            aria-label="Power"
            color={values.color as string}
            size={values.size as SwitchSize}
            showLabels={values.showLabels as boolean}
            disabled={values.disabled as boolean}
          />
        </div>
      )}
    />
  );
}
