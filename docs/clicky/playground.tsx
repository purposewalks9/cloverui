"use client";

import { Clicky, type ClickyColor } from "@/registry/clover-ui/clicky";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { jsx, type ControlDef } from "@/lib/playground";

const colors: { value: ClickyColor; swatch: string }[] = [
  { value: "purple", swatch: "#8b5cf6" },
  { value: "pink", swatch: "#ec4899" },
  { value: "blue", swatch: "#3b82f6" },
  { value: "emerald", swatch: "#10b981" },
  { value: "orange", swatch: "#f97316" },
  { value: "default", swatch: "#52525b" },
];

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "color",
    label: "Color",
    options: colors.map((c) => ({
      label: c.value[0].toUpperCase() + c.value.slice(1),
      value: c.value,
      swatch: c.swatch,
    })),
  },
  { type: "number", prop: "size", label: "Size", min: 24, max: 72, step: 2 },
  { type: "number", prop: "delay", label: "Delay", min: 0, max: 3, step: 0.1 },
  { type: "boolean", prop: "loop", label: "Loop" },
  { type: "number", prop: "interval", label: "Interval", min: 1, max: 6, step: 0.2 },
];

const defaultProps = {
  color: "purple",
  size: 40,
  delay: 0.2,
  loop: true,
  interval: 2.4,
};

export function ClickyPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      code={(values) =>
        jsx(
          "Clicky",
          {
            color: values.color,
            size: values.size,
            delay: values.delay,
            loop: values.loop,
            interval: values.interval,
          },
          '<span className="text-3xl font-semibold tracking-tight">Click here</span>',
        )
      }
      render={(values) => (
        <div className="flex min-h-[240px] items-center justify-center">
          <Clicky
            color={values.color as ClickyColor}
            size={values.size as number}
            delay={values.delay as number}
            loop={values.loop as boolean}
            interval={values.interval as number}
          >
            <span className="text-3xl font-semibold tracking-tight">Click here</span>
          </Clicky>
        </div>
      )}
    />
  );
}
