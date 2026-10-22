import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(
  process.argv[2] ?? path.join(path.dirname(fileURLToPath(import.meta.url)), ".."),
);
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const registry = JSON.parse(read("registry.json"));
const errors = [];
const fail = (name, message) => errors.push(`${name}: ${message}`);
try {
  if (
    JSON.stringify(JSON.parse(read("registry/output/registry.json"))) !== JSON.stringify(registry)
  ) {
    fail("registry", "published index is stale; run pnpm registry:build");
  }
} catch {
  fail("registry", "published index is missing or invalid");
}
const packageName = (value) =>
  value.startsWith("@") ? value.split("/").slice(0, 2).join("/") : value.split("/")[0];
const dependencyName = (value) =>
  value.startsWith("http")
    ? new URL(value).pathname
        .split("/")
        .pop()
        .replace(/\.json$/, "")
    : value;
const components = registry.items.filter((item) => item.type === "registry:component");
const names = new Set();

for (const item of registry.items) {
  if (names.has(item.name)) fail(item.name, "duplicate registry name");
  names.add(item.name);
  let generated;
  try {
    generated = JSON.parse(read(`registry/output/${item.name}.json`));
  } catch {
    fail(item.name, "missing or invalid generated JSON; run pnpm registry:build");
  }
  for (const key of [
    "name",
    "type",
    "title",
    "description",
    "dependencies",
    "registryDependencies",
  ]) {
    if (generated && JSON.stringify(generated[key] ?? []) !== JSON.stringify(item[key] ?? [])) {
      fail(item.name, `generated ${key} is stale`);
    }
  }
  const registryDependencies = new Set((item.registryDependencies ?? []).map(dependencyName));
  for (const file of item.files ?? []) {
    let content;
    try {
      content = read(file.path);
    } catch {
      fail(item.name, `missing source ${file.path}`);
      continue;
    }
    if (generated?.files?.find((entry) => entry.path === file.path)?.content !== content) {
      fail(item.name, `generated content differs from ${file.path}`);
    }
    const source = ts.createSourceFile(
      file.path,
      content,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    const client = source.statements.some(
      (node) =>
        ts.isExpressionStatement(node) &&
        ts.isStringLiteral(node.expression) &&
        node.expression.text === "use client",
    );
    const visit = (node) => {
      if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
        const name = node.moduleSpecifier.text;
        if (name === "@/lib/utils") return;
        if (name.startsWith("@/")) {
          const match = name.match(/^@\/(?:registry\/clover-ui|components\/ui)\/([^/]+)$/);
          if (!match || !registryDependencies.has(match[1]))
            fail(item.name, `undeclared host import ${name}`);
        } else if (name.startsWith(".")) {
          const target = path.posix.normalize(path.posix.join(path.posix.dirname(file.path), name));
          if (
            !(item.files ?? []).some((entry) =>
              [target, `${target}.tsx`, `${target}.ts`].includes(entry.path),
            )
          ) {
            fail(item.name, `relative import ${name} is not shipped`);
          }
        } else {
          const pkg = packageName(name);
          if (!["react", "react-dom"].includes(pkg) && !(item.dependencies ?? []).includes(pkg)) {
            fail(item.name, `missing dependency ${pkg}`);
          }
        }
      }
      if (
        ts.isCallExpression(node) &&
        !client &&
        /^(?:React\.)?(?:useState|useReducer|useEffect|useLayoutEffect|useInsertionEffect|useRef|useImperativeHandle|useSyncExternalStore|useContext|forwardRef|createContext|useAnimate|useAnimationFrame|useMotionValue|useTransform|useReducedMotion|useSpring|useInView)$/.test(
          node.expression.getText(source),
        )
      ) {
        fail(
          item.name,
          `client API ${node.expression.getText(source)} requires a use client boundary`,
        );
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  if (item.type === "registry:component") {
    for (const file of ["doc.mdx", "demo.tsx", "playground.tsx"]) {
      if (!fs.existsSync(path.join(root, "docs", item.name, file)))
        fail(item.name, `missing docs/${item.name}/${file}`);
    }
  }
}

const all = registry.items.find((item) => item.name === "all");
const bundled = new Set((all?.registryDependencies ?? []).map(dependencyName));
for (const item of components) if (!bundled.has(item.name)) fail("all", `missing ${item.name}`);
for (const name of bundled) if (!names.has(name)) fail("all", `unknown component ${name}`);

if (errors.length) {
  console.error([...new Set(errors)].join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Registry check passed: ${components.length} components, declared imports, client boundaries, docs and generated content.`,
  );
}
