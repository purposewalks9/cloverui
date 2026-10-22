"use client";

import { ModelSwitcher } from "@/registry/clover-ui/model-switcher";
import type { EffortSliderTheme } from "@/registry/clover-ui/effort-slider";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { jsx, type ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "effortTheme",
    label: "Effort theme",
    options: [
      { label: "Aurora", value: "aurora" },
      { label: "Ocean", value: "ocean" },
      { label: "Ember", value: "ember" },
      { label: "Forest", value: "forest" },
      { label: "Mono", value: "mono" },
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
