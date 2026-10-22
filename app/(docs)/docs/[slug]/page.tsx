import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocPage } from "@/components/docs/doc-page";
import { getDoc, getDocIds, getDocNav } from "@/lib/doc";
import { siteConfig } from "@/lib/config";
import { buildOgUrl, buildMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export async function generateStaticParams() {
  const ids = await getDocIds();
  return ids.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getDoc(slug);

  return buildMetadata({
    title: doc ? `${doc.title} | ${siteConfig.name}` : siteConfig.name,
    description: doc?.description,
    image: buildOgUrl(slug),
    path: `/docs/${slug}`,
  });
}

export default async function DocSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(await getDocIds()).includes(slug)) notFound();
  const Doc = (await import(`@/docs/${slug}/doc.mdx`)).default;
  const { previous, next } = await getDocNav(slug);

  return (
    <DocPage previous={previous} next={next}>
      <Doc />
    </DocPage>
  );
}
