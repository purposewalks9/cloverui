"use client";

import { SoftButton } from "@/registry/clover-ui/soft-button";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  { type: "text", prop: "children", label: "Label" },
  {
    type: "select",
    prop: "color",
    label: "Color",
    options: [
      "red",
      "darkRed",
      "green",
      "lime",
      "blue",
      "purple",
      "orange",
      "yellow",
      "pink",
      "cyan",
    ].map((v) => ({ label: v, value: v })),
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
];

const defaultProps = {
  children: "Explore Clover",
  color: "lime",
  size: "default",
};

export function SoftButtonPlayground() {
  return (
    <PlaygroundShell
      componentName="SoftButton"
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => (
      <div className="flex w-full justify-center">
        <SoftButton color={values.color as any} size={values.size as any}>
          {values.children as string}
        </SoftButton>
        </div>
      )}
    />
  );
}
