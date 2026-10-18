"use client";

import { ReasoningEffort, type ReasoningEffortTheme } from "@/registry/clover-ui/reasoning-effort";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "theme",
    label: "Theme",
    options: [
      {
        label: "Aurora",
        value: "aurora",
        swatch: "linear-gradient(90deg, #b4b7ee, #c3aef0, #f9a8d4)",
      },
      {
        label: "Ocean",
        value: "ocean",
        swatch: "linear-gradient(90deg, #a9d8f0, #9cc9f5, #8fe3dc)",
      },
      {
        label: "Ember",
        value: "ember",
        swatch: "linear-gradient(90deg, #f5c99a, #f7b48f, #ff9e9e)",
      },
      {
        label: "Forest",
        value: "forest",
        swatch: "linear-gradient(90deg, #b6e3ad, #a8e6a8, #e2f09a)",
      },
      { label: "Mono", value: "mono", swatch: "linear-gradient(90deg, #d4d4d8, #a1a1aa, #fafafa)" },
    ],
  },
  { type: "text", prop: "label", label: "Label" },
  { type: "number", prop: "recommended", label: "Recommended", min: 0, max: 3, step: 1 },
  { type: "boolean", prop: "disabled", label: "Disabled" },
];

const defaultProps = {
  theme: "aurora",
  label: "Effort",
  recommended: 2,
  disabled: false,
};

export function ReasoningEffortPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => (
        <ReasoningEffort
          theme={values.theme as ReasoningEffortTheme}
          label={values.label as string}
          recommended={values.recommended as number}
          disabled={values.disabled as boolean}
        />
      )}
    />
  );
}
