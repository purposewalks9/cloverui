import Link from "next/link";
import { Heart } from "lucide-react";
import { siteConfig } from "@/lib/config";

const focusClass =
  "focus-visible:ring-ring rounded-none transition-colors focus-visible:ring-2 focus-visible:outline-none";

const linkClass = `${focusClass} hover:text-foreground whitespace-nowrap`;

const xUsername = siteConfig.links.x.split("/").filter(Boolean).pop();

export function SiteFooter() {
  return (
    <footer className="text-muted-foreground w-full text-sm">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 font-medium sm:px-6 md:flex-row md:items-center md:justify-between">
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
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
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className={`${linkClass} text-foreground`}
          >
            Open source
          </Link>
          <span
            aria-disabled="true"
            title="Coming soon"
            className="inline-flex cursor-not-allowed items-baseline gap-1.5 whitespace-nowrap opacity-60"
          >
            <Heart aria-hidden className="size-[0.95em] shrink-0 self-center" />
            Sponsor
          </span>
        </nav>
      </div>
    </footer>
  );
}
