import { getPublishedSlugs } from "@/lib/slugs";
import { ComponentPage } from "@/components/leaves/component-page";

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const Doc = (await import(`@/docs/${slug}/doc.mdx`)).default;

  return <ComponentPage docContent={<Doc />} />;
}
