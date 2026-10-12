"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";

import { CookieConsent } from "@/registry/clover-ui/cookie-consent";
import { PlaygroundShell } from "@/components/garden/playground-shell";
import type { ControlDef } from "@/lib/playground";

const controls: ControlDef[] = [
  { type: "text", prop: "title", label: "Title" },
  { type: "text", prop: "acceptLabel", label: "Accept text" },
  { type: "text", prop: "rejectLabel", label: "Reject text" },
  { type: "text", prop: "manageLabel", label: "Manage text" },
  { type: "text", prop: "saveLabel", label: "Save text" },
  { type: "text", prop: "policyLabel", label: "Policy link text" },
];

const defaultProps = {
  title: "We use cookies",
  acceptLabel: "Accept all",
  rejectLabel: "Reject all",
  manageLabel: "Manage",
  saveLabel: "Save choices",
  policyLabel: "Cookie Policy",
};

function Preview({ values }: { values: Record<string, unknown> }) {
  const [open, setOpen] = React.useState(true);
  const [result, setResult] = React.useState<string | null>(null);

  return (
    <div className="flex min-h-[420px] w-full flex-col items-center justify-end gap-4 px-4 py-8">
      {!open && (
        <div className="flex flex-col items-center gap-3 text-center">
          {result && <p className="text-muted-foreground text-sm">{result}</p>}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-foreground bg-muted hover:bg-muted/70 focus-visible:ring-ring inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-4 text-sm font-medium whitespace-nowrap outline-none focus-visible:ring-2"
          >
            <RotateCcw className="size-4" />
            Show again
          </button>
        </div>
      )}
      <CookieConsent
        position="inline"
        storageKey={null}
        delay={0.1}
        open={open}
        onOpenChange={setOpen}
        onConsent={(preferences) =>
          setResult(
            `Allowed: ${
              Object.entries(preferences)
                .filter(([, allowed]) => allowed)
                .map(([id]) => id)
                .join(", ") || "none"
            }`,
          )
        }
        title={(values.title as string) || undefined}
        acceptLabel={(values.acceptLabel as string) || undefined}
        rejectLabel={(values.rejectLabel as string) || undefined}
        manageLabel={(values.manageLabel as string) || undefined}
        saveLabel={(values.saveLabel as string) || undefined}
        policyLabel={(values.policyLabel as string) || undefined}
      />
    </div>
  );
}

export function CookieConsentPlayground() {
  return (
    <PlaygroundShell
      componentName="CookieConsent"
      controls={controls}
      defaultProps={defaultProps}
      render={(values) => <Preview values={values} />}
    />
  );
}
