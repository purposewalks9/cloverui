import type { Metadata } from "next";
import { siteConfig } from "@/lib/config";

function absoluteUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? siteConfig.url;
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildOgUrl(slug?: string) {
  const url = new URL(absoluteUrl("/og"));
  if (slug) url.searchParams.set("slug", slug);
  return url.toString();
}

export function buildMetadata({
  title = siteConfig.name,
  description = siteConfig.description,
  image = buildOgUrl(),
  path = "/",
  ...props
}: {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
} & Partial<Metadata> = {}): Metadata {
  return {
    title,
    description,
    keywords: siteConfig.keywords,
    openGraph: {
      title,
      description,
      type: "website",
      url: absoluteUrl(path),
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: siteConfig.links.xHandle,
      site: siteConfig.links.xHandle,
    },
    metadataBase: new URL(siteConfig.url),
    icons: "/icon.svg",
    ...props,
  };
}
