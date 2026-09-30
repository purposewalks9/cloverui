"use client";

import { SpotlightText } from "@/registry/clover-ui/spotlight-text";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const colors = [
  "default",
  "blue",
  "purple",
  "pink",
  "red",
  "orange",
  "yellow",
  "green",
  "teal",
  "cyan",
  "indigo",
  "violet",
  "rose",
  "amber",
  "lime",
  "sky",
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "fuchsia",
  "emerald",
] as const;

const controls: ControlDef[] = [
  {
    type: "text-list",
    prop: "items",
    label: "Spotlight Text",
    items: [
      { prop: "item1", label: "Text 1" },
      { prop: "item2", label: "Text 2" },
      { prop: "item3", label: "Text 3" },
      { prop: "item4", label: "Text 4" },
    ],
  },
  {
    type: "select",
    prop: "color",
    label: "Color",
    options: colors.map((color) => ({
      label: color[0].toUpperCase() + color.slice(1),
      value: color,
    })),
  },
  { type: "number", prop: "interval", label: "Interval", min: 700, max: 5000, step: 100 },
  { type: "number", prop: "duration", label: "Duration", min: 0.1, max: 1, step: 0.05 },
];

const defaultProps = {
  items: ["brands", "interfaces", "experiences", "products"],
  item1: "brands",
  item2: "interfaces",
  item3: "experiences",
  item4: "products",
  color: "blue",
  interval: 2200,
  duration: 0.45,
};

export function SpotlightTextPlayground() {
  return (
    <PlaygroundShell
      componentName="SpotlightText"
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => {
        const items = [values.item1, values.item2, values.item3, values.item4]
          .map((item) => String(item ?? "").trim())
          .filter(Boolean);

        return (
          <p className="text-center text-2xl font-semibold tracking-tight">
            I create{" "}
            <SpotlightText
              key={JSON.stringify(values)}
              items={items}
              color={values.color as (typeof colors)[number]}
              interval={values.interval as number}
              duration={values.duration as number}
            />{" "}
            that feel alive.
          </p>
        );
      }}
    />
  );
}
