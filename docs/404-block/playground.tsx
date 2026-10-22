"use client";

import { Block404 } from "@/registry/clover-ui/404-block";
import { PlaygroundShell } from "@/components/playground/playground-shell";
import { expr, jsx, type ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  { type: "text", prop: "title", label: "Error text" },
  { type: "text", prop: "actionLabel", label: "Button text" },
];

const defaultProps = {
  title: "Error",
  actionLabel: "Back to home",
};

export function Block404Playground() {
  return (
    <PlaygroundShell
      controls={controls}
      defaultProps={defaultProps}
      code={(values) =>
        jsx("Block404", {
          title: values.title,
          actionLabel: values.actionLabel,
          onAction: expr('() => router.push("/")'),
        })
      }
      render={(values) => (
        <Block404
          title={(values.title as string) || undefined}
          actionLabel={(values.actionLabel as string) || undefined}
          onAction={() => {}}
          className="w-full"
        />
      )}
    />
  );
}
