"use client";

import { useState } from "react";
import { useGetAllUsers, useGetUsersByRole } from "@/features/users/api/use-get-users";
import { AdminsStats } from "@/features/users/components/admins-table/admins-stats";
import { AdminsFilters } from "@/features/users/components/admins-table/admins-filters";
import { AdminsTable } from "@/features/users/components/admins-table/admins-table";
import { AdminsPagination } from "@/features/users/components/admins-table/admins-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { SadIcon, RefreshIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export type SortField = "name" | "email" | "city" | "country" | "bookingsCount";
export type SortDirection = "asc" | "desc";
export type VisibleColumns = {
  name: boolean;
  email: boolean;
  role: boolean;
  id: boolean;
  avatar: boolean;
};

export function Admins() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [visibleColumns, setVisibleColumns] = useState<VisibleColumns>({
    name: true,
    email: true,
    role: true,
    id: true,
    avatar: true,
  });
  const { data: adminsData, isLoading: isLoadingAdmins } = useGetUsersByRole("ADMIN");

  const router = useRouter();

  if (isLoadingAdmins) {
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
  if (!adminsData) {
    return (
      <div className="bg-slate-200 text-slate-800 rounded-md p-8 flex flex-col items-center justify-center border border-slate-400 gap-4">
        <SadIcon />
        <div className="flex flex-col items-center">
          <p>Aucun compte n&apos;a été trouvé.</p>
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

  // Filter admins based on search term
  const filteredadmins = adminsData.filter((admin) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      admin.name.toLowerCase().includes(searchLower) ||
      admin.email.toLowerCase().includes(searchLower) ||
      admin.id.toLowerCase().includes(searchLower)
    );
  });

  // Sort admins based on sort field and direction
  const sortedadmins = [...filteredadmins].sort((a, b) => {
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
      <AdminsStats admins={adminsData} />

      <AdminsFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        visibleColumns={visibleColumns}
        toggleColumn={toggleColumn}
        admins={sortedadmins}
      />

      <AdminsTable
        admins={sortedadmins}
        visibleColumns={visibleColumns}
        sortField={sortField}
        sortDirection={sortDirection}
        handleSort={handleSort}
      />

      <AdminsPagination
        totalCount={adminsData.length}
        filteredCount={sortedadmins.length}
      />
    </div>
  );
}
