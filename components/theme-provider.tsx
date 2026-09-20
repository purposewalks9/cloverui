"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      {...props}
      // Always dark, no matter what the OS or any parent says.
      forcedTheme="dark"
      enableSystem={false}
    >
      {children}
    </NextThemesProvider>
  );
}