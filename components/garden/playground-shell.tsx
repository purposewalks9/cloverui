"use client";

import * as React from "react";
import { Copy, RefreshCw, RotateCcw, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ControlDef } from "@/lib/playground";
import { ControlPanel } from "@/components/garden/control-panel";

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
      size="icon"
      onClick={onClick}
      aria-label={label}
      className="text-muted-foreground hover:text-foreground size-8 cursor-pointer rounded-none [&_svg]:size-4"
    >
      {children}
    </Button>
  );
}

interface PlaygroundShellProps {
  controls: ControlDef[];
  defaultProps: Record<string, unknown>;
  stageClassName?: string;
  render: (values: Record<string, unknown>) => React.ReactNode;
}

export function PlaygroundShell({
  controls,
  defaultProps,
  stageClassName,
  render,
}: PlaygroundShellProps) {
  const [values, setValues] = React.useState(defaultProps);
  const [settingsCopied, setSettingsCopied] = React.useState(false);
  const [replayKey, setReplayKey] = React.useState(0);

  function setValue(prop: string, value: unknown) {
    setValues((prev) => ({ ...prev, [prop]: value }));
  }

  function reset() {
    setValues(defaultProps);
    setReplayKey((k) => k + 1);
  }

  function replay() {
    setReplayKey((k) => k + 1);
  }

  function copySettings() {
    navigator.clipboard.writeText(JSON.stringify(values, null, 2));
    setSettingsCopied(true);
    setTimeout(() => setSettingsCopied(false), 1500);
  }

  return (
    <div className="not-prose border-border my-6 flex flex-col overflow-hidden rounded-none border lg:flex-row">
      <div
        className={cn(
          "relative flex min-h-[22rem] min-w-0 flex-1 items-center justify-center overflow-hidden p-4 sm:p-8 lg:min-h-[28rem]",
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
        <div className="border-border w-full shrink-0 border-t lg:w-72 lg:border-t-0 lg:border-l">
          <div className="border-border flex h-12 items-center justify-between border-b pr-2 pl-4">
            <span className="text-foreground text-sm font-medium">Customize</span>
            <div className="flex items-center gap-0.5">
              <ToolbarButton label="Replay" onClick={replay}>
                <RefreshCw />
              </ToolbarButton>
              <ToolbarButton label="Reset" onClick={reset}>
                <RotateCcw />
              </ToolbarButton>
              <ToolbarButton
                label={settingsCopied ? "Copied" : "Copy settings"}
                onClick={copySettings}
              >
                {settingsCopied ? <ThumbsUp /> : <Copy />}
              </ToolbarButton>
            </div>
          </div>

          <div className="p-3">
            <ControlPanel controls={controls} values={values} onChange={setValue} />
          </div>
        </div>
      )}
    </div>
  );
}
