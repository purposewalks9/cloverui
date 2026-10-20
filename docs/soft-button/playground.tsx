"use client";

import { SoftButton } from "@/registry/clover-ui/soft-button";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import { jsx, type ControlDef } from "@/lib/playground";

type SoftButtonProps = React.ComponentProps<typeof SoftButton>;

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
      controls={controls}
      defaultProps={defaultProps}
      code={(values) =>
        jsx("SoftButton", { color: values.color, size: values.size }, values.children as string)
      }
      render={(values) => (
      <div className="flex w-full justify-center">
        <SoftButton color={values.color as SoftButtonProps["color"]} size={values.size as SoftButtonProps["size"]}>
          {values.children as string}
        </SoftButton>
        </div>
      )}
    />
  );
}
