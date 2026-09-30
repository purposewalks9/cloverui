import Link from "next/link";
import { RootHeader } from "@/components/stem/root-header";
import { LazyMount } from "@/components/leaves/lazy-mount";
import { getPublishedSlugs } from "@/lib/slugs";
import { cn } from "@/lib/utils";
import { RichText } from "@/registry/clover-ui/rich-text";
import { SoftButton, type SoftColor } from "@/registry/clover-ui/soft-button";
import {
  AppleMusicPreview,
  DropTextPreview,
  GaugePreview,
  GrainCubePreview,
  GridRevealPreview,
  NucleusPreview,
  RichProgressPreview,
  SoftButtonPreview,
  SpotlightPreview,
  TokenFallPreview,
} from "@/components/leaves/bento-previews";
import { BentoActiveCard, BentoActiveProvider } from "@/components/leaves/bento-active";
import { CandlestickPreview } from "@/components/leaves/candlestick-preview";
import { Demo as PulseLoaderDemo } from "@/docs/pulse-loader/demo";

type BentoItem = {
  slug: string;
  title: string;
  Demo: () => React.ReactNode;
  className: string;
};

// Row 1: text components. Row 2: visual ones, ending with the loader.
// Row 3: the chart across two columns, then two tall cards.
const ROWS: { grid: string; items: BentoItem[] }[] = [
  {
    grid: "auto-rows-[13rem] lg:grid-cols-4",
    items: [
      { slug: "nucleus-text", title: "Nucleus Text", Demo: NucleusPreview, className: "" },
      { slug: "gauge-text", title: "Gauge Text", Demo: GaugePreview, className: "" },
      { slug: "drop-text", title: "Drop Text", Demo: DropTextPreview, className: "" },
      { slug: "spotlight-text", title: "Spotlight Text", Demo: SpotlightPreview, className: "" },
    ],
  },
  {
    grid: "auto-rows-[15rem] lg:grid-cols-5",
    items: [
      { slug: "grain-cube", title: "Grain Cube", Demo: GrainCubePreview, className: "" },
      { slug: "soft-button", title: "Soft Button", Demo: SoftButtonPreview, className: "" },
      { slug: "rich-progress", title: "Rich Progress", Demo: RichProgressPreview, className: "" },
      { slug: "grid-reveal", title: "Grid Reveal", Demo: GridRevealPreview, className: "" },
      // Five cards leave one alone on the 2-column phone grid, so it takes the full row there.
      {
        slug: "pulse-loader",
        title: "Pulse Loader",
        Demo: PulseLoaderDemo,
        className: "col-span-2 lg:col-span-1",
      },
    ],
  },
  {
    grid: "auto-rows-[22rem] lg:grid-cols-4",
    items: [
      {
        slug: "candlestick-chart",
        title: "Candlestick Chart",
        Demo: CandlestickPreview,
        className: "col-span-2",
      },
      {
        slug: "apple-music-card",
        title: "Apple Music Card",
        Demo: AppleMusicPreview,
        className: "",
      },
      { slug: "token-fall", title: "Token Fall", Demo: TokenFallPreview, className: "" },
    ],
  },
];

const TOTAL_CARDS = ROWS.reduce((sum, row) => sum + row.items.length, 0);

function BentoCard({ Demo, className, index }: BentoItem & { index: number }) {
  return (
    <BentoActiveCard index={index} className={className}>
      <LazyMount className="flex w-full flex-1 items-center justify-center p-6">
        <Demo />
      </LazyMount>
    </BentoActiveCard>
  );
}

// Renders one soft button per theme so the color flips with the theme toggle,
// without waiting for the client to know which theme is active.
function ThemeSoftButton({
  href,
  light,
  dark,
  children,
}: {
  href: string;
  light: SoftColor;
  dark: SoftColor;
  children: React.ReactNode;
}) {
  return (
    <>
      <span className="dark:hidden">
        <SoftButton asChild size="sm" color={light}>
          <Link href={href}>{children}</Link>
        </SoftButton>
      </span>
      <span className="hidden dark:inline">
        <SoftButton asChild size="sm" color={dark}>
          <Link href={href}>{children}</Link>
        </SoftButton>
      </span>
    </>
  );
}

export default async function Home() {
  const slugs = await getPublishedSlugs();
  const [firstSlug] = slugs;

  return (
    <div className="relative flex min-h-dvh flex-col">
      <RootHeader />

      <main className="w-full flex-1 px-5 pt-12 pb-24 sm:px-8 sm:pt-16">
        <section>
          <div className="flex max-w-2xl flex-col gap-6">
            <h1 className="text-3xl font-medium tracking-tight text-balance sm:text-4xl">
              <RichText>Crafted components for thoughtful interfaces.</RichText>
            </h1>
            <p className="text-muted-foreground max-w-xl text-base leading-relaxed text-pretty sm:text-lg">
              A growing library of shaders, physics and motion primitives for React and Tailwind
              CSS. Open source, and ready to drop into your next project.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <ThemeSoftButton href={`/components/${firstSlug ?? ""}`} light="black" dark="white">
                Components
              </ThemeSoftButton>
              <span className="bg-secondary text-muted-foreground inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-medium">
                <span aria-hidden className="size-1.5 rounded-full bg-[var(--brand)]" />
                New component every week
              </span>
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
    </div>
  );
}
