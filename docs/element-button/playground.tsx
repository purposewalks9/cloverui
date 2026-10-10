"use client";

import {
  ElementButton,
  type ElementButtonSize,
  type ElementName,
} from "@/registry/clover-ui/element-button";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  { type: "text", prop: "children", label: "Label" },
  {
    type: "select",
    prop: "element",
    label: "Element",
    options: [
      { label: "Lava", value: "lava", swatch: "#d42a1a" },
      { label: "Ocean", value: "ocean", swatch: "#1d6fc4" },
      { label: "Stone", value: "stone", swatch: "#8a5a2b" },
      { label: "Sky", value: "sky", swatch: "#3f6d96" },
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
  { type: "boolean", prop: "disabled", label: "Disabled" },
];

const defaultProps = {
  children: "Get started",
  element: "lava",
  size: "default",
  disabled: false,
};

export function ElementButtonPlayground() {
  return (
    <PlaygroundShell
      componentName="ElementButton"
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => (
        <ElementButton
          element={values.element as ElementName}
          size={values.size as ElementButtonSize}
          disabled={values.disabled as boolean}
        >
          {values.children as string}
        </ElementButton>
      )}
    />
  );
}
