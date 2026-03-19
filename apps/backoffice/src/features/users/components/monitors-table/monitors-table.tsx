"use client";

import { ChevronDownIcon, ChevronUpIcon } from "@/lib/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  SortDirection,
  SortField,
  VisibleColumns,
} from "@/app/(post-auth)/dashboard/monitors/monitors";
import { User } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MonitorsTableProps {
  monitors: User[];
  visibleColumns: VisibleColumns;
  sortField: SortField;
  sortDirection: SortDirection;
  handleSort: (field: SortField) => void;
}

export function MonitorsTable({
  monitors,
  visibleColumns,
  sortField,
  sortDirection,
  handleSort,
}: MonitorsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {visibleColumns.avatar && (
              <TableHead className="cursor-pointer">
                <div className="flex items-center">Avatar</div>
              </TableHead>
            )}
            {visibleColumns.name && (
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  Nom
                  {sortField === "name" &&
                    (sortDirection === "asc" ? (
                      <ChevronUpIcon className="ml-2 h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="ml-2 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
            )}
            {visibleColumns.email && (
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("email")}
              >
                <div className="flex items-center">
                  Email
                  {sortField === "email" &&
                    (sortDirection === "asc" ? (
                      <ChevronUpIcon className="ml-2 h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="ml-2 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
            )}
            {visibleColumns.role && <TableHead>Role</TableHead>}
            {visibleColumns.id && (
              <TableHead className="cursor-pointer">
                <div className="flex items-center">Id</div>
              </TableHead>
            )}
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {monitors.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={
                  Object.values(visibleColumns).filter(Boolean).length + 1
                }
                className="text-center py-8"
              >
                Aucun moniteur trouvé
              </TableCell>
            </TableRow>
          ) : (
            monitors.map((monitor) => (
              <TableRow key={monitor.id}>
                {visibleColumns.avatar && (
                  <TableCell>
                    <Avatar className="h-8 w-8 rounded-lg bg-foreground">
                      <AvatarImage src={monitor.avatarUrl ?? undefined} alt={monitor.name} />
                      <AvatarFallback className="rounded-lg">
                        {monitor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                )}
                {visibleColumns.name && (
                  <TableCell className="font-medium">{monitor.name}</TableCell>
                )}
                {visibleColumns.email && <TableCell>{monitor.email}</TableCell>}
                {visibleColumns.role && <TableCell>{monitor.role}</TableCell>}
                {visibleColumns.id && (
                  <TableCell>
                    <span className="bg-slate-100 dark:bg-dark-900 text-gray-700 px-4 py-1 rounded-full">
                      {monitor.id}
                    </span>
                  </TableCell>
                )}
                <TableCell>
                  {/* <Button variant="ghost" size="sm">
                    Voir
                  </Button> */}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
