"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github, Heart } from "lucide-react";
import { siteConfig } from "@/lib/config";
import { CloverLogo } from "@/components/clover-logo";
import type { DocSchema } from "@/lib/types";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar({ docSchema }: { docSchema: DocSchema }) {
  const pathname = usePathname();

  const navGroups = docSchema.filter((group) => group.title !== "Getting Started");

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="gap-0 px-3 pt-4 pb-3">
        <Link
          href="/"
          className="group/logo flex items-center gap-2 px-1 transition-opacity duration-200"
        >
          <span className="flex size-7 shrink-0 items-center justify-center">
            <CloverLogo size={20} />
          </span>
          <span className="text-[16px] tracking-tight">
            <span className="font-bold">Clover UI</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {navGroups.map((group) => (
          <SidebarGroup key={group.title} className="">
            <SidebarGroupLabel className="mb-1 h-7 text-[14px] font-medium text-foreground">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0">
                {group.items.map((item) => {
                  const href = `/components/${item.id}`;
                  const isActive = pathname === href;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="h-8 rounded-md font-normal text-muted-foreground hover:bg-transparent hover:text-foreground data-[active=true]:border-[var(--brand)] data-[active=true]:bg-sidebar-accent data-[active=true]:text-foreground transition-all duration-200"
                      >
                        <Link href={href}>
                          <span>{item.title}</span>
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
