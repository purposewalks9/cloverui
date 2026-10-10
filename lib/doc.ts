import { basicDoc } from "@/lib/basic-doc";
import { getRegistry } from "./registry";
import { DocItem, DocSchema, RegistryItem } from "./types";

const CATEGORY_LABELS: Record<string, string> = {
  text: "Text",
  input: "Inputs",
  loader: "Loaders",
  cursor: "Cursors",
  effect: "Effects",
  background: "Backgrounds",
  block: "Blocks",
  data: "Widgets",
};

const CATEGORY_ORDER = ["text", "input", "loader", "cursor", "effect", "background", "block", "data"];

function toDocItem(item: RegistryItem): DocItem {
  return {
    id: item.name,
    href: `/components/${item.name}`,
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

export const getDocSchema = async () => {
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

  return [...basicDoc, ...componentGroups];
};

export const allDocItems = async () => {
  const schema = await getDocSchema();
  return schema.flatMap((section) => section.items);
};

export const getDoc = async (id: string) => {
  const allItems = await allDocItems();
  return allItems.find((item) => item.id === id);
};
