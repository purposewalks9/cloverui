"use client";

import * as React from "react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlockCommand } from "@/components/docs/code-block-command";

interface InstallationTabsProps {
  item: string;
  children?: React.ReactNode;
}

export function InstallationTabs({ item, children }: InstallationTabsProps) {
  return (
    <Tabs defaultValue="cli" className="w-full">
      <TabsList className="not-prose">
        <TabsTrigger value="cli" className="rounded-none text-center">
          CLI
        </TabsTrigger>
        <TabsTrigger value="manual" className="rounded-none text-center">
          Manual
        </TabsTrigger>
      </TabsList>

      <TabsContent value="cli">
        <CodeBlockCommand item={item} />
        <p className="text-muted-foreground not-prose mt-3 text-sm">
          First time? Add the Clover UI registry first. See{" "}
          <Link href="/docs/installation" className="text-foreground underline underline-offset-4">
            Installation
          </Link>
          .
        </p>
      </TabsContent>

      <TabsContent value="manual">{children}</TabsContent>
    </Tabs>
  );
}
