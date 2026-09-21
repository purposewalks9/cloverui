"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CloverLogo } from "@/components/clover-logo";
import type { DocSchema } from "@/lib/types";
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
} from "@/components/ui/sidebar";

const ACCENT = "#E1E900";

export function AppSidebar({ docSchema }: { docSchema: DocSchema }) {
  const pathname = usePathname();

  const navGroups = docSchema.filter((group) => group.title !== "Getting Started");

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-border/60">
      <SidebarHeader className="gap-0 px-3 pt-4 pb-3">
        <Link
          href="/"
          className="group/logo flex items-center gap-2.5 px-1 py-1.5"
        >
          <span
            className="flex size-7 shrink-0 items-center justify-center"
          >
            <CloverLogo size={26} />
          </span>
          <span className="text-[18px] tracking-tight">
            <span className="font-bold">Clover</span>{" "}
            <span className="font-normal text-muted-foreground">UI</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {navGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-[15px] font-medium text-muted-foreground/70">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const href = `/components/${item.id}`;
                  const isActive = pathname === href;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="rounded-md border-transparent  transition-colors data-[active=true]:font-medium data-[active=true]:text-foreground"
                        style={
                          isActive
                            ? {
                                borderColor: ACCENT,
                                backgroundColor: `${ACCENT}1f`,
                              }
                            : undefined
                        }
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