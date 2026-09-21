"use client";

import { StatusTag } from "@/registry/clover-ui/status-tag";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  {
    type: "select",
    prop: "status",
    label: "Status",
    options: [
      { label: "Draft", value: "draft" },
      { label: "In progress", value: "in-progress" },
      { label: "In review", value: "in-review" },
      { label: "Completed", value: "completed" },
    ],
  },
  { type: "text", prop: "label", label: "Label override" },
];

const defaultProps = {
  status: "completed",
  label: "",
};

export function StatusTagPlayground() {
  return (
    <PlaygroundShell
      componentName="StatusTag"
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => (
        <StatusTag
          status={values.status as "draft" | "in-progress" | "in-review" | "completed"}
          label={(values.label as string) || undefined}
        />
      )}
    />
  );
}
