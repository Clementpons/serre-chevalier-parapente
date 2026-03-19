"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useEffect, useState } from "react";

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  stages: "Planning Stages",
  biplaces: "Planning BiPlaces",
  reservations: "Réservations",
  commandes: "Commandes",
  paiements: "Paiements",
  clients: "Clients",
  stagiaires: "Stagiaires",
  "codes-promo": "Codes Promo",
  "bons-cadeaux": "Bons Cadeaux",
  tarifs: "Tarifs",
  content: "Contenu Site Web",
  campagnes: "Campagnes",
  audiences: "Audiences",
  administrators: "Administrateurs",
  monitors: "Moniteurs",
  today: "Aujourd'hui",
  account: "Mon compte",
};

function segmentLabel(segment: string): string {
  return SEGMENT_LABELS[segment] ?? segment;
}

export function DashboardHeader() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    const update = () =>
      setCurrentDate(format(new Date(), "EEEE d MMMM yyyy", { locale: fr }));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label = segmentLabel(seg);
    const isLast = i === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <header className="sticky top-0 z-10 flex h-12 items-center justify-between gap-2 bg-gray-50 border-b border-gray-200 px-4">
      <div className="flex items-center gap-2 min-w-0">
        <SidebarTrigger className="-ml-1 shrink-0 text-gray-500 hover:bg-gray-200 hover:text-gray-800" />
        <Separator orientation="vertical" className="h-4 shrink-0 bg-gray-200" />

        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1.5">
                {i > 0 && (
                  <BreadcrumbSeparator className="text-gray-300" />
                )}
                <BreadcrumbItem>
                  {crumb.isLast ? (
                    <BreadcrumbPage className="text-gray-800 font-medium">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      asChild
                      className="text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {currentDate && (
        <span className="hidden md:block text-xs text-gray-400 capitalize shrink-0 font-medium">
          {currentDate}
        </span>
      )}
    </header>
  );
}
