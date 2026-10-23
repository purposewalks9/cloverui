"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocSchema } from "@/lib/types";

export function MobileMenu({ docSchema }: { docSchema: DocSchema }) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();
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
        <Dialog.Overlay className="fixed inset-0 z-50 bg-white dark:bg-black" />
        <Dialog.Content
          className="text-foreground fixed inset-0 z-50 flex h-dvh flex-col overflow-hidden pt-[env(safe-area-inset-top)] outline-none"
          aria-describedby={undefined}
        >
          <div className="flex shrink-0 items-center justify-between gap-2 px-4 pt-3 sm:px-6">
            <Dialog.Close className="inline-flex min-h-11 cursor-pointer items-center gap-2 pr-2 focus-visible:outline-2 focus-visible:outline-current">
              <X aria-hidden className="size-5" />
              <Dialog.Title className="text-xl font-medium tracking-tight">Menu</Dialog.Title>
            </Dialog.Close>
            <span
              aria-disabled="true"
              title="Coming soon"
              className="text-muted-foreground inline-flex min-h-10 cursor-not-allowed items-center gap-1.5 px-1 text-sm font-medium whitespace-nowrap opacity-60"
            >
              <Heart aria-hidden className="size-4 shrink-0" />
              Sponsor
            </span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-6 pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-8">
            <nav aria-label="Documentation sections" className="space-y-7">
              {docSchema
                .filter((group) => group.items.length)
                .map((group) => (
                  <div key={group.title}>
                    <h2 className="text-foreground mb-1.5 text-sm">{group.title}</h2>
                    <div className="flex flex-col items-start">
                      {group.items.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={close}
                          aria-current={pathname === item.href ? "page" : undefined}
                          className="text-muted-foreground hover:text-foreground max-w-full rounded-none py-1.5 text-xl leading-tight tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
                        >
                          <span className={cn(pathname === item.href && "sponsor-gradient")}>
                            {item.title}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
            </nav>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
