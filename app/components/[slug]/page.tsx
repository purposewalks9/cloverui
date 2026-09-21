import { notFound } from "next/navigation";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { join } from "path";
import { getTableOfContents } from "@/lib/toc";
import { ComponentPage } from "@/components/component-page";

const SLUGS = [
  "slide-text",
  "gauge-text",
  "grid-reveal",
  "cycle-list",
  "text-gif",
  "candlestick-chart",
  "drop-text",
  "gamepad-nav",
  "token-fall",
  "pulse-loader",
  "soft-button",
  "status-tag",
] as const;

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!SLUGS.includes(slug as (typeof SLUGS)[number])) {
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