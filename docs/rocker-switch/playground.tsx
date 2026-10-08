"use client";

import { RockerSwitch, type RockerSwitchSize } from "@/registry/clover-ui/rocker-switch";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  { type: "color", prop: "glowColor", label: "Glow" },
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
];

const defaultProps = {
  glowColor: "#7dff3c",
  size: "lg",
  onLabel: "ON",
  offLabel: "OFF",
};

export function RockerSwitchPlayground() {
  return (
    <PlaygroundShell
      componentName="RockerSwitch"
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => (
        <div className="flex min-h-[220px] w-full items-center justify-center">
          <RockerSwitch
            glowColor={values.glowColor as string}
            size={values.size as RockerSwitchSize}
            onLabel={values.onLabel as string}
            offLabel={values.offLabel as string}
          />
        </div>
      )}
    />
  );
}
