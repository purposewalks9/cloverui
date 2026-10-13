import Link from "next/link";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { siteConfig } from "@/lib/config";

export function formatStars(count: number) {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${count}`;
}

export async function getStars(): Promise<number | null> {
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
      className="text-foreground hover:text-foreground/70 focus-visible:ring-ring inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-none px-1.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <SiGithub size={14} className="shrink-0" />
      <span className="tabular-nums">{stars !== null ? formatStars(stars) : "Star"}</span>
    </Link>
  );
}
