"use client";

import { Spinner } from "@/registry/clover-ui/spinner";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  { type: "color", prop: "color", label: "Color" },
  { type: "color", prop: "trackColor", label: "Track color" },
  { type: "number", prop: "dots", label: "Dots", min: 4, max: 20, step: 1 },
  { type: "number", prop: "size", label: "Size", min: 24, max: 120, step: 2 },
  { type: "number", prop: "duration", label: "Duration", min: 0.4, max: 3, step: 0.1 },
  { type: "number", prop: "tailLength", label: "Tail length", min: 0.1, max: 1, step: 0.05 },
  { type: "boolean", prop: "interactive", label: "Click to pause" },
];

const defaultProps = {
  color: "#0B87DA",
  trackColor: "rgba(11, 135, 218, 0.15)",
  dots: 12,
  size: 24,
  duration: 1.2,
  tailLength: 0.4,
  interactive: true,
};

export function SpinnerPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => (
        <div className="flex w-full justify-center">
          <Spinner
            color={values.color as string}
            trackColor={values.trackColor as string}
            dots={values.dots as number}
            size={values.size as number}
            duration={values.duration as number}
            tailLength={values.tailLength as number}
            interactive={values.interactive as boolean}
          />
        </div>
      )}
    />
  );
}
