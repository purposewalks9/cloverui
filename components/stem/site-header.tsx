"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/stem/theme-toggle";
import { SearchForm } from "@/components/stem/command-menu";
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

  if (pathname.startsWith("/components/") || pathname.startsWith("/docs/")) {
    const item = docSchema.flatMap((group) => group.items).find((doc) => doc.href === pathname);

    title = item?.title ?? titleFromSlug(pathname.split("/").pop() ?? "");
    description = item?.description;
  }

  return (
    <header className="border-border bg-sidebar text-foreground sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between gap-3 border-b px-4">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <h1 className="min-w-0 truncate text-[15px] font-semibold whitespace-nowrap sm:text-[16px] md:shrink-0">
          {title}
        </h1>
        {description && (
          <>
            <Separator orientation="vertical" className="hidden h-4 md:block" />
            <p className="text-muted-foreground hidden min-w-0 flex-[1_1_0] truncate text-[14px] font-medium md:block">
              {description}
            </p>
          </>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <SearchForm docSchema={docSchema} />

        <ThemeToggle />
      </div>
    </header>
  );
}
