"use client";

import * as React from "react";
import { ColorSelector } from "@/components/ui/color-selector";

const PRESETS = [
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#e1e900",
  "#22c55e",
  "#0b87da",
  "#7c3aed",
  "#ec4899",
];

export function ColorField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [initial] = React.useState(() => (value ?? "").toLowerCase());
  const colors = PRESETS.includes(initial) ? PRESETS : [initial, ...PRESETS.slice(0, 7)];

  return (
    <ColorSelector
      colors={colors}
      value={(value ?? "").toLowerCase()}
      onColorSelect={onChange}
      className="flex-wrap p-0.5"
    />
  );
}
