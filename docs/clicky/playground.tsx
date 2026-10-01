"use client";

import { Clicky, type ClickyColor, type ClickyFrom } from "@/registry/clover-ui/clicky";
import { SoftButton } from "@/registry/clover-ui/soft-button";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

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
  {
    type: "select",
    prop: "from",
    label: "From",
    options: [
      { label: "Right", value: "right" },
      { label: "Left", value: "left" },
      { label: "Top", value: "top" },
      { label: "Bottom", value: "bottom" },
    ],
  },
  { type: "number", prop: "size", label: "Size", min: 24, max: 72, step: 2 },
  { type: "number", prop: "delay", label: "Delay", min: 0, max: 3, step: 0.1 },
  { type: "boolean", prop: "trail", label: "Trail" },
  { type: "boolean", prop: "loop", label: "Loop" },
  { type: "number", prop: "interval", label: "Interval", min: 1, max: 6, step: 0.2 },
];

const defaultProps = {
  color: "purple",
  from: "right",
  size: 40,
  delay: 0.4,
  trail: true,
  loop: true,
  interval: 2.8,
};

export function ClickyPlayground() {
  return (
    <PlaygroundShell
      componentName="Clicky"
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => (
        <div className="flex min-h-[240px] items-center justify-center">
          <Clicky
            color={values.color as ClickyColor}
            from={values.from as ClickyFrom}
            size={values.size as number}
            delay={values.delay as number}
            trail={values.trail as boolean}
            loop={values.loop as boolean}
            interval={values.interval as number}
          >
            <SoftButton color="purple">Get started</SoftButton>
          </Clicky>
        </div>
      )}
    />
  );
}
