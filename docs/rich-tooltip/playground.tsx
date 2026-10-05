"use client";

import {
  RichTooltip,
  type RichTooltipSide,
  type RichTooltipVariant,
} from "@/registry/clover-ui/rich-tooltip";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "variant",
    label: "Variant",
    options: [
      { label: "Solid", value: "solid" },
      { label: "Surface", value: "surface" },
    ],
  },
  {
    type: "select",
    prop: "side",
    label: "Side",
    options: [
      { label: "Top", value: "top" },
      { label: "Bottom", value: "bottom" },
    ],
  },
  { type: "text", prop: "label", label: "Label" },
  { type: "number", prop: "delay", label: "Delay (ms)", min: 0, max: 600, step: 20 },
];

const defaultProps = {
  variant: "solid",
  side: "top",
  label: "Copy link",
  delay: 0,
};

export function RichTooltipPlayground() {
  return (
    <PlaygroundShell
      componentName="RichTooltip"
      controls={controls}
      defaultProps={defaultProps}
      codeNote="wrap the element that should show the tooltip"
      render={(values) => (
        <div className="flex min-h-[260px] w-full items-center justify-center">
          <RichTooltip
            label={values.label as string}
            variant={values.variant as RichTooltipVariant}
            side={values.side as RichTooltipSide}
            delay={values.delay as number}
          >
            <button
              type="button"
              className="bg-muted text-foreground border-border cursor-pointer rounded-md border px-3 py-1.5 text-sm font-medium whitespace-nowrap"
            >
              Hover me
            </button>
          </RichTooltip>
        </div>
      )}
    />
  );
}
