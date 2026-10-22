"use client";

import * as React from "react";
import type { DocItem } from "@/lib/types";

interface DocNav {
  previous?: DocItem;
  next?: DocItem;
}

const DocNavContext = React.createContext<DocNav>({});

function DocNavProvider({ previous, next, children }: DocNav & { children: React.ReactNode }) {
  const value = React.useMemo(() => ({ previous, next }), [previous, next]);
  return <DocNavContext value={value}>{children}</DocNavContext>;
}

function useDocNav() {
  return React.use(DocNavContext);
}

export { DocNavProvider, useDocNav };
