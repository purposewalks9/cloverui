"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Book, ChevronRight } from "lucide-react";
import { CloverLogo } from "./clover-logo";
import { DocsTableOfContents } from "./toc";

interface TocItem {
  title?: string;
  url: string;
  depth: number;
}

interface ComponentBookProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  docId: string;
  url: string;
  installCommand: string;
  docContent: React.ReactNode;
  rawContent: string;
  toc: TocItem[];
  onNext: () => void;
}

export function ComponentBook({
  open,
  onOpenChange,
  name,
  docId,
  url,
  docContent,
  rawContent,
  toc,
  onNext,
}: ComponentBookProps) {
  const docScrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    docScrollRef.current?.scrollTo({ top: 0 });
  }, [docId]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild forceMount>
              <div className="fixed inset-4 z-50 sm:inset-8 lg:inset-x-16 lg:inset-y-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="relative h-full w-full overflow-hidden border border-border bg-background shadow-2xl"
                >
                  {/* Cover stays fixed — it doesn't slide with the content */}
                  <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-[34%] shrink-0 flex-col items-center justify-center overflow-hidden border-r border-border bg-gradient-to-br from-primary/15 via-background to-background">
                    <CloverLogo size={64} />
                  </div>

                  <div className="pointer-events-none absolute left-[34%] top-0 z-10 h-full w-6 -translate-x-1/2 bg-gradient-to-r from-black/10 via-transparent to-black/10 dark:from-white/5 dark:to-white/5" />

                  {/* Sliding content pane, offset past the cover */}
                  <div className="absolute inset-y-0 right-0 flex" style={{ left: "34%" }}>
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.div
                        key={docId}
                        initial={{ x: 40, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -40, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="flex min-h-0 min-w-0 flex-1 flex-row"
                      >
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-center justify-between border-b px-11 py-3">
                            <Dialog.Title className="text-md font-medium">
                              {name}
                            </Dialog.Title>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={onNext}
                                className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                              >
                                Next
                                <ChevronRight className="size-3.5" />
                              </button>

                              <Dialog.Close asChild>
                                <button
                                  type="button"
                                  aria-label="Close book"
                                  className="text-muted-foreground transition-colors hover:text-foreground"
                                >
                                  <Book className="size-4" />
                                </button>
                              </Dialog.Close>
                            </div>
                          </div>
                          <div
                            ref={docScrollRef}
                            className="min-w-0 flex-1 overflow-y-auto p-12"
                          >
                            <article className="prose dark:prose-invert max-w-none">
                              {docContent}
                            </article>
                          </div>
                        </div>

                        {toc.length > 0 && (
                          <aside className="hidden w-56 shrink-0 overflow-y-auto border-l border-border md:block">
                            <DocsTableOfContents
                              toc={toc}
                              docId={docId}
                              content={rawContent}
                              url={url}
                            />
                          </aside>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}