import Link from "next/link";
import { CloverLogo } from "@/components/clover-logo";
import { SoftButton } from "@/registry/clover-ui/soft-button";
import { GitHubStars } from "@/components/github-stars";
import { ThemeToggle } from "@/components/theme-toggle";
import { ColorSelector } from "@/components/playground/color-selector";

export function RootHeader() {
  return (
    <header className="sticky top-0 z-40 w-full bg-background text-foreground border-b border-border">
      <div className="mx-auto flex h-16 w-full  items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <CloverLogo className="h-6 w-6" />
          <span className="text-sm font-semibold text-foreground">
            Clover
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <SoftButton asChild size="sm" color="yellow">
              <Link href="/sponsor">
                Sponsor
              </Link>
            </SoftButton>
          </div>

          <ColorSelector />
          <ThemeToggle />
          <GitHubStars />
        </div>
      </div>
    </header>
  );
}