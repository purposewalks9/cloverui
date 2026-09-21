import Link from "next/link";
import { CloverLogo } from "@/components/clover-logo";
import { SoftButton } from "@/registry/clover-ui/soft-button";
import { GitHubStars } from "@/components/github-stars";
import { siteConfig } from "@/lib/config";

export function RootHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full  items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <CloverLogo className="h-6 w-6" />
          <span className="text-sm font-semibold" style={{ color: "var(--shell-fg)" }}>
            Clover
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <SoftButton asChild size="sm" color="yellow">
              <Link href={siteConfig.links.sponsor} target="_blank" rel="noreferrer">             
                Sponsor
              </Link>
            </SoftButton>
          </div>

          <GitHubStars />
        </div>
      </div>
    </header>
  );
}