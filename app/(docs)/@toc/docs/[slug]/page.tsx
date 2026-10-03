import { readFile } from "fs/promises";
import { join } from "path";
import { getTableOfContents } from "@/lib/toc";
import { guides } from "@/lib/basic-doc";
import { DocsTableOfContents } from "@/components/stem/toc";

export const dynamicParams = false;

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.id }));
}

export default async function TocSlot({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await readFile(join(process.cwd(), "docs", "guides", `${slug}.mdx`), "utf-8");
  const toc = await getTableOfContents(content);
  const guide = guides.find((item) => item.id === slug);

  return (
    <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-l xl:flex">
      <DocsTableOfContents
        toc={toc}
        docId={slug}
        title={guide?.title ?? slug}
        content={content}
        url={`/docs/${slug}`}
        editPath={`docs/guides/${slug}.mdx`}
      />
    </aside>
  );
}
