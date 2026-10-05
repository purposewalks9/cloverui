"use client";

import { StatusFace, type StatusFaceStatus } from "@/registry/clover-ui/status-face";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "color",
    label: "Color",
    options: [
      {
        label: "Status color",
        value: "",
        swatch: "conic-gradient(#22c55e, #84cc16, #f59e0b, #ef4444, #22c55e)",
      },
      { label: "Violet", value: "#8b5cf6", swatch: "#8b5cf6" },
      { label: "Pink", value: "#ec4899", swatch: "#ec4899" },
      { label: "Yellow", value: "#facc15", swatch: "#facc15" },
      { label: "Gray", value: "#a1a1aa", swatch: "#a1a1aa" },
    ],
  },
  {
    type: "select",
    prop: "status",
    label: "Status",
    options: [
      { label: "Great", value: "great" },
      { label: "Good", value: "good" },
      { label: "OK", value: "ok" },
      { label: "Bad", value: "bad" },
    ],
  },
  { type: "boolean", prop: "blink", label: "Blink" },
];

const defaultProps = {
  color: "",
  status: "great",
  blink: true,
};

export function StatusFacePlayground() {
  return (
    <PlaygroundShell
      componentName="StatusFace"
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => (
        <div className="flex min-h-[240px] w-full items-center justify-center">
          <StatusFace
            status={values.status as StatusFaceStatus}
            color={(values.color as string) || undefined}
            blink={values.blink as boolean}
            className="size-24"
          />
        </div>
      )}
    />
  );
}
