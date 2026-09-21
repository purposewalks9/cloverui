import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config";
import { getPublishedSlugs } from "@/lib/slugs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getPublishedSlugs();

  const componentRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${siteConfig.url}/components/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...componentRoutes,
  ];
}
