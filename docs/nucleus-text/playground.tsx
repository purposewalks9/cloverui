"use client";

import { NucleusText } from "@/registry/clover-ui/nucleus-text";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { jsx, type ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  { type: "text", prop: "children", label: "Text" },
  { type: "color", prop: "color", label: "Text color" },
  { type: "color", prop: "particleColor", label: "Particle color" },
  { type: "number", prop: "particleCount", label: "Particles", min: 12, max: 320, step: 8 },
  { type: "number", prop: "particleSize", label: "Particle size", min: 0.5, max: 3, step: 0.1 },
  { type: "number", prop: "gatherSpeed", label: "Gather speed", min: 0.3, max: 2.5, step: 0.1 },
  { type: "number", prop: "shake", label: "Shake", min: 0, max: 3, step: 0.1 },
];

const defaultProps = {
  children: "generates",
  color: "#b8ff8b",
  particleColor: "#b8ff8b",
  particleCount: 90,
  particleSize: 1.35,
  gatherSpeed: 1,
  shake: 1,
};

export function NucleusTextPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      code={(values) =>
        jsx(
          "NucleusText",
          {
            color: values.color,
            particleColor: values.particleColor,
            particleCount: values.particleCount,
            particleSize: values.particleSize,
            gatherSpeed: values.gatherSpeed,
            shake: values.shake,
            className: "text-center text-5xl font-semibold tracking-[-0.055em] sm:text-7xl",
          },
          values.children as string,
        )
      }
      render={(values) => (
        <div className="flex min-h-[280px] w-full items-center justify-center overflow-hidden px-4">
          <NucleusText
            key={JSON.stringify(values)}
            color={values.color as string}
            particleColor={values.particleColor as string}
            particleCount={values.particleCount as number}
            particleSize={values.particleSize as number}
            gatherSpeed={values.gatherSpeed as number}
            shake={values.shake as number}
            className="text-center text-5xl font-semibold tracking-[-0.055em] sm:text-7xl"
          >
            {values.children as string}
          </NucleusText>
        </div>
      )}
    />
  );
}
