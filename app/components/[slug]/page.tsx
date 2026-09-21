import { notFound } from "next/navigation";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { join } from "path";
import { getTableOfContents } from "@/lib/toc";
import { getPublishedSlugs } from "@/lib/slugs";
import { ComponentPage } from "@/components/component-page";

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const slugs = await getPublishedSlugs();
  if (!slugs.includes(slug)) {
    notFound();
  }

  const docPath = join(process.cwd(), "docs", slug, "doc.mdx");
  const demoPath = join(process.cwd(), "docs", slug, "demo.tsx");

  if (!existsSync(docPath) || !existsSync(demoPath)) {
    notFound();
  }

  const Doc = (await import(`@/docs/${slug}/doc.mdx`)).default;
  const rawContent = await readFile(docPath, "utf-8");
  const toc = await getTableOfContents(rawContent);

  return (
    <ComponentPage
      name={slug}
      docId={slug}
      url={`/components/${slug}`}
      installCommand={`npx shadcn add @clover-ui/${slug}`}
      docContent={<Doc />}
      rawContent={rawContent}
      toc={toc}
    />
  );
}