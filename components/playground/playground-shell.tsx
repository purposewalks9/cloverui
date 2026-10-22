"use client";

import * as React from "react";
import { Copy, RotateCcw, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import type { ControlDef } from "@/lib/playground";
import { ControlPanel } from "@/components/playground/control-panel";

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className="text-muted-foreground hover:text-foreground h-8 shrink-0 cursor-pointer gap-1.5 rounded-none px-2 text-xs font-medium whitespace-nowrap [&_svg]:size-3.5"
    >
      {children}
      <span>{label}</span>
    </Button>
  );
}

interface PlaygroundShellProps {
  controls: ControlDef[];
  defaultProps: Record<string, unknown>;
  stageClassName?: string;
  render: (values: Record<string, unknown>) => React.ReactNode;
  code?: (values: Record<string, unknown>) => string;
}

export function PlaygroundShell({
  controls,
  defaultProps,
  stageClassName,
  render,
  code,
}: PlaygroundShellProps) {
  const [values, setValues] = React.useState(defaultProps);
  const { isCopied, copyToClipboard } = useCopyToClipboard({ resetAfter: 1500 });
  const [replayKey, setReplayKey] = React.useState(0);

  function setValue(prop: string, value: unknown) {
    setValues((prev) => ({ ...prev, [prop]: value }));
  }

  function reset() {
    setValues(defaultProps);
    setReplayKey((k) => k + 1);
  }

  function copySettings() {
    copyToClipboard(code ? code(values) : JSON.stringify(values, null, 2));
  }

  return (
    <div className="not-prose my-6 flex flex-col gap-4">
      <div
        className={cn(
          "border-border relative flex min-h-[22rem] min-w-0 items-center justify-center overflow-hidden rounded-none border p-4 sm:p-8 lg:min-h-[28rem]",
          stageClassName,
        )}
      >
        <div className="text-foreground flex w-full max-w-full items-center justify-center">
          <div key={replayKey} className="flex w-full min-w-0 items-center justify-center">
            {render(values)}
          </div>
        </div>
      </div>

      {controls.length > 0 && (
        <section aria-label="Customize" className="border-border rounded-none border">
          <div className="flex h-12 items-center justify-between gap-2 pr-2 pl-4">
            <h2 className="text-foreground shrink-0 text-sm font-medium whitespace-nowrap">
              Customize
            </h2>
            <div className="flex shrink-0 items-center">
              <ToolbarButton label="Reset" onClick={reset}>
                <RotateCcw />
              </ToolbarButton>
              <ToolbarButton label={isCopied ? "Copied" : "Code"} onClick={copySettings}>
                {isCopied ? <ThumbsUp /> : <Copy />}
              </ToolbarButton>
            </div>
          </div>

          <div className="px-3 pb-3">
            <ControlPanel controls={controls} values={values} onChange={setValue} />
          </div>
        </section>
      )}
    </div>
  );
}
