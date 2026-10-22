import type { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SiteGhostProvider } from "@/components/layout/site-ghost";

const instrumentSerif = localFont({
  src: "./fonts/InstrumentSerif-Regular.woff2",
  variable: "--font-instrument-serif",
  weight: "400",
  display: "swap",
  preload: false,
});

const dynaPuff = localFont({
  src: "./fonts/DynaPuff-Variable.woff2",
  variable: "--font-dyna-puff",
  weight: "400 700",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = buildMetadata({
  title: "Clover UI",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} ${instrumentSerif.variable} ${dynaPuff.variable} bg-background text-foreground relative isolate min-h-dvh overflow-x-hidden font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          enableColorScheme
          disableTransitionOnChange
        >
          <SiteGhostProvider>
            <div className="relative z-10 min-h-dvh">{children}</div>
          </SiteGhostProvider>
        </ThemeProvider>

        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
