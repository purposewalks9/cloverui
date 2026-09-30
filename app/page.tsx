import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { RootHeader } from "@/components/stem/root-header";
import { LazyMount } from "@/components/leaves/lazy-mount";
import { getPublishedSlugs } from "@/lib/slugs";
import { cn } from "@/lib/utils";
import { Demo as GrainCubeDemo } from "@/docs/grain-cube/demo";
import { Demo as SoftButtonDemo } from "@/docs/soft-button/demo";
import { Demo as SpotlightTextDemo } from "@/docs/spotlight-text/demo";
import { Demo as ThermalFlowDemo } from "@/docs/thermal-flow/demo";
import { Demo as GaugeTextDemo } from "@/docs/gauge-text/demo";
import { CandleChartStick } from "@/registry/clover-ui/candlestick-chart";
import { data as candles } from "@/docs/candlestick-chart/demo";

function CandlestickPreview() {
  return (
    <CandleChartStick
      data={candles.slice(-60)}
      name="CLVR"
      zoomable={false}
      showXAxis={false}
      formatValue={(v) => `$${v.toFixed(2)}`}
    />
  );
}

const pill =
  "bg-secondary text-secondary-foreground hover:bg-accent focus-visible:ring-ring inline-flex h-11 items-center justify-center rounded-full px-6 text-base font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none";

const BENTO = [
  {
    slug: "grain-cube",
    title: "Grain Cube",
    Demo: GrainCubeDemo,
    className: "md:col-span-2 lg:row-span-2",
  },
  {
    slug: "thermal-flow",
    title: "Thermal Flow",
    Demo: ThermalFlowDemo,
    className: "md:col-span-2",
  },
  { slug: "soft-button", title: "Soft Button", Demo: SoftButtonDemo, className: "" },
  { slug: "gauge-text", title: "Gauge Text", Demo: GaugeTextDemo, className: "" },
  {
    slug: "spotlight-text",
    title: "Spotlight Text",
    Demo: SpotlightTextDemo,
    className: "md:col-span-2",
  },
  {
    slug: "candlestick-chart",
    title: "Candlestick Chart",
    Demo: CandlestickPreview,
    className: "md:col-span-2",
  },
];

function BentoCard({
  slug,
  title,
  Demo,
  className,
}: {
  slug: string;
  title: string;
  Demo: () => React.ReactNode;
  className: string;
}) {
  return (
    <div
      className={cn(
        "bg-secondary relative flex min-h-64 flex-col overflow-hidden rounded-3xl",
        className,
      )}
    >
      <LazyMount className="flex w-full flex-1 items-center justify-center p-6 pb-12">
        <Demo />
      </LazyMount>

      <span className="text-muted-foreground pointer-events-none absolute bottom-4 left-5 text-sm font-medium">
        {title}
      </span>

      <Link
        href={`/components/${slug}`}
        aria-label={`Open ${title}`}
        className="bg-muted text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-4 right-4 flex size-8 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        <ArrowUpRight className="size-4" />
      </Link>
    </div>
  );
}

export default async function Home() {
  const [firstSlug] = await getPublishedSlugs();

  return (
    <div className="relative flex min-h-dvh flex-col">
      <RootHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-5 pt-12 pb-24 sm:px-8 sm:pt-16">
        <section className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex max-w-2xl flex-col gap-6">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
              Components for Design Engineers
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed sm:text-xl">
              A large collection of high-quality React components that you can copy and paste into
              any project.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={`/components/${firstSlug ?? ""}`} className={pill}>
                Browse components
              </Link>
              <Link href="/sponsor" className={pill}>
                Sponsor
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:items-end">
            <span className="text-muted-foreground text-sm font-medium">Sponsors</span>
            <div className="flex gap-3">
              {[0, 1, 2].map((i) => (
                <Link
                  key={i}
                  href="/sponsor"
                  aria-label="Become a sponsor"
                  className="bg-secondary text-muted-foreground hover:text-foreground focus-visible:ring-ring flex size-20 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none sm:size-24"
                >
                  <Plus className="size-5" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-label="Featured components"
          className="mt-16 grid auto-rows-[18rem] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {BENTO.map((card) => (
            <BentoCard key={card.slug} {...card} />
          ))}
        </section>
      </main>
    </div>
  );
}
