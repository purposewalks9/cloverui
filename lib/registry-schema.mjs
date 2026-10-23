const itemTypes = new Set(["registry:item", "registry:component", "registry:hook", "registry:lib"]);
const categories = new Set([
  "button",
  "control",
  "text",
  "loader",
  "cursor",
  "effect",
  "background",
  "asset",
  "block",
]);

function requireValue(condition, message) {
  if (!condition) throw new TypeError(`Invalid Clover UI registry: ${message}`);
}

const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const text = (value) => typeof value === "string" && value.trim().length > 0;
const stringList = (value) => Array.isArray(value) && value.every(text);

/**
 * Validate authored metadata before consumers rely on the TypeScript contract.
 * @param {unknown} value
 * @returns {asserts value is import("./types").Registry}
 */
export function assertRegistry(value) {
  requireValue(object(value) && Array.isArray(value.items), "items must be an array");
  for (const key of ["$schema", "name", "homepage", "author"]) {
    requireValue(value[key] === undefined || text(value[key]), `${key} must be a nonempty string`);
  }
  const names = new Set();
  for (const item of value.items) {
    requireValue(object(item), "each item must be an object");
    requireValue(
      typeof item.name === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.name),
      "invalid item name",
    );
    requireValue(!names.has(item.name), `duplicate name ${item.name}`);
    names.add(item.name);
    const label = item.name;
    requireValue(itemTypes.has(item.type), `${label}: unsupported type ${item.type}`);
    requireValue(
      text(item.title) && text(item.description),
      `${label}: title and description are required`,
    );
    requireValue(
      item.category === undefined || categories.has(item.category),
      `${label}: unsupported category ${item.category}`,
    );
    for (const key of ["dependencies", "registryDependencies"]) {
      requireValue(
        item[key] === undefined || stringList(item[key]),
        `${label}: ${key} must be an array of nonempty strings`,
      );
    }
    requireValue(
      item.files === undefined || Array.isArray(item.files),
      `${label}: files must be an array`,
    );
    if (item.type !== "registry:item") {
      requireValue(item.files?.length > 0, `${label}: at least one source file is required`);
    }
    for (const file of item.files ?? []) {
      requireValue(
        object(file) && text(file.path) && text(file.type),
        `${label}: each file needs a path and type`,
      );
      requireValue(
        !file.path.startsWith("/") &&
          !file.path.includes("\\") &&
          !file.path.split("/").includes(".."),
        `${label}: source paths must stay inside the repository`,
      );
    }
    if (item.meta === undefined) continue;
    requireValue(object(item.meta), `${label}: meta must be an object`);
    if (item.meta.addedAt !== undefined) {
      const date = item.meta.addedAt;
      const timestamp = typeof date === "string" ? Date.parse(`${date}T00:00:00Z`) : NaN;
      requireValue(
        typeof date === "string" &&
          /^\d{4}-\d{2}-\d{2}$/.test(date) &&
          Number.isFinite(timestamp) &&
          new Date(timestamp).toISOString().slice(0, 10) === date,
        `${label}: addedAt must be a real YYYY-MM-DD date`,
      );
    }
    if (item.meta.docs !== undefined) {
      requireValue(Array.isArray(item.meta.docs), `${label}: meta.docs must be an array`);
      for (const doc of item.meta.docs) {
        requireValue(
          object(doc) && text(doc.title) && text(doc.url),
          `${label}: each docs link needs a title and URL`,
        );
      }
    }
  }
}

/**
 * @param {import("./types").Registry} registry
 * @param {string[]} files
 */
export function findUnexpectedRegistryFiles(registry, files) {
  const expected = new Set(["registry.json", ...registry.items.map((item) => `${item.name}.json`)]);
  return files.filter((file) => file.endsWith(".json") && !expected.has(file)).sort();
}
