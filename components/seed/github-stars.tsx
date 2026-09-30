import Link from "next/link";
import { Star } from "lucide-react";
import { siteConfig } from "@/lib/config";

function formatStars(count: number) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${count}`;
}

async function getStars(): Promise<number | null> {
  try {
    const repoPath = new URL(siteConfig.links.github).pathname.replace(/^\/|\/$/g, "");
    const res = await fetch(`https://api.github.com/repos/${repoPath}`, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.stargazers_count === "number" ? data.stargazers_count : null;
  } catch {
    return null;
  }
}

export async function GitHubStars() {
  const stars = await getStars();
  const label = stars !== null ? `${formatStars(stars)} stars on GitHub` : "Star on GitHub";

  return (
    <Link
      href={siteConfig.links.github}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="group border-input bg-background text-foreground hover:bg-accent inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full border px-2.5 text-xs font-medium shadow-none transition-colors"
    >
      <Star className="size-3.5 shrink-0 fill-current transition-transform group-hover:scale-110" />
      <span>{stars !== null ? formatStars(stars) : "Star"}</span>
    </Link>
  );
}
