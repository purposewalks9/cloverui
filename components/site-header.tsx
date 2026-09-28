"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { GitHubStars } from "@/components/github-stars";
import { ThemeToggle } from "@/components/theme-toggle";
import { ColorSelector } from "@/components/playground/color-selector";
import { SearchForm } from "@/components/command-menu";
import type { DocSchema } from "@/lib/types";
import { Github, MessageCircle } from "lucide-react";

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
        <SidebarTrigger className="-ml-1 transition-colors duration-200" />
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
        <a
          href="https://x.com/cloverui"
          target="_blank"
          rel="noopener noreferrer"
          title="Follow on X"
          className="inline-flex size-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground outline-none hover:bg-accent hover:text-foreground transition-colors"
        >
          <svg
            className="size-4"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.6l-5.1-6.72-5.852 6.72H2.42l7.75-8.835L.316 2.25h6.78l4.607 6.086L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
          </svg>
          <span className="sr-only">X</span>
        </a>
        <a
          href="https://discord.gg/cloverui"
          target="_blank"
          rel="noopener noreferrer"
          title="Join Discord"
          className="inline-flex size-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground outline-none hover:bg-accent hover:text-foreground transition-colors"
        >
          <MessageCircle className="size-4" />
          <span className="sr-only">Discord</span>
        </a>
        <ThemeToggle />
      </div>
    </header>
  );
}
