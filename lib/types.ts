export interface RegistryItemMeta {
  addedAt?: string;
  docs?: Array<{
    title: string;
    url: string;
  }>;
}

export interface DocItem {
  id: string;
  title: string;
  description: string;
  href: string;
  meta?: RegistryItemMeta;
}

export type DocSchema = Array<{
  title: string;
  items: DocItem[];
}>;

export interface RegistryItem {
  name: string;
  type: "registry:item" | "registry:component" | "registry:hook" | "registry:lib";
  title: string;
  description: string;
  category?: string;
  files?: Array<{
    path: string;
    type: string;
  }>;
  dependencies?: string[];
  registryDependencies?: string[];
  meta?: RegistryItemMeta;
}

export interface Registry {
  $schema?: string;
  name?: string;
  homepage?: string;
  author?: string;
  items: RegistryItem[];
}
