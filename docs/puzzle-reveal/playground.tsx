"use client";

import { PuzzleReveal } from "@/registry/clover-ui/puzzle-reveal";
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
  { type: "number", prop: "rows", label: "Rows", min: 2, max: 10, step: 1 },
  { type: "number", prop: "cols", label: "Cols", min: 2, max: 12, step: 1 },
  { type: "number", prop: "pieceDuration", label: "Piece duration", min: 0.08, max: 0.8, step: 0.01 },
  { type: "number", prop: "stagger", label: "Stagger", min: 0.005, max: 0.12, step: 0.005 },
  { type: "number", prop: "pieceSize", label: "Tab size", min: 6, max: 24, step: 1 },
  { type: "boolean", prop: "loop", label: "Loop" },
];

const defaultProps = {
  pattern: "random",
  color: "#E1E900",
  rows: 4,
  cols: 5,
  pieceDuration: 0.38,
  stagger: 0.055,
  pieceSize: 14,
  loop: false,
};

export function PuzzleRevealPlayground() {
  return (
    <PlaygroundShell
      componentName="PuzzleReveal"
      controls={controls}
      defaultProps={defaultProps}
      codeNote="children omitted here — put an image, card, text, video, or any React content underneath"
      render={(values) => (
        <div className="flex w-full justify-center">
          <PuzzleReveal
            key={JSON.stringify(values)}
            pattern={values.pattern as "random" | "wave" | "diagonal" | "center"}
            color={values.color as string}
            rows={values.rows as number}
            cols={values.cols as number}
            pieceDuration={values.pieceDuration as number}
            stagger={values.stagger as number}
            pieceSize={values.pieceSize as number}
            loop={values.loop as boolean}
            className="aspect-video w-full max-w-[360px] rounded-2xl"
          >
            <div className="relative h-full w-full overflow-hidden rounded-2xl bg-neutral-950">
              <img
                src="/aurora.gif"
                alt="Aurora"
                className="h-full w-full object-cover opacity-70"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent p-5 text-white">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/60">Puzzle Reveal</p>
                  <p className="mt-1 text-lg font-medium tracking-tight">Reveal anything underneath.</p>
                </div>
              </div>
            </div>
          </PuzzleReveal>
        </div>
      )}
    />
  );
}
