"use client";

import { ModelPicker, type ModelPickerSide } from "@/registry/clover-ui/model-picker";
import type { EffortSliderTheme } from "@/registry/clover-ui/effort-slider";
import { PlaygroundShell } from "@/components/garden/playground-shell";
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
  {
    type: "select",
    prop: "side",
    label: "Opens",
    options: [
      { label: "Below", value: "bottom" },
      { label: "Above", value: "top" },
    ],
  },
  { type: "boolean", prop: "disabled", label: "Disabled" },
];

const defaultProps = {
  effortTheme: "aurora",
  side: "bottom",
  disabled: false,
};

export function ModelPickerPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      code={(values) =>
        jsx("ModelPicker", {
          effortTheme: values.effortTheme,
          side: values.side,
          disabled: values.disabled,
        })
      }
      render={(values) => (
        <div
          className={
            values.side === "bottom"
              ? "flex h-72 w-full items-start justify-center"
              : "flex h-72 w-full items-end justify-center"
          }
        >
          <ModelPicker
            effortTheme={values.effortTheme as EffortSliderTheme}
            side={values.side as ModelPickerSide}
            disabled={values.disabled as boolean}
          />
        </div>
      )}
    />
  );
}
