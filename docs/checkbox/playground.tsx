"use client";

import { Checkbox, type CheckboxSize } from "@/registry/clover-ui/checkbox";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

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
  { type: "color", prop: "color", label: "Checked color" },
  { type: "boolean", prop: "disabled", label: "Disabled" },
];

export function CheckboxPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={{ size: "lg", color: "#3d46ff", disabled: false }}
      render={(values) => (
        <div className="flex min-h-[280px] items-center justify-center gap-8 px-4 sm:gap-16">
          <Checkbox
            size={values.size as CheckboxSize}
            color={values.color as string}
            disabled={values.disabled as boolean}
            aria-label="First option"
          />
          <Checkbox
            size={values.size as CheckboxSize}
            color={values.color as string}
            disabled={values.disabled as boolean}
            aria-label="Second option"
            defaultChecked
          />
        </div>
      )}
    />
  );
}
