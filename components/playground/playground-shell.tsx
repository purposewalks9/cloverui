"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowCounterClockwise, CaretLeft, CaretRight, Check, Copy } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import type { ControlDef } from "@/lib/playground";
import { ControlPanel } from "@/components/playground/control-panel";
import { useDocNav } from "@/components/docs/doc-nav";

const NAV_LINK_CLASS =
  "border-border bg-background text-muted-foreground hover:text-foreground focus-visible:ring-ring flex h-8 min-w-0 items-center gap-1.5 rounded-none border px-2.5 text-xs font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2";

function ToolbarButton({
  label,
  primary = false,
  onClick,
  children,
}: {
  label: string;
  primary?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      className={cn(
        "h-8 shrink-0 cursor-pointer gap-1.5 rounded-none border px-3 text-xs font-medium whitespace-nowrap [&_svg]:size-4",
        primary
          ? "border-foreground bg-foreground text-background hover:bg-foreground/85 hover:text-background"
          : "border-foreground/20 bg-background text-foreground hover:bg-background hover:border-foreground/40",
      )}
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
  render: (
    values: Record<string, unknown>,
    setValue: (prop: string, value: unknown) => void,
  ) => React.ReactNode;
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
  const { previous, next } = useDocNav();

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
    <div data-plain-stroke className="not-prose my-6 flex flex-col gap-4">
      <div
        className={cn(
          "border-foreground/15 relative flex min-h-[22rem] min-w-0 items-center justify-center overflow-hidden rounded-none border p-4 sm:p-8 lg:min-h-[28rem]",
          stageClassName,
        )}
      >
        <div className="text-foreground flex w-full max-w-full items-center justify-center">
          <div key={replayKey} className="flex w-full min-w-0 items-center justify-center">
            {render(values, setValue)}
          </div>
        </div>
      </div>

      {controls.length > 0 && (
        <section
          aria-label="Customize"
          className="border-foreground/15 bg-muted rounded-none border"
        >
          <div className="flex h-12 items-center justify-between gap-2 pr-3 pl-4">
            <h2 className="text-foreground shrink-0 text-sm font-medium whitespace-nowrap">
              Customize
            </h2>
            <div className="flex shrink-0 items-center gap-2">
              <ToolbarButton label="Reset" onClick={reset}>
                <ArrowCounterClockwise weight="fill" />
              </ToolbarButton>
              <ToolbarButton label={isCopied ? "Copied" : "Code"} primary onClick={copySettings}>
                {isCopied ? <Check weight="fill" /> : <Copy weight="fill" />}
              </ToolbarButton>
            </div>
          </div>

          <div className="px-3 pb-3">
            <ControlPanel controls={controls} values={values} onChange={setValue} />
          </div>

          {(previous || next) && (
            <nav
              aria-label="Previous and next components"
              className="flex items-center justify-between gap-2 px-3 pb-3"
            >
              {previous ? (
                <Link href={previous.href} className={NAV_LINK_CLASS}>
                  <CaretLeft weight="fill" className="size-3.5 shrink-0" />
                  <span className="truncate">{previous.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link href={next.href} className={NAV_LINK_CLASS}>
                  <span className="truncate">{next.title}</span>
                  <CaretRight weight="fill" className="size-3.5 shrink-0" />
                </Link>
              )}
            </nav>
          )}
        </section>
      )}
    </div>
  );
}
