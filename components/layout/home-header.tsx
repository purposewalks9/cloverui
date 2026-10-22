import Link from "next/link";
import { CloverLogo } from "@/components/icons/clover-logo";
import { GlitchGroup, GlitchName } from "@/components/layout/glitch-brand";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { CommandMenu } from "@/components/layout/command-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { getDocSchema } from "@/lib/doc";

const navLink =
  "text-muted-foreground hover:text-foreground rounded-none transition-colors focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none";

export async function HomeHeader() {
  const docSchema = await getDocSchema();

  return (
    <header className="bg-background/80 text-foreground sticky top-0 z-40 w-full backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 md:gap-6">
          <div className="-ml-2 md:hidden">
            <MobileMenu docSchema={docSchema} />
          </div>
          <GlitchGroup className="shrink-0">
            <Link href="/" className="flex shrink-0 items-center gap-1.5">
              <CloverLogo size={22} />
              <GlitchName className="font-medium tracking-tight">Clover UI</GlitchName>
            </Link>
          </GlitchGroup>

          <nav
            aria-label="Main"
            className="hidden items-center gap-5 text-sm whitespace-nowrap md:flex"
          >
            <Link href="/docs/introduction" className={navLink}>
              Docs
            </Link>
            <Link href="/docs/installation" className={navLink}>
              Installation
            </Link>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <CommandMenu docSchema={docSchema} nav className="hidden w-40 md:inline-flex" />
          <CommandMenu docSchema={docSchema} nav compact shortcut={false} className="md:hidden" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
