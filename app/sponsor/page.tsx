import Link from "next/link";
import { Code2, Rocket, Sparkles, Wrench, Heart } from "lucide-react";
import type { Metadata } from "next";
import { RootHeader } from "@/components/stem/root-header";
import { CloverLogo } from "@/components/seed/clover-logo";
import { SoftButton } from "@/registry/clover-ui/soft-button";
import { siteConfig } from "@/lib/config";
import { constructMetadata } from "@/lib/utils";

export const metadata: Metadata = constructMetadata({
  title: "Sponsor Clover UI",
  description: "Help keep Clover UI free, open source and actively maintained.",
});

const perks = [
  {
    icon: Sparkles,
    title: "New components",
    body: "Your support pays for the time it takes to design, build and polish new motion-first components.",
  },
  {
    icon: Wrench,
    title: "Maintenance",
    body: "Bug fixes, accessibility work, responsive tweaks and dependency updates stay on schedule.",
  },
  {
    icon: Code2,
    title: "Better docs",
    body: "Clearer guides, live playgrounds and examples that make every component easy to adopt.",
  },
  {
    icon: Rocket,
    title: "Faster releases",
    body: "Sponsors let me spend more hours on Clover UI, so improvements ship sooner.",
  },
];

export default function SponsorPage() {
  return (
    <div className="relative flex min-h-dvh flex-col">
      <RootHeader />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center px-5 py-16 sm:px-8 sm:py-24">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="border-border bg-card flex size-16 items-center justify-center rounded-2xl border">
            <CloverLogo size={36} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Sponsor Clover UI</h1>
          <p className="text-muted-foreground max-w-xl text-base font-medium sm:text-lg">
            Clover UI is free and open source under the MIT license. If it saves you time,
            sponsoring keeps it that way and helps it grow.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <SoftButton asChild size="lg" color="yellow">
              <Link href={siteConfig.links.sponsor} target="_blank" rel="noreferrer">
                <Heart />
                Sponsor on GitHub
              </Link>
            </SoftButton>
            <SoftButton asChild size="lg" color="green">
              <Link href={siteConfig.links.github} target="_blank" rel="noreferrer">
                Star the repo
              </Link>
            </SoftButton>
          </div>
        </div>

        <section className="mt-20 w-full">
          <h2 className="mb-8 text-center text-xl font-semibold tracking-tight sm:text-2xl">
            Where your support goes
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {perks.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="border-border bg-card hover:bg-secondary flex flex-col gap-3 rounded-2xl border p-6 transition-colors duration-200"
              >
                <div className="border-border bg-secondary flex size-10 items-center justify-center rounded-xl border">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="text-muted-foreground mt-16 max-w-md text-center text-sm font-medium">
          Can&apos;t sponsor? Starring the repo, sharing Clover UI or opening a pull request helps
          just as much. See the{" "}
          <Link
            href={`${siteConfig.links.github}/blob/main/CONTRIBUTING.md`}
            target="_blank"
            rel="noreferrer"
            className="text-foreground underline underline-offset-4"
          >
            contributing guide
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
