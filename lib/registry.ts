import type { Registry } from "@/lib/types";
import { assertRegistry } from "@/lib/registry-schema.mjs";

export async function getRegistry(): Promise<Registry> {
  const registryData = await import("@/registry.json");
  const registry: unknown = registryData.default;
  assertRegistry(registry);
  return registry;
}

export async function getRegistryItem(name: string) {
  const registry = await getRegistry();
  return registry.items.find((item) => item.name === name);
}
