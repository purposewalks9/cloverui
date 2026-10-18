"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CloverLogo } from "@/components/seed/clover-logo";
import { GlitchGroup, GlitchName } from "@/components/stem/glitch-brand";
import type { DocSchema } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar({ docSchema }: { docSchema: DocSchema }) {
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  const navGroups = docSchema.filter((group) => group.items.length > 0);

  if (isMobile) return null;

  return (
    <Sidebar collapsible="offcanvas" className="border-sidebar-border bg-sidebar border-r">
      <SidebarHeader className="h-12 shrink-0 justify-center gap-0 px-4 py-0">
        <GlitchGroup>
          <Link
            href="/"
            className="group/logo flex items-center gap-2 px-2 transition-opacity duration-200"
          >
            <span className="flex shrink-0 items-center justify-center">
              <CloverLogo size={20} />
            </span>
            <span className="text-[16px] tracking-tight">
              <GlitchName className="font-meduim">Clover UI</GlitchName>
            </span>
          </Link>
        </GlitchGroup>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {navGroups.map((group) => (
          <SidebarGroup key={group.title} className="">
            <SidebarGroupLabel className="text-foreground mb-1 h-8 text-[15px] font-medium">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0">
                {group.items.map((item) => {
                  const href = item.href;
                  const isActive = pathname === href;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="text-muted-foreground hover:text-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-foreground h-9 rounded-none text-[15px] font-normal transition-all duration-200 hover:bg-transparent data-[active=true]:border-[var(--brand)]"
                      >
                        <Link href={href}>
                          <span className={cn(isActive && "sponsor-gradient font-medium")}>
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
