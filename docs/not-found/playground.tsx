"use client";

import { NotFound } from "@/registry/clover-ui/not-found";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  { type: "text", prop: "description", label: "Description" },
  { type: "text", prop: "actionLabel", label: "Button" },
];

const defaultProps = {
  description:
    "We've searched everywhere, but we couldn't find what you were looking for. Maybe it existed once, but now it's gone.",
  actionLabel: "Back to home",
};

export function NotFoundPlayground() {
  return (
    <PlaygroundShell
      componentName="NotFound"
      controls={controls}
      defaultProps={defaultProps}
      codeNote="hover the button to cheer it up"
      render={(values) => (
        <NotFound
          description={(values.description as string) || undefined}
          actionLabel={(values.actionLabel as string) || undefined}
          onAction={() => {}}
          className="w-full"
        />
      )}
    />
  );
}
