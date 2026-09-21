"use client";

import * as React from "react";
import { CheckIcon, Copy, RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { generateCode, type ControlDef } from "@/lib/playground";
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

  return (
    <div className="not-prose my-6 flex overflow-hidden rounded-lg border border-border">
      <div className="flex min-w-0 flex-1 flex-col">
        <div
          className={cn(
            "relative flex min-h-[28rem] flex-1 items-center justify-center overflow-hidden p-6",
            "bg-[radial-gradient(currentColor_1px,transparent_1px)] bg-[size:16px_16px] text-border",
            stageClassName,
          )}
        >
          <div
            key={replayKey}
            className="flex min-w-0 max-w-full items-center justify-center text-foreground"
          >
            {render(values)}
          </div>
        </div>

        <div className="relative border-t border-border">
          <pre className="max-h-72 overflow-auto p-4 font-mono text-sm leading-relaxed">
            <code>{fullCode}</code>
          </pre>

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute right-2.5 top-2.5 size-7 dark:bg-[#191919] dark:hover:bg-[#212121]"
            onClick={copy}
            aria-label="Copy code"
          >
            {copied ? (
              <CheckIcon className="size-3.5 text-emerald-500" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </Button>
        </div>
      </div>

      <div className="w-full shrink-0 border-t border-border bg-muted/20 lg:w-64 lg:border-l lg:border-t-0">
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
          <span className="text-xs font-medium text-muted-foreground">
            Props
          </span>

          <div className="inline-flex -space-x-px rounded-md shadow-none">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={reset}
              className="h-7 rounded-e-none border-r-0 px-2 text-xs font-normal shadow-none"
            >
              <RotateCcw className="size-3" />
              Reset
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={replay}
              className="h-7 rounded-s-none px-2 text-xs font-normal shadow-none"
            >
              <RefreshCw className="size-3" />
              Replay
            </Button>
          </div>
        </div>

        <ControlPanel
          controls={controls}
          values={values}
          onChange={setValue}
        />
      </div>
    </div>
  );
}