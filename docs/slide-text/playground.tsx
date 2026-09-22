"use client";

import { SlideText } from "@/registry/clover-ui/slide-text";
import { PlaygroundShell } from "@/components/playground/playground-shell";
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
  {
    type: "select",
    prop: "direction",
    label: "Direction",
    options: [
      { label: "Left", value: "left" },
      { label: "Right", value: "right" },
    ],
  },
  {
    type: "select",
    prop: "from",
    label: "From",
    options: [
      { label: "First", value: "first" },
      { label: "Last", value: "last" },
      { label: "Center", value: "center" },
    ],
  },
  { type: "color", prop: "color", label: "Color" },
  { type: "number", prop: "stagger", label: "Stagger", min: 0.01, max: 0.12, step: 0.005 },
];

const defaultProps = {
  children: "Clover UI, one word at a time.",
  splitBy: "words",
  direction: "right",
  from: "first",
  color: "#E1E900",
  stagger: 0.065,
};

export function SlideTextPlayground() {
  return (
    <PlaygroundShell
      componentName="SlideText"
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => (
      <div className="flex w-full justify-center">
        <SlideText
          key={JSON.stringify(values)}
          splitBy={values.splitBy as "words" | "characters"}
          direction={values.direction as "left" | "right"}
          from={values.from as "first" | "last" | "center"}
          color={values.color as string}
          stagger={values.stagger as number}
          className="text-center text-2xl font-semibold tracking-tight"
        >
          {values.children as string}
        </SlideText>
        </div>
      )}
    />
  );
}
