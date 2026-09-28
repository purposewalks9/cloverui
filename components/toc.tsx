"use client";

import * as React from "react";

import { trackEvent } from "@/lib/events";
import { cn } from "@/lib/utils";
import { ArrowUp, SquarePen } from "lucide-react";
import { Separator } from "./ui/separator";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { DocCopySection } from "./doc-copy-section";

const ACTIVE_OFFSET = 112;

function useActiveItem(itemIds: string[]) {
  const [activeId, setActiveId] = React.useState<string | null>(itemIds[0] ?? null);

  React.useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (nearBottom) {
        setActiveId(itemIds[itemIds.length - 1] ?? null);
        return;
      }
      let current = itemIds[0] ?? null;
      for (const id of itemIds) {
        const element = document.getElementById(id);
        if (!element) continue;
        if (element.getBoundingClientRect().top - ACTIVE_OFFSET <= 0) current = id;
        else break;
      }
      setActiveId(current);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [itemIds]);

  return activeId;
}

export function DocsTableOfContents({
  toc,
  className,
  docId,
  content,
  url,
  boldActive = true,
}: {
  toc: {
    title?: React.ReactNode;
    url: string;
    depth: number;
  }[];
  className?: string;
  docId?: string;
  content: string;
  url: string;
  boldActive?: boolean;
}) {
  const itemIds = React.useMemo(
    () => toc.map((item) => item.url.replace("#", "")),
    [toc],
  );
  const activeHeading = useActiveItem(itemIds);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!toc?.length) {
    return null;
  }

  return (
    <div className="relative rounded-md pt-6 sm:pt-12">
      <div
        className={cn(
          "relative flex flex-col gap-2 px-4 pt-4 pb-4 text-sm",
          className,
        )}
      >
        <nav aria-label="On this page">
          <p className="mb-3 text-xs font-medium text-muted-foreground">On this page</p>
          <ul className="flex flex-col border-l border-border">
            {toc.map((item) => {
              const isActive = item.url === `#${activeHeading}`;
              return (
                <li key={item.url}>
                  <a
                    href={item.url}
                    onClick={(event) => {
                      const target = document.getElementById(item.url.replace("#", ""));
                      if (!target) return;
                      event.preventDefault();
                      target.scrollIntoView({ behavior: "smooth", block: "start" });
                      history.replaceState(null, "", item.url);
                    }}
                    data-active={isActive}
                    data-depth={item.depth}
                    aria-current={isActive ? "location" : undefined}
                    className={cn(
                      "relative -ml-px block border-l-2 border-transparent py-1.5 pl-4 text-[0.9rem] leading-snug text-muted-foreground no-underline transition-colors duration-150 hover:text-foreground",
                      "data-[active=true]:border-primary data-[active=true]:text-foreground",
                      "data-[depth=3]:pl-8 data-[depth=3]:before:absolute data-[depth=3]:before:inset-y-0 data-[depth=3]:before:left-4 data-[depth=3]:before:w-px data-[depth=3]:before:bg-border data-[depth=4]:pl-12",
                      boldActive && "data-[active=true]:font-medium",
                    )}
                  >
                    {item.title}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <Separator orientation="horizontal" className="my-2" />
        <DocCopySection content={content} url={url} />

        <Separator orientation="horizontal" className="my-2" />
        <div className="flex flex-col gap-2">
          {docId && (
            <Link
              href={`${siteConfig.links.github}/edit/main/docs/${docId}/doc.mdx`}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground text-muted-foreground [&_svg]:size-3 flex gap-1.5 items-center"
              onClick={() => trackEvent("click_edit_page", { doc: docId })}
            >
              <SquarePen />
              Edit this page
            </Link>
          )}

          <button
            type="button"
            onClick={scrollToTop}
            className="transition-colors hover:text-foreground text-muted-foreground [&_svg]:size-3 flex gap-1.5 items-center cursor-pointer"
          >
            <ArrowUp />
            Back to top
          </button>
        </div>
      </div>
    </div>
  );
}