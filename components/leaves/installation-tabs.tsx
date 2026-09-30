"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlockCommand } from "@/components/leaves/code-block-command";

interface InstallationTabsProps {
  item: string;
  children?: React.ReactNode;
}

export function InstallationTabs({ item, children }: InstallationTabsProps) {
  return (
    <Tabs defaultValue="cli" className="w-full">
      <TabsList className="not-prose">
        <TabsTrigger value="cli" className="rounded-md text-center">
          CLI
        </TabsTrigger>
        <TabsTrigger value="manual" className="rounded-md text-center">
          Manual
        </TabsTrigger>
      </TabsList>

      <TabsContent value="cli">
        <CodeBlockCommand item={item} />
      </TabsContent>

      <TabsContent value="manual">{children}</TabsContent>
    </Tabs>
  );
}
