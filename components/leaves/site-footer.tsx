import Link from "next/link";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { Heart } from "lucide-react";
import { siteConfig } from "@/lib/config";

const focusClass =
  "focus-visible:ring-ring rounded-none transition-colors focus-visible:ring-2 focus-visible:outline-none";

const linkClass = `${focusClass} hover:text-foreground whitespace-nowrap`;

const xUsername = siteConfig.links.x.split("/").filter(Boolean).pop();

export function SiteFooter() {
  return (
    <footer className="text-muted-foreground w-full text-sm font-medium">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-4 px-4 pt-12 pb-8 text-center sm:px-6 md:flex-row md:justify-between md:gap-8 md:pt-16 md:pb-6 md:text-left">
        <p className="flex flex-col items-center gap-1.5 md:flex-row md:gap-4">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            Made with care by
            <Link
              href={siteConfig.links.x}
              target="_blank"
              rel="noreferrer"
              className={`${linkClass} text-foreground inline-flex items-center gap-1.5`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://unavatar.io/x/${xUsername}?v=2`}
                alt=""
                width={20}
                height={20}
                className="bg-muted ring-foreground/10 size-5 rounded-full object-cover ring-1"
              />
              Purpose
            </Link>
          </span>
          <span className="whitespace-nowrap">
            © {new Date().getFullYear()}. All rights reserved.
          </span>
        </p>
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
        >
          <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className={`${linkClass} text-foreground inline-flex items-center gap-1.5`}
          >
            <SiGithub size={14} aria-hidden className="shrink-0" />
            Open source
          </Link>
          <Link
            href={siteConfig.links.sponsor}
            target="_blank"
            rel="noreferrer"
            className={`${linkClass} inline-flex items-center gap-1.5`}
          >
            <Heart aria-hidden className="size-3.5 shrink-0 text-[#db2777] dark:text-[#f472b6]" />
            <span className="sponsor-gradient">Sponsor</span>
          </Link>
        </nav>
      </div>
    </footer>
  );
}
