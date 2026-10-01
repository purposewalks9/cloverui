"use client";

import { CursorTag, type CursorTagSide, type CursorTagSize } from "@/registry/clover-ui/cursor-tag";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  { type: "text", prop: "label", label: "Label" },
  {
    type: "select",
    prop: "side",
    label: "Side",
    options: [
      { label: "Right", value: "right" },
      { label: "Left", value: "left" },
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
  { type: "color", prop: "color", label: "Color" },
  { type: "color", prop: "textColor", label: "Text color" },
  { type: "boolean", prop: "float", label: "Float" },
];

const defaultProps = {
  label: "Content Reviewer",
  side: "right",
  size: "default",
  color: "#7c3aed",
  textColor: "#ffffff",
  float: true,
};

export function CursorTagPlayground() {
  return (
    <PlaygroundShell
      componentName="CursorTag"
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => (
        <div className="flex min-h-[260px] w-full items-center justify-center">
          <CursorTag
            label={values.label as string}
            side={values.side as CursorTagSide}
            size={values.size as CursorTagSize}
            color={(values.color as string) || undefined}
            textColor={(values.textColor as string) || undefined}
            float={values.float as boolean}
          />
        </div>
      )}
    />
  );
}
