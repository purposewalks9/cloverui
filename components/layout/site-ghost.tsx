"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import registry from "@/registry.json";
import { guides } from "@/lib/guides";
import {
  GhostProvider,
  type GhostColor,
  type GhostReaction,
  type GhostSize,
} from "@/registry/clover-ui/ghost";

export const ghostWords = {
  hello: "boo",
  componentPage: "hi",
  guidePage: "learn",
  me: "me",
  open: "go",
  guide: "learn",
  home: "home",
  github: "star",
  starred: "yay",
  share: "share",
  shared: "shared",
  copy: "copy",
  copied: "copied",
  theme: "lights",
  dark: "spooky",
  light: "bright",
  v0: "v0",
  chatgpt: "gpt",
  claude: "claude",
  edit: "edit",
  top: "up",
  done: "done",
  replay: "again",
  search: "search",
  code: "code",
  props: "props",
  section: "jump",
};

const flavors: Record<string, string[]> = {
  text: ["fancy", "stylish", "wordy"],
  button: ["clicky", "tappy"],
  control: ["flippy", "slidey"],
  loader: ["spinny", "loading"],
  cursor: ["pointy", "buddy"],
  effect: ["magic", "sparkly"],
  background: ["dreamy", "pretty"],
  asset: ["shiny", "neat"],
  block: ["handy", "ready"],
};

const hoverLinks: [string[], string][] = [
  [["x.com", "twitter.com"], ghostWords.share],
  [["v0.dev"], ghostWords.v0],
  [["chatgpt.com"], ghostWords.chatgpt],
  [["claude.ai"], ghostWords.claude],
  [["/edit/"], ghostWords.edit],
];

const items = new Map(
  registry.items
    .filter((item) => item.name !== "all")
    .map((item) => [item.name, { title: item.title, category: item.category }]),
);

const pick = (list: string[]) => list[Math.floor(Math.random() * list.length)];

export function sectionWord(text: string | null | undefined) {
  const words = (text ?? "").toLowerCase().match(/[a-z0-9]+/g) ?? [];
  return (
    words.reduce((best, word) => (word.length > best.length ? word : best), "") ||
    ghostWords.section
  );
}

const react: GhostReaction = (target, kind) => {
  const press = kind === "press";
  const link = target.closest("a[href]");
  const href = link?.getAttribute("href") ?? "";
  const label = target.closest("[aria-label]")?.getAttribute("aria-label") ?? "";
  const text = target.closest("a, button")?.textContent?.trim() ?? "";

  if (href.startsWith("/docs/")) {
    const slug = href.split("/")[2];
    const item = items.get(slug);
    if (!item) return ghostWords.guide;
    if (slug === "ghost") return ghostWords.me;
    if (press) return ghostWords.open;
    return pick(flavors[item.category ?? ""] ?? ["ooh"]);
  }
  if (href === "/") return ghostWords.home;
  if (href.startsWith("#")) return press ? null : sectionWord(link?.textContent);
  const hoverLink = hoverLinks.find(([parts]) => parts.some((part) => href.includes(part)));
  if (hoverLink) return press ? null : hoverLink[1];
  if (href.includes("github.com")) return press ? ghostWords.starred : ghostWords.github;

  if (/^cop/i.test(label) || /^cop/i.test(text)) return press ? null : ghostWords.copy;
  if (label.startsWith("Switch to")) return press ? null : ghostWords.theme;
  if (label.startsWith("Select ") && label.endsWith(" color")) return label.slice(7, -6);
  if (label === "Refresh component" || label === "Replay") return ghostWords.replay;
  if (text === "Back to top") return press ? null : ghostWords.top;

  const tab = target.closest("[role='tab']")?.textContent?.trim().toLowerCase();
  if (tab && ["pnpm", "npm", "yarn", "bun"].includes(tab)) return tab;
  if (text.includes("Search")) return ghostWords.search;
  if (target.closest("pre")) return ghostWords.code;
  if (target.closest("table")) return ghostWords.props;
  return null;
};

function greeting(pathname: string) {
  if (pathname === "/") return ghostWords.hello;
  const [, section, slug] = pathname.split("/");
  if (section !== "docs") return undefined;
  if (items.has(slug)) return ghostWords.componentPage;
  if (guides.some((entry) => entry.id === slug)) return ghostWords.guidePage;
  return undefined;
}

interface Look {
  color: GhostColor;
  size: GhostSize;
}

const DEFAULT_LOOK: Look = { color: "lilac", size: "lg" };

const LookContext = React.createContext<(look: Look | null) => void>(() => {});

export function useSiteGhostLook() {
  return React.useContext(LookContext);
}

const GUIDE_KEY = "clover-guide";
const guideListeners = new Set<() => void>();

function readGuide() {
  try {
    return window.localStorage.getItem(GUIDE_KEY) === "on";
  } catch {
    return false;
  }
}

function writeGuide(on: boolean) {
  try {
    window.localStorage.setItem(GUIDE_KEY, on ? "on" : "off");
  } catch {}
  guideListeners.forEach((listener) => listener());
}

function subscribeGuide(listener: () => void) {
  guideListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    guideListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

interface Guide {
  shown: boolean;
  turnOn: () => void;
  turnOff: () => void;
}

const GuideContext = React.createContext<Guide>({
  shown: false,
  turnOn: () => {},
  turnOff: () => {},
});

export function useSiteGhostGuide() {
  return React.useContext(GuideContext);
}

export function SiteGhostProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [look, setLook] = React.useState<Look | null>(null);
  const { color, size } = look ?? DEFAULT_LOOK;
  const enabled = React.useSyncExternalStore(subscribeGuide, readGuide, () => false);
  const [dismissedOn, setDismissedOn] = React.useState<string | null>(null);
  const [lastPath, setLastPath] = React.useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setDismissedOn(null);
  }
  const onGhostPage = pathname === "/docs/ghost";
  const shown = enabled || (onGhostPage && dismissedOn !== pathname);

  const guide = React.useMemo<Guide>(
    () => ({
      shown,
      turnOn: () => {
        setDismissedOn(null);
        writeGuide(true);
      },
      turnOff: () => {
        setDismissedOn(pathname);
        writeGuide(false);
      },
    }),
    [shown, pathname],
  );

  return (
    <LookContext.Provider value={setLook}>
      <GuideContext.Provider value={guide}>
        <GhostProvider
          ghost={shown}
          color={color}
          size={size}
          reactions={react}
          message={greeting(pathname)}
        >
          {children}
        </GhostProvider>
      </GuideContext.Provider>
    </LookContext.Provider>
  );
}
