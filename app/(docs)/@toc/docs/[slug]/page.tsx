import { getDocToc } from "@/lib/toc";
import { getDoc, getDocIds } from "@/lib/doc";
import { DocsTableOfContents } from "@/components/layout/toc";

export const dynamicParams = false;

export async function generateStaticParams() {
  const ids = await getDocIds();
  return ids.map((slug) => ({ slug }));
}

export default async function DocTocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { content, toc } = await getDocToc("docs", slug, "doc.mdx");
  const doc = await getDoc(slug);

  return (
    <DocsTableOfContents
      toc={toc}
      docId={slug}
      title={doc?.title ?? slug}
      content={content}
      url={`/docs/${slug}`}
    />
  );
}
