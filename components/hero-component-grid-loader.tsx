import { getTableOfContents } from "@/lib/toc";
import { readFile } from "fs/promises";
import { join } from "path";
import { getPublishedSlugs } from "@/lib/slugs";
import { getRegistry } from "@/lib/registry";
import {
  HeroComponentGrid,
  type ComponentTile,
  type DocBundle,
} from "./hero-component-grid";

export async function HeroComponentGridLoader() {
  const [slugs, { items }] = await Promise.all([
    getPublishedSlugs(),
    getRegistry(),
  ]);

  const titleBySlug = new Map(items.map((item) => [item.name, item.title]));

  const docs: Record<string, DocBundle> = {};
  const tiles: ComponentTile[] = [];

  for (const slug of slugs) {
    const docPath = join(process.cwd(), "docs", slug, "doc.mdx");

    try {
      const Doc = (await import(`@/docs/${slug}/doc.mdx`)).default;
      const rawContent = await readFile(docPath, "utf-8");
      const toc = await getTableOfContents(rawContent);

      const demoModule = await import(`@/docs/${slug}/demo.tsx`);
      const demos = Object.entries(demoModule)
        .filter(([, value]) => typeof value === "function")
        .map(([key, DemoComponent]) => {
          const Comp = DemoComponent as React.ComponentType;
          return <Comp key={key} />;
        });

      const singleDemo = slug === "token-fall" || slug === "chat";
      docs[slug] = { content: <Doc />, toc, demos, rawContent, singleDemo };
      tiles.push({ name: titleBySlug.get(slug) ?? slug, slug });
    } catch (err) {
      console.warn(`[component-book] failed to load "${slug}":`, err);
    }
  }

  return <HeroComponentGrid tiles={tiles} docs={docs} />;
}