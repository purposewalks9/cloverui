import Link from "next/link";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { Heart } from "lucide-react";
import { CloverLogo } from "@/components/seed/clover-logo";
import { GlitchGroup, GlitchName } from "@/components/stem/glitch-brand";
import { siteConfig } from "@/lib/config";

const focusClass =
  "focus-visible:ring-ring rounded-none transition-colors focus-visible:ring-2 focus-visible:outline-none";

const linkClass = `${focusClass} hover:text-foreground decoration-border hover:decoration-foreground whitespace-nowrap underline underline-offset-4`;

const xUsername = siteConfig.links.x.split("/").filter(Boolean).pop();

export function SiteFooter() {
  return (
    <footer className="text-muted-foreground mx-auto w-full max-w-6xl px-4 text-sm font-medium sm:px-6">
      <div className="gradient-line-t relative flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-6">
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <GlitchGroup className="text-foreground items-center gap-1.5 font-semibold whitespace-nowrap">
            <CloverLogo size={18} />
            <GlitchName>{siteConfig.name}</GlitchName>© {new Date().getFullYear()}
          </GlitchGroup>
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
                src={`https://unavatar.io/x/${xUsername}`}
                alt=""
                width={20}
                height={20}
                className="bg-muted ring-foreground/10 size-5 rounded-full object-cover ring-1"
              />
              Purpose
            </Link>
          </span>
        </p>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className={`${linkClass} inline-flex items-center gap-1.5`}
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
