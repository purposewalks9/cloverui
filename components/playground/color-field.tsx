"use client";

import * as React from "react";
import { ColorSelector } from "@/components/ui/color-selector";

const PRESETS = [
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#e1e900",
  "#84cc16",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#0b87da",
  "#6366f1",
  "#7c3aed",
  "#ec4899",
  "#f43f5e",
];

export function ColorField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [initial] = React.useState(() => (value ?? "").toLowerCase());
  const colors = PRESETS.includes(initial) ? PRESETS : [initial, ...PRESETS];

  return (
    <ColorSelector
      colors={colors}
      value={(value ?? "").toLowerCase()}
      onColorSelect={onChange}
      className="ml-auto w-max flex-nowrap gap-2 p-1"
    />
  );
}
