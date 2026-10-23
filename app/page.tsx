import Link from "next/link";
import { LazyMount } from "@/components/shared/lazy-mount";
import { SponsorButton } from "@/components/shared/sponsor-button";
import { SiteFooter } from "@/components/layout/site-footer";
import { HomeHeader } from "@/components/layout/home-header";
import { siteConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { BlockText } from "@/registry/clover-ui/block-text";
import {
  ClickyPreview,
  CursorTagPreview,
  DropTextPreview,
  PriceRangePreview,
  GrainCubePreview,
  GridRevealPreview,
  LiquidButtonPreview,
  BlockTextPreview,
  NucleusPreview,
  SignPadPreview,
  SoftButtonPreview,
  SwitchPreview,
} from "@/components/home/bento-previews";
import { BentoActiveCard, BentoActiveProvider } from "@/components/home/bento-active";

const HERO_WORDS = ["buttons", "controls", "cursors", "loaders", "effects"];

interface BentoItem {
  slug: string;
  title: string;
  Demo: () => React.ReactNode;
  className: string;
}

const ROWS: { grid: string; items: BentoItem[] }[] = [
  {
    grid: "auto-rows-[13rem] lg:grid-cols-4",
    items: [
      { slug: "nucleus-text", title: "Nucleus Text", Demo: NucleusPreview, className: "" },
      { slug: "grid-reveal", title: "Grid Reveal", Demo: GridRevealPreview, className: "" },
      { slug: "drop-text", title: "Drop Text", Demo: DropTextPreview, className: "" },
      { slug: "cursor-tag", title: "Cursor Tag", Demo: CursorTagPreview, className: "" },
      { slug: "liquid-button", title: "Liquid Button", Demo: LiquidButtonPreview, className: "" },
      { slug: "clicky", title: "Clicky", Demo: ClickyPreview, className: "" },
      { slug: "price-range", title: "Price Range", Demo: PriceRangePreview, className: "" },
      { slug: "grain-cube", title: "Grain Cube", Demo: GrainCubePreview, className: "" },
    ],
  },
  {
    grid: "auto-rows-[15rem] lg:grid-cols-5",
    items: [
      { slug: "block-text", title: "Block Text", Demo: BlockTextPreview, className: "" },
      { slug: "soft-button", title: "Soft Button", Demo: SoftButtonPreview, className: "" },
      { slug: "sign-pad", title: "Sign Pad", Demo: SignPadPreview, className: "col-span-2" },
      {
        slug: "switch",
        title: "Switch",
        Demo: SwitchPreview,
        className: "col-span-2 lg:col-span-1",
      },
    ],
  },
];

const TOTAL_CARDS = ROWS.reduce((sum, row) => sum + row.items.length, 0);

function BentoCard({ Demo, className, index }: BentoItem & { index: number }) {
  return (
    <BentoActiveCard index={index} className={className}>
      <LazyMount rootMargin="200px" className="flex w-full flex-1 items-center justify-center p-6">
        <Demo />
      </LazyMount>
    </BentoActiveCard>
  );
}

export default function HomePage() {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <HomeHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-12 pb-24 sm:px-6 sm:pt-16">
        <section>
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
            <h1 className="text-3xl font-medium tracking-tight text-balance sm:text-4xl">
              Crafted{" "}
              <BlockText
                words={HERO_WORDS}
                colors={["#9333ea", "#dc2626", "#db2777"]}
                textColor="#fafafa"
                className="mx-1 text-[length:inherit] font-semibold [--block-h:1.6em] [--block-px:0.12em]"
              />{" "}
              for thoughtful interfaces.
            </h1>
            <p className="text-muted-foreground max-w-md text-base leading-relaxed text-pretty sm:text-lg">
              {siteConfig.description}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/docs/introduction"
                className="border-border focus-visible:ring-ring inline-flex h-9 shrink-0 items-center justify-center border bg-white px-4 text-sm font-medium whitespace-nowrap text-[#171717] transition-[filter] hover:brightness-95 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none dark:bg-black dark:text-white dark:hover:brightness-125"
              >
                <span className="sponsor-gradient">Get started</span>
              </Link>
              <SponsorButton />
            </div>
          </div>
        </section>

        <section aria-label="Components" className="mt-16">
          <BentoActiveProvider total={TOTAL_CARDS}>
            <div className="flex flex-col gap-4">
              {ROWS.map((row, r) => {
                const offset = ROWS.slice(0, r).reduce((sum, prev) => sum + prev.items.length, 0);
                return (
                  <div key={r} className={cn("grid grid-cols-2 gap-4", row.grid)}>
                    {row.items.map((card, i) => (
                      <BentoCard key={card.slug} index={offset + i} {...card} />
                    ))}
                  </div>
                );
              })}
            </div>
          </BentoActiveProvider>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
