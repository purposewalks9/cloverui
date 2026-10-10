"use client";

import { LogoFlow, type LogoFlowDirection } from "@/registry/clover-ui/logo-flow";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";
import { logoFlowLogos } from "./demo";

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
  { type: "number", prop: "blur", label: "Edge blur", min: 0, max: 10, step: 1 },
  { type: "number", prop: "edgeWidth", label: "Fade width", min: 0, max: 100, step: 4 },
  { type: "boolean", prop: "pauseOnHover", label: "Pause on hover" },
  { type: "boolean", prop: "paused", label: "Paused" },
];

const defaultProps = {
  speed: 28,
  direction: "left",
  iconSize: 18,
  gap: 28,
  blur: 4,
  edgeWidth: 48,
  pauseOnHover: true,
  paused: false,
};

export function LogoFlowPlayground() {
  return (
    <PlaygroundShell
      componentName="LogoFlow"
      controls={controls}
      defaultProps={defaultProps}
      fixedProps={{
        logos: [
          { name: "Your app", src: "/icons/app.svg" },
          { name: "Your plugin", src: "/icons/plugin.svg" },
        ],
      }}
      render={(values) => (
        <div className="flex min-h-[260px] w-full items-center justify-center px-6">
          <LogoFlow
            logos={logoFlowLogos}
            speed={values.speed as number}
            direction={values.direction as LogoFlowDirection}
            iconSize={values.iconSize as number}
            gap={values.gap as number}
            blur={values.blur as number}
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
