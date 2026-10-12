"use client";

import { StackMarquee, type StackMarqueeDirection } from "@/registry/clover-ui/stack-marquee";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";
import { stackMarqueeLogos } from "./demo";

const controls: ControlDef[] = [
  { type: "number", prop: "speed", label: "Speed", min: 0, max: 80, step: 2 },
  {
    type: "select",
    prop: "direction",
    label: "Direction",
    options: [
      { label: "Left", value: "left" },
      { label: "Right", value: "right" },
    ],
  },
  { type: "number", prop: "iconSize", label: "Icon size", min: 12, max: 40, step: 2 },
  { type: "number", prop: "gap", label: "Spacing", min: 8, max: 56, step: 2 },
  { type: "number", prop: "edgeWidth", label: "Fade width", min: 0, max: 100, step: 4 },
  { type: "boolean", prop: "pauseOnHover", label: "Pause on hover" },
  { type: "boolean", prop: "paused", label: "Paused" },
];

const defaultProps = {
  speed: 28,
  direction: "left",
  iconSize: 18,
  gap: 28,
  edgeWidth: 48,
  pauseOnHover: true,
  paused: false,
};

export function StackMarqueePlayground() {
  return (
    <PlaygroundShell
      componentName="StackMarquee"
      controls={controls}
      defaultProps={defaultProps}
      fixedProps={{
        logos: [
          { name: "Claude", src: "/icons/claude.svg" },
          { name: "Your agent", src: "/icons/agent.svg" },
        ],
      }}
      render={(values) => (
        <div className="flex min-h-[260px] w-full items-center justify-center px-6">
          <StackMarquee
            logos={stackMarqueeLogos}
            speed={values.speed as number}
            direction={values.direction as StackMarqueeDirection}
            iconSize={values.iconSize as number}
            gap={values.gap as number}
            edgeWidth={values.edgeWidth as number}
            pauseOnHover={values.pauseOnHover as boolean}
            paused={values.paused as boolean}
            className="max-w-lg"
          />
        </div>
      )}
    />
  );
}
