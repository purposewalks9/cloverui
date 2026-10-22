import type { Registry } from "@/lib/types";

export async function getRegistry(): Promise<Registry> {
  const registryData = await import("@/registry.json");
  return registryData.default as Registry;
}

export async function getRegistryItem(name: string) {
  const registry = await getRegistry();
  return registry.items.find((item) => item.name === name);
}
