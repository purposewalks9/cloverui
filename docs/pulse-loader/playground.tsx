"use client";

import { PulseLoader } from "@/registry/clover-ui/pulse-loader";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  { type: "color", prop: "color", label: "Color" },
  { type: "number", prop: "rings", label: "Rings", min: 1, max: 6, step: 1 },
  { type: "number", prop: "size", label: "Size", min: 20, max: 120, step: 2 },
  { type: "number", prop: "duration", label: "Duration", min: 0.4, max: 3, step: 0.1 },
  { type: "number", prop: "stagger", label: "Stagger", min: 0.02, max: 0.3, step: 0.01 },
];

const defaultProps = {
  color: "#0B87DA",
  rings: 4,
  size: 60,
  duration: 1.8,
  stagger: 0.15,
};

export function PulseLoaderPlayground() {
  return (
    <PlaygroundShell
      componentName="PulseLoader"
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => (
        <div className="flex w-full justify-center">
          <PulseLoader
            color={values.color as string}
            rings={values.rings as number}
            size={values.size as number}
            duration={values.duration as number}
            stagger={values.stagger as number}
          />
        </div>
      )}
    />
  );
}
