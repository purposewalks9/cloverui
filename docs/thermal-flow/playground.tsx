"use client";

import { ThermalFlow } from "@/registry/clover-ui/thermal-flow";
import type { ThermalFlowTheme } from "@/registry/clover-ui/thermal-flow";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "theme",
    label: "Theme",
    options: [
      { label: "Thermal", value: "thermal" },
      { label: "Aurora", value: "aurora" },
      { label: "Sunset", value: "sunset" },
      { label: "Ocean", value: "ocean" },
      { label: "Ember", value: "ember" },
      { label: "Candy", value: "candy" },
      { label: "Mono", value: "mono" },
    ],
  },
  { type: "number", prop: "bands", label: "Bands", min: 0.5, max: 3, step: 0.1 },
  { type: "number", prop: "scale", label: "Scale", min: 0.5, max: 3, step: 0.1 },
  { type: "number", prop: "warp", label: "Warp", min: 0, max: 2, step: 0.1 },
  { type: "number", prop: "softness", label: "Softness", min: 0, max: 0.2, step: 0.005 },
  { type: "number", prop: "grain", label: "Grain", min: 0, max: 1, step: 0.05 },
  { type: "number", prop: "speed", label: "Speed", min: 0, max: 5, step: 0.1 },
  { type: "number", prop: "resolution", label: "Resolution", min: 0.25, max: 1, step: 0.05 },
  { type: "boolean", prop: "animate", label: "Animate" },
];

const defaultProps = {
  theme: "thermal",
  bands: 1,
  scale: 1,
  warp: 1,
  softness: 0.005,
  grain: 0.35,
  speed: 1,
  resolution: 0.75,
  animate: true,
};

export function ThermalFlowPlayground() {
  return (
    <PlaygroundShell
      componentName="ThermalFlow"
      controls={controls}
      defaultProps={defaultProps}
      codeNote="fills its relative parent. Pass colors={[...]} for a custom palette"

      render={(values) => (
        <ThermalFlow
          theme={values.theme as ThermalFlowTheme}
          bands={values.bands as number}
          scale={values.scale as number}
          warp={values.warp as number}
          softness={values.softness as number}
          grain={values.grain as number}
          speed={values.speed as number}
          resolution={values.resolution as number}
          animate={values.animate as boolean}
        />
      )}
    />
  );
}
