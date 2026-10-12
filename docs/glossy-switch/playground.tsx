"use client";

import { GlossySwitch, type GlossySwitchSize } from "@/registry/clover-ui/glossy-switch";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  { type: "color", prop: "color", label: "On color" },
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
  { type: "text", prop: "onLabel", label: "On label" },
  { type: "text", prop: "offLabel", label: "Off label" },
  { type: "boolean", prop: "disabled", label: "Disabled" },
];

const defaultProps = {
  color: "#42aa78",
  size: "lg",
  onLabel: "ON",
  offLabel: "OFF",
  disabled: false,
};

export function GlossySwitchPlayground() {
  return (
    <PlaygroundShell
      componentName="GlossySwitch"
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => (
        <div className="flex min-h-[220px] w-full items-center justify-center">
          <GlossySwitch
            aria-label="Power"
            color={values.color as string}
            size={values.size as GlossySwitchSize}
            onLabel={values.onLabel as string}
            offLabel={values.offLabel as string}
            disabled={values.disabled as boolean}
          />
        </div>
      )}
    />
  );
}
