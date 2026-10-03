"use client";

import {
  GRID_REVEAL_COLORS,
  GridReveal,
  type GridRevealColor,
  type GridRevealPattern,
} from "@/registry/clover-ui/grid-reveal";
import { PlaygroundShell } from "@/components/garden/playground-shell";
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
  {
    type: "select",
    prop: "color",
    label: "Color",
    options: (Object.keys(GRID_REVEAL_COLORS) as GridRevealColor[]).map((color) => ({
      label: color[0].toUpperCase() + color.slice(1),
      value: color,
      swatch: GRID_REVEAL_COLORS[color],
    })),
  },
  { type: "number", prop: "rows", label: "Rows", min: 2, max: 14, step: 1 },
  { type: "number", prop: "cols", label: "Cols", min: 2, max: 14, step: 1 },
  {
    type: "number",
    prop: "blockDuration",
    label: "Block duration",
    min: 0.05,
    max: 0.6,
    step: 0.01,
  },
  { type: "number", prop: "stagger", label: "Stagger", min: 0.005, max: 0.08, step: 0.005 },
  { type: "boolean", prop: "loop", label: "Loop" },
];

const defaultProps = {
  pattern: "random",
  color: "yellow",
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
            pattern={values.pattern as GridRevealPattern}
            color={values.color as GridRevealColor}
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
                <p className="text-muted-foreground mt-1 text-xs">Scattered motion.</p>
              </div>
            </div>
          </GridReveal>
        </div>
      )}
    />
  );
}
