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
    prop: "color",
    label: "Color",
    options: [
      { label: "Theme", value: "", swatch: "var(--foreground)" },
      { label: "Ink", value: "#1c1c1c", swatch: "#1c1c1c" },
      { label: "Blue", value: "#2563eb", swatch: "#2563eb" },
      { label: "Green", value: "#15803d", swatch: "#15803d" },
      { label: "Violet", value: "#6d28d9", swatch: "#6d28d9" },
    ],
  },
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
  {
    type: "text-list",
    prop: "route",
    label: "Route",
    items: [
      { prop: "from", label: "From" },
      { prop: "to", label: "To" },
    ],
  },
  { type: "text", prop: "badge", label: "Badge" },
  { type: "number", prop: "delay", label: "Delay (ms)", min: 0, max: 600, step: 20 },
];

const defaultProps = {
  color: "",
  variant: "solid",
  side: "top",
  label: "Change of airport",
  from: "IST",
  to: "SAW",
  badge: "1d 2h",
  delay: 0,
};

export function RichTooltipPlayground() {
  return (
    <PlaygroundShell
      componentName="RichTooltip"
      controls={controls}
      defaultProps={defaultProps}
      codeNote="wrap the element that should show the tooltip"
      render={(values) => {
        const route = [values.from, values.to].filter(
          (stop): stop is string => typeof stop === "string" && stop.trim().length > 0,
        );
        return (
          <div className="flex min-h-[260px] w-full items-center justify-center">
            <RichTooltip
              label={values.label as string}
              route={route}
              badge={values.badge as string}
              variant={values.variant as RichTooltipVariant}
              side={values.side as RichTooltipSide}
              color={(values.color as string) || undefined}
              delay={values.delay as number}
            >
              <button
                type="button"
                className="bg-muted text-foreground border-border cursor-pointer rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap"
              >
                Hover me
              </button>
            </RichTooltip>
          </div>
        );
      }}
    />
  );
}
