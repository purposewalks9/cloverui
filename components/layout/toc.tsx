"use client";

import { OpenAILogo } from "@/components/icons/openai-logo";

import * as React from "react";
import Link from "next/link";
import { ArrowUp, Copy, SquarePen, ThumbsUp } from "lucide-react";
import { SiClaude, SiV0, SiX } from "@icons-pack/react-simple-icons";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { trackEvent } from "@/lib/events";
import { siteConfig } from "@/lib/config";
import type { TocItem } from "@/lib/toc";
import { cn } from "@/lib/utils";
import { useGhost } from "@/registry/clover-ui/ghost";
import { ghostWords, sectionWord } from "@/components/layout/site-ghost";
import { GhostToggle } from "@/components/layout/ghost-toggle";

const ACTIVE_OFFSET = 112;
const ROW_CLASS =
  "text-muted-foreground hover:text-foreground focus-visible:ring-ring flex items-center gap-2 rounded-none text-sm transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none [&_svg]:size-3.5";

function useScrollState(itemIds: string[]) {
  const [activeId, setActiveId] = React.useState<string | null>(itemIds[0] ?? null);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 1);

      if (window.scrollY >= scrollable - 4) {
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

  return { activeId, progress };
}

function ProgressRing({ progress }: { progress: number }) {
  const id = React.useId();
  const radius = 10;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg viewBox="0 0 26 26" className="size-[26px] -rotate-90 overflow-visible" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" className="[stop-color:#a855f7] dark:[stop-color:#c084fc]" />
          <stop offset="50%" className="[stop-color:#ef4444] dark:[stop-color:#fb7185]" />
          <stop offset="100%" className="[stop-color:#ec4899] dark:[stop-color:#f472b6]" />
        </linearGradient>
      </defs>
      <circle cx="13" cy="13" r={radius} fill="none" stroke="var(--border)" strokeWidth="3" />
      <circle
        cx="13"
        cy="13"
        r={radius}
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - progress)}
        className="transition-[stroke-dashoffset] duration-300 ease-out motion-reduce:transition-none"
      />
    </svg>
  );
}

function ActionButton({
  label,
  onClick,
  href,
  children,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  children: React.ReactNode;
}) {
  if (href) {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={ROW_CLASS}
      >
        {children}
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cn(ROW_CLASS, "cursor-pointer")}>
      {children}
      {label}
    </button>
  );
}

export function DocsTableOfContents({
  toc,
  docId,
  title,
  content,
  url,
  editPath = `docs/${docId}/doc.mdx`,
}: {
  toc: TocItem[];
  docId: string;
  title: string;
  content: string;
  url: string;
  editPath?: string;
}) {
  const itemIds = React.useMemo(() => toc.map((item) => item.url.replace("#", "")), [toc]);
  const { activeId, progress } = useScrollState(itemIds);
  const { isCopied, copyToClipboard } = useCopyToClipboard({ resetAfter: 1500 });
  const { say, visit } = useGhost();
  const settled = React.useRef(false);
  const finished = React.useRef(false);

  React.useEffect(() => {
    if (!activeId) return;
    if (!settled.current) {
      settled.current = true;
      return;
    }
    const t = window.setTimeout(
      () => say(sectionWord(document.getElementById(activeId)?.textContent)),
      600,
    );
    return () => window.clearTimeout(t);
  }, [activeId, say]);

  React.useEffect(() => {
    if (progress < 0.9) finished.current = false;
    if (progress >= 1 && window.scrollY > 0 && !finished.current) {
      finished.current = true;
      say(ghostWords.done);
    }
  }, [progress, say]);

  const copyPage = async () => {
    if (await copyToClipboard(content)) {
      trackEvent("copy_page", { url });
      say(ghostWords.copied);
    }
  };

  const shareUrl = `https://x.com/intent/post?text=${encodeURIComponent(
    `${title} · ${siteConfig.name}`,
  )}&url=${encodeURIComponent(`${siteConfig.url}${url}`)}`;

  const prompt = encodeURIComponent(
    `I'm looking at this Clover UI documentation: ${siteConfig.url}${url}\nHelp me understand how to use it. Be ready to explain concepts, give examples, or help debug based on it.`,
  );

  const openIn = [
    {
      label: "Open in v0",
      href: `https://v0.dev?q=${prompt}`,
      event: "open_in_v0" as const,
      word: ghostWords.v0,
      icon: <SiV0 className="text-black dark:text-white" />,
    },
    {
      label: "Open in ChatGPT",
      href: `https://chatgpt.com?q=${prompt}`,
      event: "open_in_chatgpt" as const,
      word: ghostWords.chatgpt,
      icon: <OpenAILogo className="text-black dark:text-white" />,
    },
    {
      label: "Open in Claude",
      href: `https://claude.ai/new?q=${prompt}`,
      event: "open_in_claude" as const,
      word: ghostWords.claude,
      icon: <SiClaude color="#D97757" />,
    },
  ];

  return (
    <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-l xl:flex">
      <div className="flex h-full flex-col">
        <div className="border-border flex h-14 shrink-0 items-center justify-between px-4">
          <p className="text-foreground text-[15px] font-medium">On this page</p>
          <ProgressRing progress={progress} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
          <nav aria-label="On this page">
            {toc.length > 0 && (
              <ul className="flex flex-col gap-0.5">
                {toc.map((item) => {
                  const id = item.url.replace("#", "");
                  const isActive = id === activeId;
                  return (
                    <li key={item.url}>
                      <a
                        href={item.url}
                        onClick={(event) => {
                          const target = document.getElementById(id);
                          if (!target) return;
                          event.preventDefault();
                          target.scrollIntoView({ behavior: "smooth", block: "start" });
                          history.replaceState(null, "", item.url);
                          say(sectionWord(target.textContent));
                          window.setTimeout(() => visit(target), 700);
                        }}
                        aria-current={isActive ? "location" : undefined}
                        className={cn(
                          "focus-visible:ring-ring block py-1.5 text-[15px] leading-snug no-underline transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transition-none",
                          item.depth >= 3 && "pl-3 text-sm",
                          isActive
                            ? "text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {item.title}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </nav>

          <div className="border-border mt-5 flex flex-col gap-2 border-t pt-4">
            <ActionButton label={isCopied ? "Copied" : "Copy page"} onClick={copyPage}>
              {isCopied ? <ThumbsUp /> : <Copy />}
            </ActionButton>
            <ActionButton
              label="Share"
              href={shareUrl}
              onClick={() => {
                trackEvent("share_on_x", { url });
                say(ghostWords.shared);
              }}
            >
              <SiX className="text-black dark:text-white" />
            </ActionButton>
            {openIn.map(({ label, href, event, word, icon }) => (
              <ActionButton
                key={label}
                label={label}
                href={href}
                onClick={() => {
                  trackEvent(event, { url });
                  say(word);
                }}
              >
                {icon}
              </ActionButton>
            ))}
            <ActionButton
              label="Edit this page"
              href={`${siteConfig.links.github}/edit/main/${editPath}`}
              onClick={() => {
                trackEvent("click_edit_page", { doc: docId });
                say(ghostWords.edit);
              }}
            >
              <SquarePen />
            </ActionButton>
            <ActionButton
              label="Back to top"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                say(ghostWords.top);
              }}
            >
              <ArrowUp />
            </ActionButton>
            <GhostToggle className={ROW_CLASS} />
          </div>
        </div>
      </div>
    </aside>
  );
}
