import Link from "next/link";
import { CloverLogo } from "@/components/seed/clover-logo";
import { GitHubStars } from "@/components/seed/github-stars";
import { MobileMenu } from "@/components/stem/mobile-menu";
import { SearchForm } from "@/components/stem/command-menu";
import { ThemeToggle } from "@/components/stem/theme-toggle";
import { getDocSchema } from "@/lib/doc";
import { getPublishedSlugs } from "@/lib/slugs";

const navLink =
  "text-muted-foreground hover:text-foreground rounded-sm transition-colors focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none";

export async function RootHeader() {
  const [docSchema, [firstSlug]] = await Promise.all([getDocSchema(), getPublishedSlugs()]);

  return (
    <header className="bg-background/80 text-foreground sticky top-0 z-40 w-full backdrop-blur">
      <div className="flex h-14 w-full items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-1.5">
            <CloverLogo size={22} />
            <span className="font-medium tracking-tight whitespace-nowrap">Clover UI</span>
          </Link>

          <nav
            aria-label="Main"
            className="hidden items-center gap-5 text-sm whitespace-nowrap md:flex"
          >
            <Link href="/docs/introduction" className={navLink}>
              Docs
            </Link>
            <Link href={`/components/${firstSlug ?? ""}`} className={navLink}>
              Components
            </Link>
            <Link href="/sponsor" className={navLink}>
              Sponsor
            </Link>
          </nav>
        </div>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <SearchForm docSchema={docSchema} className="h-9 w-48 rounded-xl [&>span]:rounded-lg" />
          <GitHubStars />
          <ThemeToggle />
        </div>
        <MobileMenu docSchema={docSchema} githubStars={<GitHubStars />} />
      </div>
    </header>
  );
}
