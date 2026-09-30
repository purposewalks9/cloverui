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

const pill =
  "bg-secondary text-secondary-foreground hover:bg-accent focus-visible:ring-ring inline-flex h-11 items-center justify-center rounded-full px-6 text-base font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none";

const COLUMNS = [
  { offset: "lg:mt-60", cards: [{ slug: "grain-cube", title: "Grain Cube", Demo: GrainCubeDemo }] },
  {
    offset: "",
    cards: [
      { slug: "soft-button", title: "Soft Button", Demo: SoftButtonDemo },
      { slug: "spotlight-text", title: "Spotlight Text", Demo: SpotlightTextDemo },
    ],
  },
  {
    offset: "lg:mt-20",
    cards: [
      { slug: "thermal-flow", title: "Thermal Flow", Demo: ThermalFlowDemo },
      { slug: "gauge-text", title: "Gauge Text", Demo: GaugeTextDemo },
    ],
  },
];

function ShowcaseCard({
  slug,
  title,
  Demo,
}: {
  slug: string;
  title: string;
  Demo: () => React.ReactNode;
}) {
  return (
    <div className="bg-secondary group relative aspect-[473/302] w-full overflow-hidden rounded-3xl">
      <LazyMount className="flex h-full w-full items-center justify-center p-6">
        <Demo />
      </LazyMount>

      <span className="text-muted-foreground pointer-events-none absolute bottom-4 left-5 text-sm font-medium">
        {title}
      </span>

      <Link
        href={`/components/${slug}`}
        aria-label={`Open ${title}`}
        className="bg-muted text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-4 right-4 flex size-7 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        <ArrowUpRight className="size-3.5" />
      </Link>
    </div>
  );
}

export default async function Home() {
  const [firstSlug] = await getPublishedSlugs();

  return (
    <div className="relative flex min-h-dvh flex-col">
      <RootHeader />

      <main className="mx-auto w-full max-w-7xl flex-1 px-5 pt-10 pb-24 sm:px-8">
        <section className="flex flex-col-reverse gap-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex max-w-2xl flex-col gap-6 lg:pt-20">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Components for Design Engineers
            </h1>
            <p className="text-foreground/80 text-lg leading-relaxed sm:text-xl">
              A large collection of high-quality React components that you can copy and paste into
              any project.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href={`/components/${firstSlug ?? ""}`} className={pill}>
                Browse components
              </Link>
              <Link href="/sponsor" className={pill}>
                Sponsor
              </Link>
            </div>
          </div>

          <div className="flex flex-col items-start gap-8 lg:items-end">
            <Link href="/sponsor" className={pill}>
              Sponsors
            </Link>
            <div className="flex gap-5">
              {[0, 1, 2].map((i) => (
                <Link
                  key={i}
                  href="/sponsor"
                  aria-label="Become a sponsor"
                  className="bg-muted text-muted-foreground hover:text-foreground focus-visible:ring-ring flex size-24 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none sm:size-36"
                >
                  <Plus className="size-6" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-label="Featured components"
          className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-x-24 lg:gap-y-0"
        >
          {COLUMNS.map((column, i) => (
            <div key={i} className={cn("flex flex-col gap-8 lg:gap-32", column.offset)}>
              {column.cards.map((card) => (
                <ShowcaseCard key={card.slug} {...card} />
              ))}
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
