"use client";

import * as React from "react";
import { CheckIcon, Copy, RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { generateCode, type ControlDef } from "@/lib/playground";
import { LazyMount } from "@/components/lazy-mount";
import { ControlPanel } from "./control-panel";

interface PlaygroundShellProps {
  componentName: string;
  controls: ControlDef[];
  defaultProps: Record<string, unknown>;
  codeNote?: string;
  stageClassName?: string;
  render: (values: Record<string, unknown>) => React.ReactNode;
}

export function PlaygroundShell({
  componentName,
  controls,
  defaultProps,
  codeNote,
  stageClassName,
  render,
}: PlaygroundShellProps) {
  const [values, setValues] = React.useState(defaultProps);
  const [copied, setCopied] = React.useState(false);
  const [settingsCopied, setSettingsCopied] = React.useState(false);
  const [replayKey, setReplayKey] = React.useState(0);

  const code = React.useMemo(
    () => generateCode(componentName, controls, values),
    [componentName, controls, values],
  );

  const fullCode = codeNote ? `// ${codeNote}\n${code}` : code;

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

  function copy() {
    navigator.clipboard.writeText(fullCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function copySettings() {
    navigator.clipboard.writeText(JSON.stringify(values, null, 2));
    setSettingsCopied(true);
    setTimeout(() => setSettingsCopied(false), 1500);
  }

  return (
    <div className="not-prose my-6 flex flex-col overflow-hidden rounded-lg border border-border lg:flex-row">
      {}
      <div
        className={cn(
          "relative flex min-h-[22rem] min-w-0 flex-1 items-center justify-center overflow-hidden p-4 sm:p-8 lg:min-h-[28rem]",
          stageClassName,
        )}
      >
        <LazyMount className="flex w-full max-w-full items-center justify-center text-foreground">
          <div
            key={replayKey}
            className="flex w-full min-w-0 items-center justify-center"
          >
            {render(values)}
          </div>
        </LazyMount>
      </div>

      <div className="w-full shrink-0 border-t border-border p-3 lg:w-72 lg:border-t-0 lg:border-l">
        <div className="overflow-hidden">
          <div className="flex items-center justify-between gap-2  px-3.5 py-2.5">

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={reset}
                 className="h-8 w-full gap-1.5 text-sm font-normal shadow-none"
              >
                Reset
              </Button>
            </div>
          </div>

          <ControlPanel controls={controls} values={values} onChange={setValue} />

          <div className=" p-2.5 flex flex-row justify-between">
           <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={replay}
                aria-label="Replay"
               className="h-8 w-[40%] gap-1.5 text-sm font-normal shadow-none"
              >
               Replay
              </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copySettings}
              className="h-8 w-[40%] gap-1.5 text-sm font-normal shadow-none"
            >
              {settingsCopied ? (
                "copied"
              ) : (
                <Copy className="size-3.5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
