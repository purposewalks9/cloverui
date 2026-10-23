"use client";

import { Butterflies, type ButterfliesSpecies } from "@/registry/clover-ui/butterflies";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { jsx, type ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "species",
    label: "Species",
    options: [
      {
        label: "Mixed",
        value: "mixed",
        swatch: "linear-gradient(90deg, #e8741a, #2f95ff, #ffe684, #3ff0b0, #a855f7)",
      },
      { label: "Monarch", value: "monarch", swatch: "#e8741a" },
      { label: "Morpho", value: "morpho", swatch: "#2f95ff" },
      { label: "Swallowtail", value: "swallowtail", swatch: "#ffe684" },
      { label: "Emerald", value: "emerald", swatch: "#3ff0b0" },
      { label: "Violet", value: "violet", swatch: "#a855f7" },
      {
        label: "Glasswing",
        value: "glasswing",
        swatch: "linear-gradient(135deg, #e9e5df, #3a1f14)",
      },
    ],
  },
  { type: "number", prop: "count", label: "Count", min: 1, max: 30, step: 1 },
  { type: "number", prop: "size", label: "Size", min: 24, max: 140, step: 2 },
  { type: "number", prop: "speed", label: "Speed", min: 0, max: 3, step: 0.1 },
  { type: "boolean", prop: "followCursor", label: "Follow cursor" },
  { type: "boolean", prop: "animate", label: "Animate" },
];

const defaultProps = {
  species: "mixed",
  count: 12,
  size: 56,
  speed: 1,
  followCursor: true,
  animate: true,
};

export function ButterfliesPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      code={(values) =>
        jsx("Butterflies", {
          species: values.species,
          count: values.count,
          size: values.size,
          speed: values.speed,
          followCursor: values.followCursor,
          animate: values.animate,
        })
      }
      render={(values) => (
        <Butterflies
          species={values.species as ButterfliesSpecies}
          count={values.count as number}
          size={values.size as number}
          speed={values.speed as number}
          followCursor={values.followCursor as boolean}
          animate={values.animate as boolean}
        />
      )}
    />
  );
}
