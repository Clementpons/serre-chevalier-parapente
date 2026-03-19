"use client";

import {
  HomeIcon,
  CalendarDaysIcon,
  CalendarCheckIcon,
  GiftCardIcon,
  TicketIcon,
  GraduationIcon,
  PencilLineIcon,
  ShoppingCartIcon,
  UsersGroupIcon,
  UsersRoundIcon,
  UserCheckIcon,
  CreditCardIcon2,
  LayoutIcon,
  MailCheckIcon,
  TagIcon,
  UsersIcon,
} from "@/lib/icons";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function NavMain({ role }: { role: string }) {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const slugToKnowIfActive = pathname.split("/").slice(2, 3);
  const base = `/${pathname.split("/").slice(1, 2).join("/")}`;

  const labelCls =
    "text-[10px] uppercase tracking-widest text-sidebar-foreground/40 font-semibold px-2 mb-1";

  return (
    <>
      {/* ACCUEIL */}
      <SidebarGroup>
        <SidebarGroupLabel className={labelCls}>Accueil</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/dashboard">
              <SidebarMenuButton tooltip="Dashboard" isActive={isDashboard}>
                <HomeIcon className="size-4" />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/dashboard/today">
              <SidebarMenuButton
                tooltip="Aujourd'hui"
                isActive={slugToKnowIfActive[0] === "today"}
              >
                <CalendarCheckIcon className="size-4" />
                <span>Aujourd&apos;hui</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      {/* ACTIVITÉS */}
      <SidebarGroup>
        <SidebarGroupLabel className={labelCls}>Activités</SidebarGroupLabel>
        <SidebarMenu>
          {role === "ADMIN" && (
            <SidebarMenuItem>
              <Link href={`${base}/stages`}>
                <SidebarMenuButton
                  tooltip="Planning Stages"
                  isActive={slugToKnowIfActive[0] === "stages"}
                >
                  <CalendarDaysIcon className="size-4" />
                  <span>Planning Stages</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          )}

          <SidebarMenuItem>
            <Link href={`${base}/biplaces`}>
              <SidebarMenuButton
                tooltip="Planning BiPlaces"
                isActive={slugToKnowIfActive[0] === "biplaces"}
              >
                <CalendarDaysIcon className="size-4" />
                <span>Planning BiPlaces</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>

      {/* COMMERCIAL */}
      {role === "ADMIN" && (
        <SidebarGroup>
          <SidebarGroupLabel className={labelCls}>Commercial</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href={`${base}/reservations`}>
                <SidebarMenuButton
                  tooltip="Réservations"
                  isActive={slugToKnowIfActive[0] === "reservations"}
                >
                  <CalendarCheckIcon className="size-4" />
                  <span>Réservations</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Link href={`${base}/commandes`}>
                <SidebarMenuButton
                  tooltip="Commandes"
                  isActive={slugToKnowIfActive[0] === "commandes"}
                >
                  <ShoppingCartIcon className="size-4" />
                  <span>Commandes</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Link href={`${base}/paiements`}>
                <SidebarMenuButton
                  tooltip="Paiements"
                  isActive={slugToKnowIfActive[0] === "paiements"}
                >
                  <CreditCardIcon2 className="size-4" />
                  <span>Paiements</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      )}

      {/* CLIENTS */}
      {(role === "ADMIN" || role === "MONITEUR") && (
        <SidebarGroup>
          <SidebarGroupLabel className={labelCls}>Clients</SidebarGroupLabel>
          <SidebarMenu>
            {role === "ADMIN" && (
              <SidebarMenuItem>
                <Link href={`${base}/clients`}>
                  <SidebarMenuButton
                    tooltip="Clients"
                    isActive={slugToKnowIfActive[0] === "clients"}
                  >
                    <UsersGroupIcon className="size-4" />
                    <span>Clients</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )}

            <SidebarMenuItem>
              <Link href={`${base}/stagiaires`}>
                <SidebarMenuButton
                  tooltip="Stagiaires"
                  isActive={slugToKnowIfActive[0] === "stagiaires"}
                >
                  <UserCheckIcon className="size-4" />
                  <span>Stagiaires</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      )}

      {/* BOUTIQUE */}
      {role === "ADMIN" && (
        <SidebarGroup>
          <SidebarGroupLabel className={labelCls}>Boutique</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href={`${base}/bons-cadeaux`}>
                <SidebarMenuButton
                  tooltip="Bons Cadeaux"
                  isActive={slugToKnowIfActive[0] === "bons-cadeaux"}
                >
                  <TicketIcon className="size-4" />
                  <span>Bons Cadeaux</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Link href={`${base}/codes-promo`}>
                <SidebarMenuButton
                  tooltip="Codes Promo"
                  isActive={slugToKnowIfActive[0] === "codes-promo"}
                >
                  <TagIcon className="size-4" />
                  <span>Codes Promo</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      )}

      {/* MARKETING */}
      {role === "ADMIN" && (
        <SidebarGroup>
          <SidebarGroupLabel className={labelCls}>Marketing</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href={`${base}/tarifs`}>
                <SidebarMenuButton
                  tooltip="Tarifs"
                  isActive={slugToKnowIfActive[0] === "tarifs"}
                >
                  <GiftCardIcon className="size-4" />
                  <span>Tarifs</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Link href={`${base}/campagnes`}>
                <SidebarMenuButton
                  tooltip="Campagnes"
                  isActive={slugToKnowIfActive[0] === "campagnes"}
                >
                  <MailCheckIcon className="size-4" />
                  <span>Campagnes</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Link href={`${base}/audiences`}>
                <SidebarMenuButton
                  tooltip="Audiences"
                  isActive={slugToKnowIfActive[0] === "audiences"}
                >
                  <UsersIcon className="size-4" />
                  <span>Audiences</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      )}

      {/* CONFIGURATION */}
      {role === "ADMIN" && (
        <SidebarGroup>
          <SidebarGroupLabel className={labelCls}>Configuration</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href={`${base}/content`}>
                <SidebarMenuButton
                  tooltip="Contenu Site Web"
                  isActive={slugToKnowIfActive[0] === "content"}
                >
                  <LayoutIcon className="size-4" />
                  <span>Contenu Site Web</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            <SidebarMenuItem className="group/external-link">
              <Link
                href="https://www.sanity.io/@o3ZClfzZI/studio/b8mm7m4emqxwjg4ztwkvcvmv/default/studio/structure"
                target="_blank"
              >
                <SidebarMenuButton tooltip="Blog" className="justify-between">
                  <div className="flex items-center gap-2">
                    <PencilLineIcon className="size-4" />
                    <span>Blog</span>
                  </div>
                  <PencilLineIcon className="transition opacity-0 group-hover/external-link:opacity-50 size-3" />
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Link href={`${base}/administrators`}>
                <SidebarMenuButton
                  tooltip="Administrateurs"
                  isActive={slugToKnowIfActive[0] === "administrators"}
                >
                  <UsersRoundIcon className="size-4" />
                  <span>Administrateurs</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Link href={`${base}/monitors`}>
                <SidebarMenuButton
                  tooltip="Moniteurs"
                  isActive={slugToKnowIfActive[0] === "monitors"}
                >
                  <GraduationIcon className="size-4" />
                  <span>Moniteurs</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      )}
    </>
  );
}
