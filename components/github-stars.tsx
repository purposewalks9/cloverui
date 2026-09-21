"use client";

import * as React from "react";
import Link from "next/link";
import { Star } from "lucide-react";
import { siteConfig } from "@/lib/config";

function formatStars(count: number) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return `${count}`;
}

function repoPathFromUrl(url: string) {
  try {
    return new URL(url).pathname.replace(/^\/|\/$/g, "");
  } catch {
    return null;
  }
}

export function GitHubStars() {
  const [stars, setStars] = React.useState<number | null>(null);
  const repoPath = React.useMemo(
    () => repoPathFromUrl(siteConfig.links.github),
    []
  );

  React.useEffect(() => {
    if (!repoPath) return;
    let cancelled = false;

    fetch(`https://api.github.com/repos/${repoPath}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.stargazers_count === "number") {
          setStars(data.stargazers_count);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [repoPath]);

  return (
    <Link
      href={siteConfig.links.github}
      target="_blank"
      rel="noreferrer"
      title="Star on GitHub"
      className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full border border-input bg-background px-2.5 text-xs font-medium text-foreground shadow-none transition-colors hover:bg-accent group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:px-0"
    >
      <Star className="size-3.5 fill-current" />
      <span className="group-data-[collapsible=icon]:hidden">
        {stars !== null ? formatStars(stars) : "Star"}
      </span>
    </Link>
  );
}
