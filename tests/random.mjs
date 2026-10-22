export const SEED = Number(process.env.PROPERTY_SEED ?? 20261022);
export const RUNS = Number(process.env.PROPERTY_RUNS ?? 100);

export function createRandom(seed = SEED) {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const float = (min, max) => min + next() * (max - min);
  const int = (min, max) => Math.floor(float(min, max + 1));
  const pick = (list) => list[int(0, list.length - 1)];
  const edgy = (min, max) =>
    pick([min, max, 0, -0, min - 1, max + 1, float(min, max), int(min, max)]);
  return { next, float, int, pick, edgy };
}

export function forAll(name, generate, check) {
  const random = createRandom();
  for (let run = 0; run < RUNS; run++) {
    const input = generate(random);
    try {
      check(input);
    } catch (error) {
      error.message = `${name} failed on run ${run} (PROPERTY_SEED=${SEED})\ninput: ${JSON.stringify(input)}\n${error.message}`;
      throw error;
    }
  }
}

export const numbers = (html, attribute) =>
  [...html.matchAll(new RegExp(` ${attribute}="([^"]*)"`, "g"))].map((match) => Number(match[1]));
