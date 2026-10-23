"use client";

import { ThermalFlow } from "@/registry/clover-ui/thermal-flow";
import { THERMAL_FLOW_THEMES, type ThermalFlowTheme } from "@/registry/clover-ui/thermal-flow";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { jsx, type ControlDef } from "@/lib/playground";

const themeSwatch = (theme: ThermalFlowTheme) =>
  `linear-gradient(135deg, ${THERMAL_FLOW_THEMES[theme].join(", ")})`;

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "theme",
    label: "Theme",
    options: [
      { label: "Thermal", value: "thermal", swatch: themeSwatch("thermal") },
      { label: "Aurora", value: "aurora", swatch: themeSwatch("aurora") },
      { label: "Sunset", value: "sunset", swatch: themeSwatch("sunset") },
      { label: "Ocean", value: "ocean", swatch: themeSwatch("ocean") },
      { label: "Candy", value: "candy", swatch: themeSwatch("candy") },
      { label: "Mono", value: "mono", swatch: themeSwatch("mono") },
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
      controls={controls}
      defaultProps={defaultProps}

      code={(values) =>
        jsx("ThermalFlow", {
          theme: values.theme,
          bands: values.bands,
          scale: values.scale,
          warp: values.warp,
          softness: values.softness,
          grain: values.grain,
          speed: values.speed,
          resolution: values.resolution,
          animate: values.animate,
        })
      }
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
