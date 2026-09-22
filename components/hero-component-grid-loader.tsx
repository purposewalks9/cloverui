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
    try {
      const demoModule = await import(`@/docs/${slug}/demo.tsx`);
      const { Demo: DemoComponent } = demoModule as {
        Demo: React.ComponentType;
      };
      const demos = DemoComponent ? [<DemoComponent key="Demo" />] : [];

      const singleDemo = slug === "token-fall" || slug === "chat";
      docs[slug] = { demos, singleDemo };
      tiles.push({ name: titleBySlug.get(slug) ?? slug, slug });
    } catch (err) {
      console.warn(`[component-book] failed to load "${slug}":`, err);
    }
  }

  return <HeroComponentGrid tiles={tiles} docs={docs} />;
}