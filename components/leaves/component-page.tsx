import * as React from "react";

export function ComponentPage({ docContent }: { docContent: React.ReactNode }) {
  return (
    <div className="min-w-0 flex-1 p-6 sm:p-12">
      <article className="prose dark:prose-invert max-w-none">{docContent}</article>
    </div>
  );
}
