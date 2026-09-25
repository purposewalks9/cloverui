"use client";

import { GrainCube } from "@/registry/clover-ui/grain-cube";
import type { GrainCubeTheme } from "@/registry/clover-ui/grain-cube";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "theme",
    label: "Theme",
    options: [
      { label: "Green", value: "green" },
      { label: "Ember", value: "ember" },
      { label: "Ice", value: "ice" },
      { label: "Violet", value: "violet" },
      { label: "Mono", value: "mono" },
    ],
  },
  { type: "number", prop: "size", label: "Size", min: 0.2, max: 1, step: 0.05 },
  { type: "number", prop: "scale", label: "Scale", min: 0.3, max: 2.5, step: 0.1 },
  { type: "number", prop: "warp", label: "Warp", min: 0, max: 2, step: 0.1 },
  { type: "number", prop: "grain", label: "Grain", min: 0, max: 1, step: 0.05 },
  { type: "number", prop: "speed", label: "Speed", min: 0, max: 3, step: 0.1 },
  { type: "boolean", prop: "animate", label: "Animate" },
  { type: "boolean", prop: "interactive", label: "Interactive" },
];

const defaultProps = {
  theme: "green",
  size: 0.7,
  scale: 1,
  warp: 1,
  grain: 0.6,
  speed: 1,
  animate: true,
  interactive: true,
};

export function GrainCubePlayground() {
  return (
    <PlaygroundShell
      componentName="GrainCube"
      controls={controls}
      defaultProps={defaultProps}
      codeNote="drag to spin, it settles back to the resting angle. pass colors={[...]} for a custom palette"
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
