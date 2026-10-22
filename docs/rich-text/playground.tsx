"use client";

import { RichText } from "@/registry/clover-ui/rich-text";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { jsx, type ControlDef } from "@/lib/playground";

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
  "accent",
] as const;

const swatches: Record<(typeof colors)[number], string> = {
  default: "#d4d4d8",
  blue: "#3b82f6",
  purple: "#a855f7",
  pink: "#ec4899",
  red: "#ef4444",
  orange: "#f97316",
  yellow: "#eab308",
  green: "#22c55e",
  teal: "#14b8a6",
  cyan: "#06b6d4",
  indigo: "#6366f1",
  violet: "#8b5cf6",
  rose: "#f43f5e",
  amber: "#f59e0b",
  lime: "#84cc16",
  sky: "#0ea5e9",
  slate: "#64748b",
  gray: "#6b7280",
  zinc: "#71717a",
  neutral: "#737373",
  stone: "#78716c",
  fuchsia: "#d946ef",
  emerald: "#10b981",
  accent: "#e1e900",
};

const controls: ControlDef[] = [
  { type: "text", prop: "children", label: "Text" },
  {
    type: "select",
    prop: "color",
    label: "Color",
    options: colors.map((color) => ({
      label: color[0].toUpperCase() + color.slice(1),
      value: color,
      swatch: swatches[color],
    })),
  },
];

const defaultProps = {
  children: "rich interfaces",
  color: "blue",
};

export function RichTextPlayground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      code={(values) => jsx("RichText", { color: values.color }, values.children as string)}
      render={(values) => (
        <p className="text-center text-4xl font-semibold tracking-tight">
          <RichText color={values.color as (typeof colors)[number]}>
            {values.children as string}
          </RichText>
        </p>
      )}
    />
  );
}
