"use client";

import { ThemeToggle, type ThemeToggleSize } from "@/registry/clover-ui/theme-toggle";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  { type: "color", prop: "sunColor", label: "Sun" },
  { type: "color", prop: "moonColor", label: "Moon" },
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
];

const defaultProps = {
  sunColor: "#ffd76a",
  moonColor: "#e9e9f2",
  size: "lg",
};

export function ThemeTogglePlayground() {
  return (
    <PlaygroundShell
      componentName="ThemeToggle"
      controls={controls}
      defaultProps={defaultProps}
      codeNote="click it to switch this site's theme"
      render={(values) => (
        <div className="flex min-h-[220px] w-full items-center justify-center">
          <ThemeToggle
            sunColor={values.sunColor as string}
            moonColor={values.moonColor as string}
            size={values.size as ThemeToggleSize}
          />
        </div>
      )}
    />
  );
}
