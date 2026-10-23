"use client";

import {
  LiquidButton,
  type LiquidButtonSize,
  type ElementName,
} from "@/registry/clover-ui/liquid-button";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { jsx, type ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  { type: "text", prop: "children", label: "Label" },
  {
    type: "select",
    prop: "element",
    label: "Theme",
    options: [
      { label: "Lava", value: "lava", swatch: "#d42a1a" },
      { label: "Ocean", value: "ocean", swatch: "#1d6fc4" },
      { label: "Stone", value: "stone", swatch: "#8a5a2b" },
      { label: "Sky", value: "sky", swatch: "#3f6d96" },
      { label: "Obsidian", value: "obsidian", swatch: "#1f1f23" },
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
  size: "lg",
  disabled: false,
};

export function LiquidButtonPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      code={(values) =>
        jsx(
          "LiquidButton",
          { element: values.element, size: values.size, disabled: values.disabled },
          values.children as string,
        )
      }
      render={(values) => (
        <LiquidButton
          element={values.element as ElementName}
          size={values.size as LiquidButtonSize}
          disabled={values.disabled as boolean}
        >
          {values.children as string}
        </LiquidButton>
      )}
    />
  );
}
