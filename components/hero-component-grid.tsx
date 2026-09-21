"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";

const ROTATION_MS = 2800;
const TILE_CLASS = "lg:col-span-3 lg:row-span-1";

export type ComponentTile = {
  name: string;
  slug: string;
  singleDemo?: boolean;
};

function ComponentTileView({
  tile,
  demos,
  hasDoc,
  singleDemo,
}: {
  tile: ComponentTile;
  demos: React.ReactNode[];
  hasDoc: boolean;
  singleDemo?: boolean;
}) {
  const [index, setIndex] = React.useState(0);
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    if (singleDemo || demos.length <= 1) return;

    const timer = window.setInterval(() => {
      setVisible(false);

      window.setTimeout(() => {
        setIndex((current) => (current + 1) % demos.length);
        setVisible(true);
      }, 180);
    }, ROTATION_MS);

    return () => window.clearInterval(timer);
  }, [demos.length, singleDemo]);

  return (
    <div
      className={[
        "group relative min-h-0 overflow-hidden rounded-2xl",
        "border border-border/60 bg-background/80",
        "shadow-sm transition-[transform,border-color,box-shadow] duration-300 ease-out",
        "hover:-translate-y-1 hover:border-border hover:shadow-lg",
        TILE_CLASS,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-end p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="pointer-events-auto flex items-end gap-1 rounded-full border border-border bg-background/90 p-1 shadow-sm backdrop-blur">
          {hasDoc ? (
            <Link
              href={`/components/${tile.slug}`}
              className="flex items-end gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground transition-colors"
            >
              <BookOpen className="size-4 text-[#E1E900]" />
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="flex items-end gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground opacity-40"
            >
              <BookOpen className="size-4 text-[#E1E900]" />
            </button>
          )}
        </div>
      </div>

      <div className="relative flex h-full min-h-[110px] items-center justify-center p-4 sm:min-h-[130px] lg:min-h-0">
        {demos.length > 0 && (
          <div
            key={index}
            className={[
              "flex w-full items-center justify-center",
              "transition-[opacity,transform] duration-400 ease-[cubic-bezier(.22,1,.36,1)]",
              visible ? "translate-x-0 opacity-100" : "-translate-x-5 opacity-0",
            ].join(" ")}
          >
            {demos[index]}
          </div>
        )}
      </div>

      <p className="absolute bottom-2 left-2 rounded-full bg-background/50 px-2.5 py-1 text-md font-medium text-muted-foreground backdrop-blur transition-colors group-hover:text-foreground">
        {tile.name}
      </p>
    </div>
  );
}

export type DocBundle = {
  content: React.ReactNode;
  toc: { title?: string; url: string; depth: number }[];
  demos: React.ReactNode[];
  rawContent: string;
  singleDemo?: boolean;
};

export function HeroComponentGrid({
  tiles,
  docs = {},
}: {
  tiles: ComponentTile[];
  docs?: Record<string, DocBundle>;
}) {
  return (
    <main className="w-full flex-1 px-2">
      <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-12 lg:grid-rows-3 lg:min-h-[720px] lg:auto-rows-fr">
        {tiles.map((tile) => (
          <ComponentTileView
            key={tile.name}
            tile={tile}
            demos={docs[tile.slug]?.demos ?? []}
            hasDoc={!!docs[tile.slug]}
            singleDemo={docs[tile.slug]?.singleDemo}
          />
        ))}
      </div>
    </main>
  );
}