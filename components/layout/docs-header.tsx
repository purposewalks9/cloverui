"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { CommandMenu } from "@/components/layout/command-menu";
import type { DocSchema } from "@/lib/types";

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

export function DocsHeader({ docSchema }: { docSchema: DocSchema }) {
  const pathname = usePathname();

  let title = "Components";
  let description: string | undefined;

  if (pathname.startsWith("/docs/")) {
    const item = docSchema.flatMap((group) => group.items).find((doc) => doc.href === pathname);

    title = item?.title ?? titleFromSlug(pathname.split("/").pop() ?? "");
    description = item?.description;
  }

  return (
    <header className="border-border bg-sidebar text-foreground sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b px-4 md:px-12">
      <div className="flex min-w-0 items-center gap-3">
        <MobileMenu docSchema={docSchema} />
        <Separator orientation="vertical" className="h-4 md:hidden" />
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="min-w-0 truncate text-[16px] font-semibold tracking-tight whitespace-nowrap sm:text-[17px] md:shrink-0">
            {title}
          </h1>
          {description && (
            <>
              <Separator orientation="vertical" className="hidden h-4 md:block" />
              <p className="text-foreground/70 hidden min-w-0 flex-[1_1_0] truncate text-[15px] font-medium md:block">
                {description}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <CommandMenu docSchema={docSchema} nav className="hidden w-40 sm:inline-flex" />
        <CommandMenu docSchema={docSchema} nav compact shortcut={false} className="sm:hidden" />

        <div className="mt-1">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
