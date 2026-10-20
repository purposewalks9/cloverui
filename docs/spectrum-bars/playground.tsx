"use client";

import {
  SpectrumBars,
  SPECTRUM_BARS_THEMES,
  type SpectrumBarsTheme,
} from "@/registry/clover-ui/spectrum-bars";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import { jsx, type ControlDef } from "@/lib/playground";

const themeSwatch = (theme: SpectrumBarsTheme) =>
  `linear-gradient(90deg, ${SPECTRUM_BARS_THEMES[theme].join(", ")})`;

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "theme",
    label: "Theme",
    options: [
      { label: "Signal", value: "signal", swatch: themeSwatch("signal") },
      { label: "Neon", value: "neon", swatch: themeSwatch("neon") },
      { label: "Sunset", value: "sunset", swatch: themeSwatch("sunset") },
      { label: "Mono", value: "mono", swatch: themeSwatch("mono") },
    ],
  },
  { type: "number", prop: "bandWidth", label: "Band width", min: 0.1, max: 1, step: 0.02 },
  { type: "number", prop: "bandHeight", label: "Band height", min: 0.1, max: 1, step: 0.02 },
  { type: "number", prop: "columns", label: "Columns", min: 4, max: 160, step: 4 },
  { type: "number", prop: "glow", label: "Glow", min: 0, max: 2, step: 0.1 },
  { type: "number", prop: "glitch", label: "Glitch", min: 0, max: 2, step: 0.1 },
  { type: "number", prop: "speed", label: "Speed", min: 0, max: 10, step: 0.1 },
  { type: "boolean", prop: "animate", label: "Animate" },
];

const defaultProps = {
  theme: "signal",
  bandWidth: 1,
  bandHeight: 1,
  columns: 56,
  glow: 0.6,
  glitch: 0.5,
  speed: 1,
  animate: true,
};

export function SpectrumBarsPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      code={(values) =>
        jsx("SpectrumBars", {
          theme: values.theme,
          bandWidth: values.bandWidth,
          bandHeight: values.bandHeight,
          columns: values.columns,
          glow: values.glow,
          glitch: values.glitch,
          speed: values.speed,
          animate: values.animate,
        })
      }
      render={(values) => (
        <SpectrumBars
          theme={values.theme as SpectrumBarsTheme}
          bandWidth={values.bandWidth as number}
          bandHeight={values.bandHeight as number}
          columns={values.columns as number}
          glow={values.glow as number}
          glitch={values.glitch as number}
          speed={values.speed as number}
          animate={values.animate as boolean}
          backgroundColor="var(--sidebar)"
        />
      )}
    />
  );
}
