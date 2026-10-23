import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const moduleUrl = new URL("./random.mjs", import.meta.url).href;
function run(settings, source = "") {
  const env = { ...process.env };
  delete env.PROPERTY_RUNS;
  delete env.PROPERTY_SEED;
  return spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `import { forAll, createRandom, RUNS, SEED } from ${JSON.stringify(moduleUrl)}; ${source}`,
    ],
    {
      env: { ...env, ...settings },
      encoding: "utf8",
      timeout: 5000,
    },
  );
}

test("property configuration rejects counts that skip or cannot finish checks", () => {
  for (const value of ["invalid", "", " ", "0", "-1", "1.5", "Infinity", "10001"]) {
    const result = run({ PROPERTY_RUNS: value });
    assert.equal(result.error, undefined);
    assert.notEqual(result.status, 0, `PROPERTY_RUNS=${JSON.stringify(value)}`);
    assert.match(result.stderr, /PROPERTY_RUNS must be an integer from 1 to 10000/);
  }
});

test("property configuration rejects invalid seeds", () => {
  for (const value of ["invalid", "", "-1", "1.5", "Infinity", "4294967296"]) {
    const result = run({ PROPERTY_SEED: value });
    assert.equal(result.error, undefined);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /PROPERTY_SEED must be an integer/);
  }
});

test("defaults run 100 cases and report the reproducible configuration", () => {
  const result = run(
    {},
    'let count = 0; forAll("default", () => 1, () => count++); if (count !== 100 || RUNS !== 100 || SEED !== 20261022) throw Error("wrong defaults");',
  );
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /checked 100 cases \(PROPERTY_SEED=20261022\)/);
});

test("explicit count and seed execute and reproduce the requested cases", () => {
  const result = run(
    { PROPERTY_RUNS: "3", PROPERTY_SEED: "0" },
    'const a = createRandom(); const b = createRandom(); let count = 0; forAll("repeat", () => a.next(), (value) => { if (value !== b.next()) throw Error("not reproducible"); count++; }); if (count !== 3) throw Error("wrong count");',
  );
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /checked 3 cases \(PROPERTY_SEED=0\)/);
});

test("a failed property includes its seed and input", () => {
  const result = run(
    { PROPERTY_RUNS: "1", PROPERTY_SEED: "42" },
    'forAll("failure", () => ({ value: 7 }), () => { throw Error("expected failure"); });',
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /PROPERTY_SEED=42/);
  assert.match(result.stderr, /input: \{"value":7\}/);
});
