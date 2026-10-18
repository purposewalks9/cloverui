import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { getRegistry } from "./registry";

const DOCS_DIR = join(process.cwd(), "docs");

function getDocSlugs(): string[] {
  if (!existsSync(DOCS_DIR)) return [];

  return readdirSync(DOCS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) => {
      const docPath = join(DOCS_DIR, slug, "doc.mdx");
      const demoPath = join(DOCS_DIR, slug, "demo.tsx");
      return existsSync(docPath) && existsSync(demoPath);
    })
    .sort();
}

export async function getPublishedSlugs(): Promise<string[]> {
  const docSlugs = getDocSlugs();
  const { items } = await getRegistry();
  const registrySlugs = new Set(items.map((item) => item.name));
  return docSlugs.filter((slug) => registrySlugs.has(slug));
}
