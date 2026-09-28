import { NextResponse } from "next/server";
import { siteConfig } from "@/lib/config";

export const revalidate = 1800;

function repoPathFromUrl(url: string) {
  try {
    return new URL(url).pathname.replace(/^\/|\/$/g, "");
  } catch {
    return null;
  }
}

export async function GET() {
  const repoPath = repoPathFromUrl(siteConfig.links.github);
  if (!repoPath) return NextResponse.json({ stars: null });

  const res = await fetch(`https://api.github.com/repos/${repoPath}`, {
    headers: {
      Accept: "application/vnd.github+json",

      ...(process.env.GITHUB_TOKEN
        ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
        : {}),
    },
    next: { revalidate: 1800 },
  });

  if (!res.ok) return NextResponse.json({ stars: null });

  const data = await res.json();
  return NextResponse.json({
    stars: typeof data?.stargazers_count === "number" ? data.stargazers_count : null,
  });
}