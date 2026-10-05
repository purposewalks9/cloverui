"use client";

import { StatusFace, type StatusFaceStatus } from "@/registry/clover-ui/status-face";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "status",
    label: "Status",
    options: [
      { label: "Great", value: "great" },
      { label: "OK", value: "ok" },
      { label: "Attention", value: "attention" },
    ],
  },
  { type: "text", prop: "title", label: "Title" },
  { type: "text", prop: "description", label: "Description" },
  { type: "boolean", prop: "blink", label: "Blink" },
];

const defaultProps = {
  status: "great",
  title: "",
  description: "",
  blink: true,
};

export function StatusFacePlayground() {
  return (
    <PlaygroundShell
      componentName="StatusFace"
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => (
        <div className="flex min-h-[220px] w-full items-center justify-center px-4">
          <StatusFace
            status={values.status as StatusFaceStatus}
            title={(values.title as string) || undefined}
            description={(values.description as string) || undefined}
            blink={values.blink as boolean}
            className="w-full max-w-sm"
          />
        </div>
      )}
    />
  );
}
