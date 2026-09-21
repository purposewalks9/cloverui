"use client";

import * as React from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { siteConfig } from "@/lib/config";

function formatStars(count: number) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${count}`;
}

export function GitHubStars() {
  const [stars, setStars] = React.useState<number | null>(null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    const controller = new AbortController();
    fetch("/api/github-stars", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => {
        if (typeof data?.stars === "number") setStars(data.stars);
        else setFailed(true);
      })
      .catch((err) => {
        if (err?.name !== "AbortError") setFailed(true);
      });
    return () => controller.abort();
  }, []);

  const label = stars !== null ? `${formatStars(stars)} stars on GitHub` : "Star on GitHub";

  return (
    <Link
      href={siteConfig.links.github}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="group inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full border border-input bg-background px-2.5 text-xs font-medium text-foreground shadow-none transition-colors hover:bg-accent"
    >
      <Star className="size-3.5 shrink-0 fill-current transition-transform group-hover:scale-110" />
      <span>
        {stars !== null ? (
          formatStars(stars)
        ) : failed ? (
          "Star"
        ) : (
          <span className="inline-block h-3 w-5 animate-pulse rounded bg-current/20 align-middle" />
        )}
      </span>
    </Link>
  );
}