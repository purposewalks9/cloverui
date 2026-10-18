"use client";

import { DropText } from "@/registry/clover-ui/drop-text";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  { type: "text", prop: "children", label: "Text" },
  {
    type: "select",
    prop: "splitBy",
    label: "Split by",
    options: [
      { label: "Words", value: "words" },
      { label: "Characters", value: "characters" },
    ],
  },
  { type: "number", prop: "speed", label: "Speed", min: 0.5, max: 3, step: 0.1 },
  { type: "number", prop: "stagger", label: "Stagger", min: 0.01, max: 0.15, step: 0.005 },
  { type: "number", prop: "bounce", label: "Bounce", min: 0, max: 0.8, step: 0.05 },
  { type: "number", prop: "dropDistance", label: "Drop distance", min: 10, max: 100, step: 2 },
];

const defaultProps = {
  children: "Dropping into place.",
  splitBy: "words",
  speed: 1,
  stagger: 0.065,
  bounce: 0.35,
  dropDistance: 40,
};

export function DropTextPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => (
        <div className="flex w-full justify-center">
          <DropText
            key={JSON.stringify(values)}
            splitBy={values.splitBy as "words" | "characters"}
            speed={values.speed as number}
            stagger={values.stagger as number}
            bounce={values.bounce as number}
            dropDistance={values.dropDistance as number}
            className="text-center text-3xl font-semibold tracking-tight"
          >
            {values.children as string}
          </DropText>
        </div>
      )}
    />
  );
}
