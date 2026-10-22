import { guideIds, guideSchema } from "@/lib/guides";
import { getRegistry } from "@/lib/registry";
import { getPublishedSlugs } from "@/lib/slugs";
import type { DocItem, DocSchema, RegistryItem } from "@/lib/types";

const CATEGORIES: [string, string][] = [
  ["button", "Buttons"],
  ["control", "Controls"],
  ["text", "Text"],
  ["loader", "Loaders"],
  ["cursor", "Cursors"],
  ["effect", "Effects"],
  ["background", "Backgrounds"],
  ["asset", "Assets"],
  ["block", "Blocks"],
];
const CATEGORY_LABELS = Object.fromEntries(CATEGORIES);
const CATEGORY_ORDER = CATEGORIES.map(([key]) => key);

function toDocItem(item: RegistryItem): DocItem {
  return {
    id: item.name,
    href: `/docs/${item.name}`,
    title: item.title,
    description: item.description,
    meta: item.meta,
  };
}

function groupByCategory(items: RegistryItem[]) {
  const groups = new Map<string, DocItem[]>();
  for (const item of items) {
    const key = item.category ?? "effect";
    groups.set(key, [...(groups.get(key) ?? []), toDocItem(item)]);
  }
  return groups;
}

export async function getDocSchema(): Promise<DocSchema> {
  const { items } = await getRegistry();
  const components = items.filter((i) => i.type === "registry:component");
  const byCategory = groupByCategory(components);

  const orderedKeys = CATEGORY_ORDER.filter((k) => byCategory.has(k));
  const extraKeys = [...byCategory.keys()]
    .filter((k) => !CATEGORY_ORDER.includes(k))
    .sort((a, b) => a.localeCompare(b));

  const componentGroups: DocSchema = [...orderedKeys, ...extraKeys]
    .map((key) => ({
      title: CATEGORY_LABELS[key] ?? key,
      items: (byCategory.get(key) ?? []).sort((a, b) => a.title.localeCompare(b.title)),
    }))
    .filter((g) => g.items.length > 0);

  return [...guideSchema, ...componentGroups];
}

async function getAllDocItems() {
  const schema = await getDocSchema();
  return schema.flatMap((section) => section.items);
}

export async function getDocIds() {
  return [...guideIds, ...(await getPublishedSlugs())];
}

export async function getDoc(id: string) {
  const allItems = await getAllDocItems();
  return allItems.find((item) => item.id === id);
}

export async function getDocNav(id: string) {
  const allItems = await getAllDocItems();
  const index = allItems.findIndex((item) => item.id === id);

  return {
    previous: index > 0 ? allItems[index - 1] : undefined,
    next: index >= 0 ? allItems[index + 1] : undefined,
  };
}
