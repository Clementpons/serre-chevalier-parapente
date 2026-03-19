"use client";

import { NavUser } from "@/components/sidebar/user/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { User } from "@prisma/client";
import { NavMain } from "./nav-main";
import Image from "next/image";
import Link from "next/link";
import type { ComponentProps } from "react";

interface AppSidebarProps extends ComponentProps<typeof Sidebar> {
  user: User;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="py-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/dashboard">
              <SidebarMenuButton
                tooltip="Dashboard"
                size="lg"
                className="hover:bg-sidebar-accent"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600">
                  <Image
                    src="/logo-light-nobg.webp"
                    alt="Logo Serre Chevalier Parapente"
                    width={24}
                    height={24}
                    className="brightness-[10]"
                  />
                </div>
                <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate text-sm font-semibold text-sidebar-foreground">
                    Serre Chevalier
                  </span>
                  <span className="truncate text-[10px] text-sidebar-foreground/50">
                    Parapente — Backoffice
                  </span>
                </div>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator className="bg-sidebar-border" />

      <SidebarContent className="flex flex-col overflow-y-auto py-2">
        <NavMain role={user.role} />
      </SidebarContent>

      <SidebarSeparator className="bg-sidebar-border" />

      <SidebarFooter className="py-2">
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
