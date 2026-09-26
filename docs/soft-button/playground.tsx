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
      { label: "red", value: "red", swatch: "#ff2d2d" },
      { label: "darkRed", value: "darkRed", swatch: "#e31212" },
      { label: "green", value: "green", swatch: "#63a928" },
      { label: "lime", value: "lime", swatch: "#b8ed20" },
      { label: "blue", value: "blue", swatch: "#278ff0" },
      { label: "purple", value: "purple", swatch: "#9c4cff" },
      { label: "orange", value: "orange", swatch: "#ff922e" },
      { label: "yellow", value: "yellow", swatch: "#ffdc32" },
      { label: "pink", value: "pink", swatch: "#f04fbd" },
      { label: "cyan", value: "cyan", swatch: "#28dce7" },
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
