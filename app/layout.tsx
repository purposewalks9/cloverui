
import type { Metadata } from "next";
import { constructMetadata } from "@/lib/utils";
import Script from "next/script";
import {
  DynaPuff,
  Geist,
  Geist_Mono,
  Instrument_Serif,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { JotaiProvider } from "@/components/providers";
import AnimatedGradient from "@/components/animated-gradient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
  preload: false,
});

const dynaPuff = DynaPuff({
  variable: "--font-dyna-puff",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = constructMetadata({
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
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${dynaPuff.variable} relative isolate min-h-dvh overflow-x-hidden bg-[#050505] text-foreground antialiased font-sans`}
        suppressHydrationWarning
      >
        <JotaiProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <AnimatedGradient
              config={{
                preset: "custom",
                color1: "#1b1500",
                color2: "#1b1500",
                color3: "#3a2e01",
                speed: 0,
                rotation: -35,
                proportion: 42,
                scale: 3,
                distortion: 20,
                swirl: 38,
                swirlIterations: 20,
                softness: 500,
                shape: "Checks",
                shapeSize: 35,
              }}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 0,
                opacity: 1,
                pointerEvents: "none",
              }}
            />

            <div className="pointer-events-none fixed inset-0 z-[1] bg-[#050505]/35" />

            <div className="relative z-10 min-h-dvh">
              {children}
            </div>
          </ThemeProvider>
        </JotaiProvider>

        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}