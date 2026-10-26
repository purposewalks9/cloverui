"use client";

import {
  PetalReveal,
  type PetalRevealColor,
  type PetalRevealPattern,
} from "@/registry/clover-ui/petal-reveal";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { jsx, type ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "color",
    label: "Color",
    options: [
      { label: "Pink", value: "pink", swatch: "#ee6880" },
      { label: "Red", value: "red", swatch: "#c4122c" },
      { label: "White", value: "white", swatch: "#fffdf6" },
      { label: "Yellow", value: "yellow", swatch: "#f5be18" },
      { label: "Peach", value: "peach", swatch: "#f28458" },
      { label: "Purple", value: "purple", swatch: "#b242c4" },
      {
        label: "Mixed",
        value: "mixed",
        swatch: "linear-gradient(90deg, #ee6880, #c4122c, #f5be18, #f28458, #b242c4)",
      },
    ],
  },
  {
    type: "select",
    prop: "pattern",
    label: "Pattern",
    options: [
      { label: "Random", value: "random" },
      { label: "Top", value: "top" },
      { label: "Wave", value: "wave" },
      { label: "Diagonal", value: "diagonal" },
      { label: "Center", value: "center" },
    ],
  },
  { type: "number", prop: "size", label: "Petal size", min: 24, max: 90, step: 2 },
  { type: "number", prop: "duration", label: "Duration", min: 0.2, max: 3, step: 0.1 },
  { type: "number", prop: "loopDelay", label: "Loop delay", min: 0.4, max: 4, step: 0.1 },
  { type: "boolean", prop: "loop", label: "Loop" },
];

const defaultProps = {
  color: "pink",
  pattern: "random",
  size: 44,
  duration: 1,
  loopDelay: 1.6,
  loop: true,
};

export function PetalRevealPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      code={(values) =>
        jsx(
          "PetalReveal",
          {
            color: values.color,
            pattern: values.pattern,
            size: values.size,
            duration: values.duration,
            loopDelay: values.loopDelay,
            loop: values.loop,
            className: "aspect-square w-full max-w-[340px]",
          },
          "{children}",
        )
      }
      render={(values) => (
        <div className="flex w-full justify-center">
          <PetalReveal
            key={JSON.stringify(values)}
            color={values.color as PetalRevealColor}
            pattern={values.pattern as PetalRevealPattern}
            size={values.size as number}
            duration={values.duration as number}
            loopDelay={values.loopDelay as number}
            loop={values.loop as boolean}
            className="aspect-square w-full max-w-[340px]"
          >
            <div className="flex aspect-square w-full items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-medium tracking-tight">Petal Reveal</p>
                <p className="text-muted-foreground mt-1 text-sm">Blown away.</p>
              </div>
            </div>
          </PetalReveal>
        </div>
      )}
    />
  );
}
