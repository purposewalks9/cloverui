import { getTableOfContents } from "@/lib/toc";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { HeroComponentGrid, type DocBundle } from "./hero-component-grid";

const SLUGS = [
  "slide-text",
  "gauge-text",
  "grid-reveal",
  "cycle-list",
  "text-gif",
  "drop-text",
  "gamepad-nav",
  "token-fall",
  "pulse-loader",
  "soft-button",
  "status-tag",
] as const;

export async function HeroComponentGridLoader() {
  const docs: Record<string, DocBundle> = {};

  for (const slug of SLUGS) {
    const docPath = join(process.cwd(), "docs", slug, "doc.mdx");
    const demoPath = join(process.cwd(), "docs", slug, "demo.tsx");

    if (!existsSync(docPath) || !existsSync(demoPath)) {
      console.warn(`[component-book] missing doc.mdx or demo.tsx for "${slug}" — skipping.`);
      continue;
    }

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

      docs[slug] = { content: <Doc />, toc, demos, rawContent }; // ← added rawContent
    } catch (err) {
      console.warn(`[component-book] failed to load "${slug}":`, err);
    }
  }

  return <HeroComponentGrid docs={docs} />;
}