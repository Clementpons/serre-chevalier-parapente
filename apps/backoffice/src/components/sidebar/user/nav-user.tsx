"use client";

import { BellIcon, ChevronRightIcon, LogoutIcon, LoaderIcon, SettingsIcon } from "@/lib/icons";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useLogout } from "@/features/auth/api/use-logout";
import { useGetUserById } from "@/features/users/api/use-get-users";
import { User } from "@prisma/client";
import Link from "next/link";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  MONITEUR: "Moniteur",
  CUSTOMER: "Client",
};

export function NavUser({ user }: { user: User }) {
  const { isMobile } = useSidebar();
  const { mutate: logout, isPending: isPendingLogout } = useLogout();

  const userToDisplay = useGetUserById(user.id);
  const displayName = userToDisplay.data?.name ?? user.name;
  const displayEmail = userToDisplay.data?.email ?? user.email;
  const displayAvatar = userToDisplay.data?.avatarUrl ?? undefined;
  const displayRole = userToDisplay.data?.role ?? user.role;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent"
            >
              <Avatar className="h-8 w-8 rounded-lg bg-sidebar-accent">
                <AvatarImage src={displayAvatar} alt={displayName} />
                <AvatarFallback className="rounded-lg bg-blue-600 text-white text-xs font-semibold">
                  {displayName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {displayName}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/50">
                  {ROLE_LABELS[displayRole] ?? displayRole}
                </span>
              </div>
              <ChevronRightIcon className="ml-auto size-4 text-sidebar-foreground/40" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-2 py-2 text-left">
                <Avatar className="h-9 w-9 rounded-lg">
                  <AvatarImage src={displayAvatar} alt={displayName} />
                  <AvatarFallback className="rounded-lg bg-blue-600 text-white text-xs font-semibold">
                    {displayName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {displayEmail}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {ROLE_LABELS[displayRole] ?? displayRole}
                </Badge>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/account" className="cursor-pointer">
                  <SettingsIcon className="size-4" />
                  Mon compte
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <BellIcon />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => logout()}
              disabled={isPendingLogout}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              {isPendingLogout ? (
                <>
                  <LoaderIcon className="size-4 animate-spin" />
                  Déconnexion...
                </>
              ) : (
                <>
                  <LogoutIcon className="size-4" />
                  Déconnexion
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
