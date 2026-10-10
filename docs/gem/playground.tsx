"use client";

import { Gem, type GemMaterial } from "@/registry/clover-ui/gem";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "color",
    label: "Color",
    options: [
      { label: "Ruby", value: "#ff2d55", swatch: "#ff2d55" },
      { label: "Sapphire", value: "#2f6bff", swatch: "#2f6bff" },
      { label: "Emerald", value: "#14d977", swatch: "#14d977" },
      { label: "Amethyst", value: "#c026ff", swatch: "#c026ff" },
      { label: "Topaz", value: "#ff9f1c", swatch: "#ff9f1c" },
      { label: "Diamond", value: "#e6e8ec", swatch: "#e6e8ec" },
    ],
  },
  { type: "number", prop: "size", label: "Size", min: 60, max: 300, step: 10 },
  {
    type: "select",
    prop: "material",
    label: "Material",
    options: [
      { label: "Glass", value: "glass" },
      { label: "Solid", value: "solid" },
    ],
  },
  { type: "number", prop: "grain", label: "Grain", min: 0, max: 0.1, step: 0.01 },
  { type: "number", prop: "glow", label: "Polish", min: 0, max: 2, step: 0.05 },
  { type: "boolean", prop: "interactive", label: "Drag to rotate" },
  { type: "boolean", prop: "animate", label: "Auto rotate" },
  { type: "number", prop: "speed", label: "Rotation speed", min: 0, max: 2, step: 0.1 },
];

const defaultProps = {
  color: "#e6e8ec",
  size: 180,
  glow: 1,
  material: "glass",
  grain: 0.02,
  interactive: true,
  animate: false,
  speed: 1,
};

export function GemPlayground() {
  return (
    <PlaygroundShell
      componentName="Gem"
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => (
        <div className="flex min-h-[320px] w-full items-center justify-center py-8">
          <Gem
            color={values.color as string}
            size={values.size as number}
            material={values.material as GemMaterial}
            grain={values.grain as number}
            interactive={values.interactive as boolean}
            speed={values.speed as number}
            glow={values.glow as number}
            animate={values.animate as boolean}
          />
        </div>
      )}
    />
  );
}
