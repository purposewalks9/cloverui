import type { Metadata } from "next";
import { ComponentPage } from "@/components/leaves/component-page";
import { guides } from "@/lib/basic-doc";
import { siteConfig } from "@/lib/config";
import { constructMetadata } from "@/lib/utils";

export const dynamicParams = false;

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = guides.find((item) => item.id === slug);

  return constructMetadata({
    title: guide ? `${guide.title} · ${siteConfig.name}` : siteConfig.name,
    description: guide?.description,
    path: `/docs/${slug}`,
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const Doc = (await import(`@/guides/${slug}.mdx`)).default;

  return <ComponentPage docContent={<Doc />} />;
}
