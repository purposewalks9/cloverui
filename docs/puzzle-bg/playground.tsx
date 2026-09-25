"use client";

import { PuzzleBg } from "@/registry/clover-ui/puzzle-bg";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  { type: "text", prop: "children", label: "Element text (fills with a div)" },
  { type: "text", prop: "image", label: "Image link" },
  { type: "color", prop: "color", label: "Color" },
  {
    type: "select",
    prop: "direction",
    label: "Direction",
    options: [
      { label: "In", value: "in" },
      { label: "Out", value: "out" },
    ],
  },
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
  { type: "number", prop: "rows", label: "Rows", min: 2, max: 8, step: 1 },
  { type: "number", prop: "cols", label: "Cols", min: 2, max: 10, step: 1 },
  { type: "number", prop: "pieceDuration", label: "Piece duration", min: 0.2, max: 1.4, step: 0.05 },
  { type: "number", prop: "stagger", label: "Stagger", min: 0.01, max: 0.2, step: 0.01 },
  { type: "number", prop: "knobSize", label: "Knob size", min: 0.6, max: 1.5, step: 0.05 },
  { type: "number", prop: "scatter", label: "Scatter", min: 0.3, max: 2, step: 0.1 },
  { type: "boolean", prop: "loop", label: "Loop" },
];

const defaultProps = {
  children: "",
  image: "/aurora.gif",
  color: "#E1E900",
  direction: "in",
  pattern: "random",
  rows: 3,
  cols: 4,
  pieceDuration: 0.7,
  stagger: 0.06,
  knobSize: 1.1,
  scatter: 1,
  loop: false,
};

export function PuzzleBgPlayground() {
  return (
    <PlaygroundShell
      componentName="PuzzleBg"
      controls={controls}
      defaultProps={defaultProps}
      codeNote="fills with children first, then image, then color. Clear the text and the image link to use color"
      render={(values) => {
        const text = values.children as string;
        return (
          <div className="flex w-full justify-center">
            <PuzzleBg
              key={JSON.stringify(values)}
              image={(values.image as string) || undefined}
              color={values.color as string}
              direction={values.direction as "in" | "out"}
              pattern={values.pattern as "random" | "wave" | "diagonal" | "center"}
              rows={values.rows as number}
              cols={values.cols as number}
              pieceDuration={values.pieceDuration as number}
              stagger={values.stagger as number}
              knobSize={values.knobSize as number}
              scatter={values.scatter as number}
              loop={values.loop as boolean}
              className="aspect-video w-full max-w-[360px] rounded-2xl"
            >
              {text ? (
                <div className="grid h-full w-full place-items-center bg-neutral-900 p-6 text-center text-xl font-medium tracking-tight text-white">
                  {text}
                </div>
              ) : undefined}
            </PuzzleBg>
          </div>
        );
      }}
    />
  );
}
