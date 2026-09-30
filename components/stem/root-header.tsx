import Link from "next/link";
import { SiDiscord, SiGithub, SiX } from "@icons-pack/react-simple-icons";
import { CloverLogo } from "@/components/seed/clover-logo";
import { ThemeToggle } from "@/components/stem/theme-toggle";
import { siteConfig } from "@/lib/config";

const iconLink =
  "text-foreground inline-flex items-center gap-2 rounded-md transition-opacity hover:opacity-70 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none";

export function RootHeader() {
  const { github, discord, x } = siteConfig.links;

  return (
    <header className="bg-background/80 text-foreground sticky top-0 z-40 w-full backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <CloverLogo size={28} />
          <span className="text-xl font-semibold tracking-tight">Clover</span>
        </Link>

        <nav aria-label="Social" className="flex items-center gap-5 sm:gap-7">
          <Link
            href={github}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className={iconLink}
          >
            <SiGithub size={24} className="text-[#181717] dark:text-white" />
          </Link>

          {discord && (
            <Link href={discord} target="_blank" rel="noreferrer" className={iconLink}>
              <SiDiscord size={24} color="#5865F2" />
              <span className="hidden text-sm underline underline-offset-4 sm:inline">discord</span>
            </Link>
          )}

          {x && (
            <Link href={x} target="_blank" rel="noreferrer" aria-label="X" className={iconLink}>
              <SiX size={20} className="text-black dark:text-white" />
            </Link>
          )}

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
