import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRegistryItem } from "@/lib/registry";
import { getPublishedSlugs } from "@/lib/slugs";
import { buildOgUrl, constructMetadata } from "@/lib/utils";
import { siteConfig } from "@/lib/config";
import { ComponentPage } from "@/components/leaves/component-page";

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getRegistryItem(slug);

  return constructMetadata({
    title: item ? `${item.title} | ${siteConfig.name}` : siteConfig.name,
    description: item?.description,
    image: buildOgUrl(slug),
    path: `/components/${slug}`,
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(await getPublishedSlugs()).includes(slug)) notFound();
  const Doc = (await import(`@/docs/${slug}/doc.mdx`)).default;

  return <ComponentPage docContent={<Doc />} />;
}
