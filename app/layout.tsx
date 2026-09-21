import type { Metadata } from "next";
import { constructMetadata } from "@/lib/utils";
import Script from "next/script";
import {
  DynaPuff,
  Geist,
  Geist_Mono,
  Instrument_Serif,
} from "next/font/google";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { JotaiProvider } from "@/components/providers";

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
});

const dynaPuff = DynaPuff({
  variable: "--font-dyna-puff",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} ${dynaPuff.variable} min-h-dvh bg-background text-foreground antialiased font-sans`}
        suppressHydrationWarning
      >
        <JotaiProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </JotaiProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
