"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { GitHubStars } from "@/components/github-stars";
import { ThemeToggle } from "@/components/theme-toggle";
import { ColorSelector } from "@/components/playground/color-selector";
import { SearchForm } from "@/components/command-menu";
import { Toc } from "@/components/toc";
import type { DocSchema } from "@/lib/types";

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

export function SiteHeader({ docSchema }: { docSchema: DocSchema }) {
  const pathname = usePathname();

  let title = "Components";
  let description: string | undefined;

  if (pathname.startsWith("/components/")) {
    const slug = pathname.split("/").pop() ?? "";
    const item = docSchema
      .flatMap((group) => group.items)
      .find((doc) => doc.id === slug);

    title = item?.title ?? titleFromSlug(slug);
    description = item?.description;
  } else if (pathname.startsWith("/mcp")) {
    title = "MCP";
  }

  return (
    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-4 text-foreground">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <h1 className="shrink-0 text-[16px] font-semibold">{title}</h1>
        {description && (
          <>
            <Separator orientation="vertical" className="h-4" />
            <p className="min-w-0 truncate text-[14px] font-medium text-muted-foreground">
              {description}
            </p>
          </>
        )}
      </div>


        <div className="flex items-center gap-1.5">
        <div className="[&_button]:h-8 [&_button]:rounded-md [&_button]:border-input [&_button]:bg-background [&_button]:px-2.5 [&_button]:shadow-none [&_button]:hover:bg-accent">
          <SearchForm docSchema={docSchema} />
        </div>
        <ColorSelector />
        <ThemeToggle />
      </div>
    </header>
  );
}
