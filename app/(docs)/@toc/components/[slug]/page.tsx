import { readFile } from "fs/promises";
import { join } from "path";
import { getTableOfContents } from "@/lib/toc";
import { getPublishedSlugs } from "@/lib/slugs";
import { getDoc } from "@/lib/doc";
import { DocsTableOfContents } from "@/components/stem/toc";

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function TocSlot({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = await readFile(join(process.cwd(), "docs", slug, "doc.mdx"), "utf-8");
  const toc = await getTableOfContents(content);
  const doc = await getDoc(slug);

  return (
    <aside className="bg-sidebar text-sidebar-foreground border-sidebar-border sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-l xl:flex">
      <DocsTableOfContents
        toc={toc}
        docId={slug}
        title={doc?.title ?? slug}
        content={content}
        url={`/components/${slug}`}
      />
    </aside>
  );
}
