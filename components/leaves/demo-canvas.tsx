"use client";

import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import { Suspense } from "react";
import RefreshAnticlockwise from "@/components/seed/refresh";
import { OpenInV0Button } from "@/components/leaves/open-in-v0-button";
import { LazyMount } from "@/components/leaves/lazy-mount";
import { usePathname } from "next/navigation";
import { Code2, Monitor } from "lucide-react";
export function DemoCanvas({
  children,
}: {
  children: React.ReactNode;
  className?: string;
  center?: boolean;
}) {
  return (
    <Tabs defaultValue="preview">
      <div className="not-prose flex items-end justify-end">
        <TabsList className="h-9 gap-1 p-0">
          <TabsTrigger
            value="preview"
            className="data-[state=active]:bg-background cursor-pointer rounded-none px-2.5 text-center transition-all"
          >
            <Monitor className="h-4 w-4" />
            <span className="sr-only">Preview</span>
          </TabsTrigger>

          <TabsTrigger
            value="code"
            className="data-[state=active]:bg-background cursor-pointer px-2.5 text-center transition-all"
          >
            <Code2 className="h-4 w-4" />
            <span className="sr-only">Code</span>
          </TabsTrigger>
        </TabsList>
      </div>

      <div>{children}</div>
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
          "not-prose preview relative flex min-h-[28rem] w-full overflow-hidden rounded-none border p-6 md:min-h-[32rem]",
          center ? "items-center justify-center" : "items-stretch justify-start",
          className,
        )}
      >
        <Suspense fallback={null}>
          <LazyMount
            className={cn(
              "text-foreground w-full min-w-0",
              center && "flex items-center justify-center",
            )}
          >
            <div
              key={key}
              className={cn("w-full min-w-0", center && "flex items-center justify-center")}
            >
              {children}
            </div>
          </LazyMount>
        </Suspense>

        <div className="bg-background absolute bottom-3 left-3 z-20 flex items-center gap-1 border p-1 shadow-md">
          {v0Id && <OpenInV0Button id={v0Id} />}

          <button
            onClick={handleRefresh}
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-8 w-8 cursor-pointer items-center justify-center rounded-none transition-colors"
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
