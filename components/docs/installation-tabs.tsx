"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlockCommand } from "@/components/docs/code-block-command";
import { InstallNotice } from "@/components/docs/install-notice";
import { siteConfig } from "@/lib/config";

interface InstallationTabsProps {
  item: string;
  children?: React.ReactNode;
}

export function InstallationTabs({ item, children }: InstallationTabsProps) {
  if (!siteConfig.installs) return <InstallNotice />;

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
      </TabsContent>

      <TabsContent value="manual">{children}</TabsContent>
    </Tabs>
  );
}
