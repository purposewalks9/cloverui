import * as React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocItem } from "@/lib/types";
import { DocNavProvider } from "@/components/docs/doc-nav";

interface DocPageProps {
  previous?: DocItem;
  next?: DocItem;
  children: React.ReactNode;
}

const NAV_LINK_CLASS =
  "group border-border hover:bg-muted focus-visible:ring-ring flex min-w-0 flex-1 flex-col gap-1 rounded-none border p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none sm:max-w-64";

function DocPage({ previous, next, children }: DocPageProps) {
  return (
    <div className="min-w-0 flex-1 p-6 sm:px-12 sm:pt-8 sm:pb-12">
      <DocNavProvider previous={previous} next={next}>
        <article className="prose dark:prose-invert max-w-none">{children}</article>
      </DocNavProvider>
      {(previous || next) && (
        <nav
          aria-label="Previous and next pages"
          className="border-border mt-16 flex items-stretch justify-between gap-4 border-t pt-8"
        >
          {previous ? (
            <Link href={previous.href} className={NAV_LINK_CLASS}>
              <span className="text-muted-foreground flex items-center gap-1 text-sm whitespace-nowrap">
                <ChevronLeft className="size-4 shrink-0" />
                Previous
              </span>
              <span className="text-foreground truncate font-medium">{previous.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={next.href} className={cn(NAV_LINK_CLASS, "items-end text-right")}>
              <span className="text-muted-foreground flex items-center gap-1 text-sm whitespace-nowrap">
                Next
                <ChevronRight className="size-4 shrink-0" />
              </span>
              <span className="text-foreground max-w-full truncate font-medium">{next.title}</span>
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}

export { DocPage };
