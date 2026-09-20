"use client";

import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import { Suspense } from "react";
import RefreshAnticlockwise from "./icons/refresh";
import { OpenInV0Button } from "./open-in-v0-button";
import { usePathname } from "next/navigation";
import { Code2, Monitor } from "lucide-react";
export function DemoCanvas({
  children,
}: {
  children: React.ReactNode;
  className?: string;
  center?: boolean;
}) {
  const [key, setKey] = React.useState(0);

  return (
    <Tabs defaultValue="preview">
      <div className="flex items-end justify-end not-prose">
        <TabsList className="h-9 gap-1 bg-transparent p-0">
          <TabsTrigger
            value="preview"
            className="cursor-pointer rounded-md px-2.5 text-center transition-all data-[state=active]:bg-white data-[state=active]:shadow-[0_0_0_1px_rgba(0,0,0,.08),0px_2px_2px_rgba(0,0,0,.04)] data-[state=active]:dark:bg-[#0B0B09]"
          >
            <Monitor className="h-4 w-4" />
            <span className="sr-only">Preview</span>
          </TabsTrigger>

          <TabsTrigger
            value="code"
            className="cursor-pointer rounded-md px-2.5 text-center transition-all data-[state=active]:bg-white data-[state=active]:shadow-[0_0_0_1px_rgba(0,0,0,.08),0px_2px_2px_rgba(0,0,0,.04)] data-[state=active]:dark:bg-[#0B0B09]"
          >
            <Code2 className="h-4 w-4" />
            <span className="sr-only">Code</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <div key={key}>
        {children}
      </div>
    </Tabs>
  );
}

export function DemoPreview({
  children,
  center,
  className,
}: {
  children: React.ReactNode;
  center?: boolean;
  className?: string;
}) {
  const [key, setKey] = React.useState(0);
  const [isRotating, setIsRotating] = React.useState(false);
  const pathname = usePathname();
  const v0Id = pathname?.split("/docs/")[1] || "";

  const handleRefresh = () => {
    setIsRotating(true);
    setKey((prev) => prev + 1);
    setTimeout(() => setIsRotating(false), 500);
  };

  return (
    <TabsContent value="preview">
      <div
        className={cn(
          "relative flex w-full min-h-64 h-full overflow-hidden border rounded-sm not-prose preview p-10 justify-center items-center md:min-h-80",
          center && "flex items-center justify-center",
          className,
        )}
      >
        <Suspense
          fallback={
            <div className="text-sm text-muted-foreground">Loading…</div>
          }
        >
            <React.Fragment key={key}>{children}</React.Fragment>
        </Suspense>

        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-1 rounded-lg border bg-background/95 p-1 shadow-md backdrop-blur-sm">
          {v0Id && <OpenInV0Button id={v0Id} />}

          <button
            onClick={handleRefresh}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Refresh component"
            aria-label="Refresh component"
          >
            <RefreshAnticlockwise
              className={cn(
                "h-4 w-4 transition-transform duration-500",
                isRotating && "rotate-180",
              )}
            />
          </button>
        </div>
      </div>
    </TabsContent>
  );
}

export function DemoCode({ children }: { children: React.ReactNode }) {
  return (
    <TabsContent value="code" className="[&_pre]:my-0">
      {children}
    </TabsContent>
  );
}
