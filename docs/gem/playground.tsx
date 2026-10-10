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
  { type: "number", prop: "glow", label: "Glow", min: 0, max: 2, step: 0.05 },
  { type: "number", prop: "speed", label: "Speed", min: 0, max: 3, step: 0.1 },
  { type: "boolean", prop: "backdrop", label: "Backdrop" },
  { type: "boolean", prop: "interactive", label: "Drag to spin" },
];

const defaultProps = {
  color: "#ff2d55",
  glow: 1,
  speed: 1,
  backdrop: true,
  interactive: true,
};

export function GemPlayground() {
  return (
    <PlaygroundShell
      componentName="Gem"
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => (
        <div className="flex w-full justify-center py-4">
          <Gem
            color={values.color as string}
            glow={values.glow as number}
            speed={values.speed as number}
            backdrop={values.backdrop as boolean}
            interactive={values.interactive as boolean}
          />
        </div>
      )}
    />
  );
}
