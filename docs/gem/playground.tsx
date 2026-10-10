"use client";

import { Gem } from "@/registry/clover-ui/gem";
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
      { label: "Amethyst", value: "#a855f7", swatch: "#a855f7" },
      { label: "Topaz", value: "#ff9f1c", swatch: "#ff9f1c" },
      { label: "Diamond", value: "#dff4ff", swatch: "#dff4ff" },
    ],
  },
  { type: "number", prop: "size", label: "Size", min: 60, max: 300, step: 10 },
  { type: "number", prop: "glow", label: "Glow", min: 0, max: 2, step: 0.05 },
  { type: "boolean", prop: "animate", label: "Inner shimmer" },
];

const defaultProps = {
  color: "#ff2d55",
  size: 180,
  glow: 1,
  animate: true,
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
            glow={values.glow as number}
            animate={values.animate as boolean}
          />
        </div>
      )}
    />
  );
}
