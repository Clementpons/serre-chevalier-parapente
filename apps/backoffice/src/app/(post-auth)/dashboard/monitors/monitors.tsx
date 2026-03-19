"use client";

import { useState } from "react";
import { useGetUsersByRole } from "@/features/users/api/use-get-users";
import { Skeleton } from "@/components/ui/skeleton";
import { SadIcon, RefreshIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MonitorsStats } from "@/features/users/components/monitors-table/monitors-stats";
import { MonitorsPagination } from "@/features/users/components/monitors-table/monitors-pagination";
import { MonitorsTable } from "@/features/users/components/monitors-table/monitors-table";
import { MonitorsFilters } from "@/features/users/components/monitors-table/monitors-filters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MonitorAddForm from "@/features/users/forms/monitor-add-form";

export type SortField = "name" | "email" | "city" | "country" | "bookingsCount";
export type SortDirection = "asc" | "desc";
export type VisibleColumns = {
  name: boolean;
  email: boolean;
  role: boolean;
  id: boolean;
  avatar: boolean;
};

export function Monitors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    name: true,
    email: true,
    role: true,
    id: true,
    avatar: true,
  });
  const { data: monitorsData, isLoading: isLoadingMonitors } =
    useGetUsersByRole("MONITEUR");

  const router = useRouter();

  if (isLoadingMonitors) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex gap-4 mb-6">
          <Skeleton className="w-full h-36" />
          <Skeleton className="w-full h-36" />
          <Skeleton className="w-full h-36" />
        </div>
        <div className="w-full h-full">
          <Skeleton className="w-full h-full" />
        </div>
      </div>
    );
  }
  if (!monitorsData) {
    return (
      <div className="bg-slate-200 text-slate-800 rounded-md p-8 flex flex-col items-center justify-center border border-slate-400 gap-4">
        <SadIcon />
        <div className="flex flex-col items-center">
          <p>Aucun moniteur n&apos;a été trouvé.</p>
          <p className="text-xs">
            Ceci peut être dû à une erreur de connexion avec la base donneées.
          </p>
          <Button
            variant={"secondary"}
            size={"lg"}
            className="mt-4"
            onClick={() => {
              router.refresh();
            }}
          >
            <RefreshIcon />
            Rafraichir la page
          </Button>
        </div>
      </div>
    );
  }

  // Filter monitors based on search term
  const filteredMonitors = monitorsData.filter((monitor) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      monitor.name.toLowerCase().includes(searchLower) ||
      monitor.email.toLowerCase().includes(searchLower) ||
      monitor.id.toLowerCase().includes(searchLower)
    );
  });

  // Sort monitors based on sort field and direction
  const sortedMonitors = [...filteredMonitors].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;
    aValue = a[sortField as keyof typeof a] as string | number;
    bValue = b[sortField as keyof typeof b] as string | number;

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Handle sort change
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Toggle column visibility
  const toggleColumn = (column: keyof VisibleColumns) => {
    setVisibleColumns({
      ...visibleColumns,
      [column]: !visibleColumns[column],
    });
  };

  return (
    <div className="space-y-4">
      <MonitorsStats monitors={monitorsData} onAddMonitor={() => setShowAddDialog(true)} />

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un Moniteur</DialogTitle>
          </DialogHeader>
          <MonitorAddForm />
        </DialogContent>
      </Dialog>

      <MonitorsFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        visibleColumns={visibleColumns}
        toggleColumn={toggleColumn}
        monitors={sortedMonitors}
      />

      <MonitorsTable
        monitors={sortedMonitors}
        visibleColumns={visibleColumns}
        sortField={sortField}
        sortDirection={sortDirection}
        handleSort={handleSort}
      />

      <MonitorsPagination
        totalCount={monitorsData.length}
        filteredCount={sortedMonitors.length}
      />
    </div>
  );
}
