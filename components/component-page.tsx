import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DocsTableOfContents } from "./toc";

interface TocItem {
  title?: string;
  url: string;
  depth: number;
}

interface ComponentPageProps {
  name: string;
  docId: string;
  url: string;
  installCommand: string;
  docContent: React.ReactNode;
  rawContent: string;
  toc: TocItem[];
}

export function ComponentPage({
  name,
  docId,
  url,
  docContent,
  rawContent,
  toc,
}: ComponentPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-row">
      <div className="flex min-w-0 flex-1 flex-col md:pr-64">
        <div className="min-w-0 flex-1 p-6 sm:p-12">
          <article className="prose dark:prose-invert max-w-none">
            {docContent}
          </article>
        </div>
      </div>

            {toc.length > 0 && (
        <aside className="fixed right-0 top-12 z-20 hidden h-[calc(100svh-3rem)] w-64 shrink-0 overflow-y-auto border-l border-border/60 bg-background md:block">
          <DocsTableOfContents
            toc={toc}
            docId={docId}
            content={rawContent}
            url={url}
          />
        </aside>
      )}
    </div>
  );
}