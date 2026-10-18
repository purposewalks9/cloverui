import * as React from "react";

type Config = {
  packageManager: "npm" | "yarn" | "pnpm" | "bun";
};

const STORAGE_KEY = "clover-ui-config";

const DEFAULT_CONFIG: Config = {
  packageManager: "pnpm",
};

const listeners = new Set<() => void>();
let current = DEFAULT_CONFIG;
let currentRaw: string | null = null;

function readConfig() {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return current;
  }
  if (raw === null || raw === currentRaw) return current;
  currentRaw = raw;
  try {
    current = { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    current = DEFAULT_CONFIG;
  }
  return current;
}

function writeConfig(next: Config) {
  current = next;
  currentRaw = JSON.stringify(next);
  try {
    window.localStorage.setItem(STORAGE_KEY, currentRaw);
  } catch {}
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function useConfig() {
  const config = React.useSyncExternalStore(subscribe, readConfig, () => DEFAULT_CONFIG);
  return [config, writeConfig] as const;
}
