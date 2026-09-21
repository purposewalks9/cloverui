"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { GitHubStars } from "@/components/github-stars";
import { SearchForm } from "@/components/command-menu";
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
    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <h1 className="shrink-0 text-sm font-medium">{title}</h1>
        {description && (
          <>
            <Separator orientation="vertical" className="h-4" />
            <p className="min-w-0 truncate text-sm text-muted-foreground">
              {description}
            </p>
          </>
        )}
      </div>

   
        <div className="[&_button]:h-7 [&_button]:rounded-full [&_button]:border-none [&_button]:bg-transparent [&_button]:px-2.5 [&_button]:shadow-none [&_button]:hover:bg-background">
          <SearchForm docSchema={docSchema} />
        </div>
    </header>
  );
}