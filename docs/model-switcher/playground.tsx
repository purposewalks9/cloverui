"use client";

import { ModelSwitcher } from "@/registry/clover-ui/model-switcher";
import type { EffortSliderTheme } from "@/registry/clover-ui/effort-slider";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { jsx, type ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "effortTheme",
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
  { type: "boolean", prop: "disabled", label: "Disabled" },
];

const defaultProps = {
  effortTheme: "aurora",
  disabled: false,
};

export function ModelSwitcherPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      code={(values) =>
        jsx("ModelSwitcher", {
          effortTheme: values.effortTheme,
          disabled: values.disabled,
        })
      }
      render={(values) => (
        <div className="flex h-[30rem] w-full items-center justify-center">
          <ModelSwitcher
            effortTheme={values.effortTheme as EffortSliderTheme}
            disabled={values.disabled as boolean}
          />
        </div>
      )}
    />
  );
}
