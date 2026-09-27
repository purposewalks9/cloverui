"use client";

import { PopText } from "@/registry/clover-ui/pop-text";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  { type: "text", prop: "children", label: "Text" },
  { type: "color", prop: "color", label: "Fill color" },
  { type: "color", prop: "outlineColor", label: "Outline color" },
  { type: "number", prop: "outlineWidth", label: "Outline width", min: 0, max: 8, step: 0.5 },
  { type: "boolean", prop: "glow", label: "Glow" },
  { type: "select", prop: "splitBy", label: "Split by", options: [
    { label: "Characters", value: "characters" },
    { label: "Words", value: "words" },
  ] },
  { type: "number", prop: "stagger", label: "Stagger", min: 0, max: 0.2, step: 0.005 },
  { type: "number", prop: "bounce", label: "Bounce", min: 0, max: 1, step: 0.05 },
  { type: "boolean", prop: "hoverPop", label: "Pop on hover" },
];

const defaultProps = {
  children: "so poppy",
  color: "#b8ff8b",
  outlineColor: "",
  outlineWidth: 3,
  glow: true,
  splitBy: "characters",
  stagger: 0.045,
  bounce: 0.55,
  hoverPop: true,
};

export function PopTextPlayground() {
  return (
    <PlaygroundShell
      componentName="PopText"
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => (
        <div className="flex min-h-[280px] w-full items-center justify-center overflow-hidden px-4">
          <PopText
            key={JSON.stringify(values)}
            color={values.color as string}
            outlineColor={(values.outlineColor as string) || undefined}
            outlineWidth={values.outlineWidth as number}
            glow={values.glow as boolean}
            splitBy={values.splitBy as "characters" | "words"}
            stagger={values.stagger as number}
            bounce={values.bounce as number}
            hoverPop={values.hoverPop as boolean}
            className="text-center text-5xl sm:text-7xl"
          >
            {values.children as string}
          </PopText>
        </div>
      )}
    />
  );
}
