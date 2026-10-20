"use client";

import { GrainCube } from "@/registry/clover-ui/grain-cube";
import { GRAIN_CUBE_THEMES, type GrainCubeTheme } from "@/registry/clover-ui/grain-cube";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import { jsx, type ControlDef } from "@/lib/playground";

const themeSwatch = (theme: GrainCubeTheme) =>
  `linear-gradient(135deg, ${GRAIN_CUBE_THEMES[theme].join(", ")})`;

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "theme",
    label: "Theme",
    options: [
      { label: "Green", value: "green", swatch: themeSwatch("green") },
      { label: "Ember", value: "ember", swatch: themeSwatch("ember") },
      { label: "Ice", value: "ice", swatch: themeSwatch("ice") },
      { label: "Violet", value: "violet", swatch: themeSwatch("violet") },
      { label: "Mono", value: "mono", swatch: themeSwatch("mono") },
    ],
  },
  { type: "number", prop: "size", label: "Size", min: 0.2, max: 1, step: 0.05 },
  { type: "number", prop: "scale", label: "Scale", min: 0.3, max: 2.5, step: 0.1 },
  { type: "number", prop: "warp", label: "Warp", min: 0, max: 2, step: 0.1 },
  { type: "number", prop: "grain", label: "Grain", min: 0, max: 1, step: 0.01 },
  { type: "number", prop: "speed", label: "Speed", min: 0, max: 3, step: 0.1 },
  { type: "boolean", prop: "animate", label: "Animate" },
  { type: "boolean", prop: "interactive", label: "Interactive" },
];

const defaultProps = {
  theme: "green",
  size: 0.7,
  scale: 1,
  warp: 1,
  grain: 0.05,
  speed: 1,
  animate: true,
  interactive: true,
};

export function GrainCubePlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      code={(values) =>
        jsx("GrainCube", {
          theme: values.theme,
          size: values.size,
          scale: values.scale,
          warp: values.warp,
          grain: values.grain,
          speed: values.speed,
          animate: values.animate,
          interactive: values.interactive,
        })
      }
      render={(values) => (
        <div className="mx-auto w-full max-w-[280px]">
          <GrainCube
            theme={values.theme as GrainCubeTheme}
            size={values.size as number}
            scale={values.scale as number}
            warp={values.warp as number}
            grain={values.grain as number}
            speed={values.speed as number}
            animate={values.animate as boolean}
            interactive={values.interactive as boolean}
          />
        </div>
      )}
    />
  );
}
