"use client";

import { GridReveal } from "@/registry/clover-ui/grid-reveal";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "pattern",
    label: "Pattern",
    options: [
      { label: "Random", value: "random" },
      { label: "Wave", value: "wave" },
      { label: "Diagonal", value: "diagonal" },
      { label: "Center", value: "center" },
    ],
  },
  { type: "color", prop: "color", label: "Color" },
  { type: "number", prop: "rows", label: "Rows", min: 2, max: 14, step: 1 },
  { type: "number", prop: "cols", label: "Cols", min: 2, max: 14, step: 1 },
  { type: "number", prop: "blockDuration", label: "Block duration", min: 0.05, max: 0.6, step: 0.01 },
  { type: "number", prop: "stagger", label: "Stagger", min: 0.005, max: 0.08, step: 0.005 },
  { type: "boolean", prop: "loop", label: "Loop" },
];

const defaultProps = {
  pattern: "random",
  color: "#E1E900",
  rows: 8,
  cols: 8,
  blockDuration: 0.28,
  stagger: 0.018,
  loop: false,
};

export function GridRevealPlayground() {
  return (
    <PlaygroundShell
      componentName="GridReveal"
      controls={controls}
      defaultProps={defaultProps}
      codeNote="children omitted here — pass whatever content sits behind the grid"
      render={(values) => (
      <div className="flex w-full justify-center">
        <GridReveal
          key={JSON.stringify(values)}
          pattern={values.pattern as "random" | "wave" | "diagonal" | "center"}
          color={values.color as string}
          rows={values.rows as number}
          cols={values.cols as number}
          blockDuration={values.blockDuration as number}
          stagger={values.stagger as number}
          loop={values.loop as boolean}
          className="aspect-square w-full max-w-[220px]"
        >
          <div className="flex aspect-square w-full items-center justify-center">
            <div className="text-center">
              <p className="text-base font-medium tracking-tight">Grid Reveal</p>
              <p className="mt-1 text-xs text-muted-foreground">Scattered motion.</p>
            </div>
          </div>
        </GridReveal>
        </div>
      )}
    />
  );
}
