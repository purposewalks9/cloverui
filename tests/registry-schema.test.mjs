import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { assertRegistry, findUnexpectedRegistryFiles } from "../lib/registry-schema.mjs";

const registry = JSON.parse(fs.readFileSync(new URL("../registry.json", import.meta.url), "utf8"));
const fixture = () => structuredClone(registry);
const component = (value) => value.items.find((item) => item.type === "registry:component");

test("the current catalog accepts a bundle without source files", () => {
  assert.equal(registry.items.find((item) => item.name === "all").type, "registry:item");
  assert.doesNotThrow(() => assertRegistry(registry));
});

test("invalid authored metadata fails at the registry boundary", () => {
  const cases = [
    [
      (r) => {
        component(r).type = "registry:unknown";
      },
      /unsupported type/,
    ],
    [
      (r) => {
        component(r).category = "typo";
      },
      /unsupported category/,
    ],
    [
      (r) => {
        component(r).meta = { addedAt: "2026-02-30" };
      },
      /real YYYY-MM-DD/,
    ],
    [
      (r) => {
        component(r).meta = { addedAt: "October 23" };
      },
      /real YYYY-MM-DD/,
    ],
    [
      (r) => {
        component(r).files = [];
      },
      /source file is required/,
    ],
    [
      (r) => {
        component(r).files[0].path = "../outside.tsx";
      },
      /inside the repository/,
    ],
    [
      (r) => {
        component(r).dependencies = "motion";
      },
      /array of nonempty strings/,
    ],
    [
      (r) => {
        r.items.push(structuredClone(r.items[0]));
      },
      /duplicate name/,
    ],
  ];
  for (const [change, message] of cases) {
    const value = fixture();
    change(value);
    assert.throws(() => assertRegistry(value), message);
  }
  for (const value of [null, {}, { items: null }, { items: [null] }]) {
    assert.throws(() => assertRegistry(value), /Invalid Clover UI registry/);
  }
});

test("calendar validation accepts a leap day", () => {
  const value = fixture();
  component(value).meta = { addedAt: "2024-02-29" };
  assert.doesNotThrow(() => assertRegistry(value));
});

test("generated inventory identifies removed and unknown component artifacts", () => {
  const files = ["registry.json", ...registry.items.map((item) => `${item.name}.json`)];
  assert.deepEqual(findUnexpectedRegistryFiles(registry, files), []);
  assert.deepEqual(
    findUnexpectedRegistryFiles(registry, [...files, "removed-component.json", "README.md"]),
    ["removed-component.json"],
  );
});
