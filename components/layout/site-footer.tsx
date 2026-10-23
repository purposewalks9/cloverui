import Link from "next/link";
import { Heart } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { siteConfig } from "@/lib/config";

const focusClass =
  "focus-visible:ring-ring rounded-none transition-colors focus-visible:ring-2 focus-visible:outline-none";

const linkClass = `${focusClass} hover:text-foreground whitespace-nowrap`;

const xUsername = siteConfig.links.x.split("/").filter(Boolean).pop();

export function SiteFooter() {
  return (
    <footer className="text-muted-foreground w-full text-base md:text-sm">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-4 py-8 font-medium sm:px-6 md:flex-row md:justify-between md:py-6">
        <p className="contents md:flex md:flex-wrap md:items-center md:gap-x-4">
          <span className="order-1 inline-flex items-center gap-1.5 whitespace-nowrap md:order-none">
            Made with care by
            <Link
              href={siteConfig.links.x}
              target="_blank"
              rel="noreferrer"
              className={`${linkClass} text-foreground inline-flex items-center gap-1.5`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                data-plain-stroke
                src={`https://unavatar.io/x/${xUsername}?v=2`}
                alt=""
                width={20}
                height={20}
                className="bg-muted ring-foreground/10 size-5 rounded-full object-cover ring-1"
              />
              Purpose
            </Link>
          </span>
          <span className="order-3 text-xs whitespace-nowrap md:order-none md:text-sm">
            © {new Date().getFullYear()} {siteConfig.name}
          </span>
        </p>
        <nav
          aria-label="Footer"
          className="order-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 md:order-none"
        >
          <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className={`${linkClass} text-foreground decoration-foreground/30 hover:decoration-foreground inline-flex items-baseline gap-1.5 underline underline-offset-4`}
          >
            <SiGithub aria-hidden className="size-[0.95em] shrink-0 self-center" />
            Open source
          </Link>
          <span
            aria-disabled="true"
            className="inline-flex cursor-default items-baseline gap-1 whitespace-nowrap opacity-60"
          >
            <Heart aria-hidden className="size-[0.95em] shrink-0 self-center" />
            Sponsor
          </span>
        </nav>
      </div>
    </footer>
  );
}
