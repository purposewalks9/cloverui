"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, Plus, X } from "lucide-react";
import { CloverLogo } from "@/components/seed/clover-logo";
import { SearchForm } from "@/components/stem/command-menu";
import { ThemeToggle } from "@/components/stem/theme-toggle";
import type { DocSchema } from "@/lib/types";

export function MobileMenu({
  docSchema,
  githubStars,
}: {
  docSchema: DocSchema;
  githubStars: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const pathname = usePathname();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const components = docSchema
    .flatMap((group) => group.items)
    .filter((item) => item.href.startsWith("/components/"));
  const latest = components
    .filter((item) => item.meta?.addedAt)
    .sort((a, b) => (b.meta?.addedAt ?? "").localeCompare(a.meta?.addedAt ?? ""))
    .slice(0, 6);
  const groups = showNew ? [{ title: "New components", items: latest }] : docSchema;
  const close = () => setOpen(false);

  React.useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const resize = () => {
      if (media.matches) setOpen(false);
    };
    media.addEventListener("change", resize);
    return () => media.removeEventListener("change", resize);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className="text-foreground hover:bg-muted inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current md:hidden"
        >
          <Menu aria-hidden className="size-5" strokeWidth={1.7} />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50 backdrop-blur-2xl"
          style={{
            backgroundColor: "color-mix(in srgb, var(--background) 88%, transparent)",
            backgroundImage:
              "linear-gradient(color-mix(in srgb, var(--brand) 7%, transparent), color-mix(in srgb, var(--brand) 3%, transparent))",
          }}
        />
        <Dialog.Content
          className="text-foreground fixed inset-0 z-50 flex h-dvh flex-col overflow-hidden pt-[env(safe-area-inset-top)] outline-none"
          aria-describedby={undefined}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-28 bottom-[8%] -z-10 rotate-[-18deg] opacity-[0.06]"
          >
            <CloverLogo size={480} />
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 px-4 pt-3 sm:px-6">
            <Dialog.Close className="inline-flex min-h-11 cursor-pointer items-center gap-2 pr-2 focus-visible:outline-2 focus-visible:outline-current">
              <X aria-hidden className="size-5" />
              <Dialog.Title className="text-xl font-medium tracking-tight">Menu</Dialog.Title>
            </Dialog.Close>
            <div className="flex items-center gap-2">
              <div className="flex min-h-11 items-center">{githubStars}</div>
              <span aria-hidden className="bg-foreground/15 h-5 w-px" />
              <ThemeToggle />
              <button
                type="button"
                aria-pressed={showNew}
                onClick={() => {
                  setShowNew((value) => !value);
                  scrollRef.current?.scrollTo({ top: 0 });
                }}
                className="bg-foreground text-background inline-flex min-h-10 cursor-pointer items-center gap-1 rounded-none px-3 text-sm font-medium whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
              >
                <Plus aria-hidden className="size-4" />
                New
              </button>
            </div>
          </div>
          <div className="shrink-0 px-5 pt-5 pb-3 sm:px-7">
            <SearchForm
              docSchema={docSchema}
              shortcut={false}
              className="max-w-none"
              onNavigate={close}
            />
          </div>
          <div
            ref={scrollRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-5 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-8"
          >
            {!showNew && (
              <nav aria-label="Main navigation" className="mb-12">
                <p className="text-muted-foreground mb-4 text-sm">Menu</p>
                <div className="flex flex-col items-start gap-3">
                  {[
                    { title: "Home", href: "/" },
                    { title: "Docs", href: "/docs/introduction" },
                    { title: "Components", href: components[0]?.href ?? "/docs/introduction" },
                  ].map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      onClick={close}
                      aria-current={pathname === item.href ? "page" : undefined}
                      className="max-w-full py-1 text-[clamp(1.75rem,8vw,2.5rem)] leading-tight tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              </nav>
            )}
            <nav
              aria-label={showNew ? "New components" : "Documentation sections"}
              className="space-y-10"
            >
              {groups
                .filter((group) => group.items.length)
                .map((group) => (
                  <div key={group.title}>
                    <h2 className="text-muted-foreground mb-3 text-sm">{group.title}</h2>
                    <div className="flex flex-col items-start gap-1">
                      {group.items.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={close}
                          aria-current={pathname === item.href ? "page" : undefined}
                          className="group max-w-full rounded-none py-2 text-2xl leading-tight tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current aria-[current=page]:underline aria-[current=page]:decoration-[var(--brand)] aria-[current=page]:underline-offset-8"
                        >
                          <span className="inline-flex items-center gap-3">
                            {item.title}
                            {showNew && (
                              <ArrowUpRight
                                aria-hidden
                                className="text-muted-foreground size-4 shrink-0"
                              />
                            )}
                          </span>
                          {showNew && (
                            <span className="text-muted-foreground mt-1 block text-sm leading-relaxed tracking-normal">
                              {item.description}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              {showNew && !latest.length && (
                <p className="text-muted-foreground text-sm">
                  New components will appear here as they are added.
                </p>
              )}
            </nav>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
