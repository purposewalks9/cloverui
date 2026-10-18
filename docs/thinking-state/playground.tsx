"use client";

import * as React from "react";
import {
  ThinkingState,
  type ThinkingStateKind,
  type ThinkingStatePixel,
  type ThinkingStateStatus,
} from "@/registry/clover-ui/thinking-state";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "color",
    label: "Color",
    options: [
      {
        label: "Loop",
        value: "loop",
        swatch: "conic-gradient(#4ade80, #7dd3fc, #60a5fa, #a78bfa, #f472b6, #fb923c, #4ade80)",
      },
      { label: "Green", value: "#22c55e", swatch: "#22c55e" },
      { label: "Sky", value: "#38bdf8", swatch: "#38bdf8" },
      { label: "Blue", value: "#3b82f6", swatch: "#3b82f6" },
      { label: "Violet", value: "#8b5cf6", swatch: "#8b5cf6" },
      { label: "Pink", value: "#ec4899", swatch: "#ec4899" },
      { label: "Orange", value: "#f97316", swatch: "#f97316" },
      { label: "Red", value: "#ef4444", swatch: "#ef4444" },
    ],
  },
  {
    type: "select",
    prop: "state",
    label: "State",
    options: [
      { label: "Auto", value: "auto" },
      { label: "Thinking", value: "thinking" },
      { label: "Analyzing", value: "analyzing" },
      { label: "Debugging", value: "debugging" },
      { label: "Searching", value: "searching" },
      { label: "Building", value: "building" },
      { label: "Pondering", value: "pondering" },
    ],
  },
  {
    type: "select",
    prop: "status",
    label: "Status",
    options: [
      { label: "Active", value: "active" },
      { label: "Complete", value: "complete" },
      { label: "Error", value: "error" },
    ],
  },
  {
    type: "select",
    prop: "pixel",
    label: "Pixel",
    options: [
      { label: "Square", value: "square" },
      { label: "Circle", value: "circle" },
    ],
  },
  { type: "boolean", prop: "grid", label: "Grid" },
  { type: "number", prop: "speed", label: "Speed", min: 0.25, max: 3, step: 0.25 },
  { type: "boolean", prop: "shimmer", label: "Shimmer" },
];

const defaultProps = {
  color: "",
  state: "thinking",
  status: "active",
  pixel: "square",
  grid: true,
  speed: 1,
  shimmer: true,
};

const CYCLE: ThinkingStateKind[] = [
  "analyzing",
  "searching",
  "building",
  "debugging",
  "pondering",
  "thinking",
];

function CyclingThinkingState({ values }: { values: Record<string, unknown> }) {
  const cycling = values.state === "auto";
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (!cycling) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % CYCLE.length), 2200);
    return () => window.clearInterval(timer);
  }, [cycling]);

  const color = values.color as string;
  return (
    <ThinkingState
      state={cycling ? CYCLE[index] : (values.state as ThinkingStateKind)}
      status={values.status as ThinkingStateStatus}
      color={color || undefined}
      pixel={values.pixel as ThinkingStatePixel}
      grid={values.grid as boolean}
      speed={values.speed as number}
      shimmer={values.shimmer as boolean}
      className="text-lg"
    />
  );
}

export function ThinkingStatePlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => <CyclingThinkingState values={values} />}
    />
  );
}
