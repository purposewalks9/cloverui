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
      // The grid only ever renders `demos` and `singleDemo` for a tile — it
      // never renders the full doc page. Importing `doc.mdx` (and its
      // playground/install-tabs/code-block tree) here just to throw it away
      // was forcing a huge, client-component-heavy RSC payload across the
      // server -> client boundary on every homepage load, which is what was
      // blowing up in production. Only load what's actually used.
      const demoModule = await import(`@/docs/${slug}/demo.tsx`);
      const demos = Object.entries(demoModule)
        .filter(([, value]) => typeof value === "function")
        .map(([key, DemoComponent]) => {
          const Comp = DemoComponent as React.ComponentType;
          return <Comp key={key} />;
        });

      const singleDemo = slug === "token-fall" || slug === "chat";
      docs[slug] = { demos, singleDemo };
      tiles.push({ name: titleBySlug.get(slug) ?? slug, slug });
    } catch (err) {
      console.warn(`[component-book] failed to load "${slug}":`, err);
    }
  }

  return <HeroComponentGrid tiles={tiles} docs={docs} />;
}