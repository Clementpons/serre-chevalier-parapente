"use client";

import { useState } from "react";
import { useGetAllClients } from "@/features/clients/api/use-get-clients";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  SearchIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon2,
  ArrowUpDownIcon2,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
} from "@/lib/icons";
import { format, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Client, Order } from "@prisma/client";
import CopyTextComponent from "@/components/copy-text-component";
import { ExportClientsDialog } from "./export-clients-dialog";
import { Button } from "@/components/ui/button";
import { ClientAddDialog } from "@/features/clients/components/client-add-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ClientWithOrders = Client & {
  orders: Order[];
};

export function ClientsList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState("orders");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data: response, isLoading } = useGetAllClients({
    page,
    pageSize,
    sortBy,
    sortOrder,
    search: searchQuery,
  });

  const clients = response?.clients as ClientWithOrders[] | undefined;
  const totalCount = response?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("desc");
    }
    setPage(1); // Reset to first page on sort
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setPage(1);
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column)
      return <ArrowUpDownIcon2 className="ml-2 h-4 w-4" />;
    return sortOrder === "asc" ? (
      <ChevronUpIcon className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDownIcon className="ml-2 h-4 w-4" />
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const oldSoftwareDate = new Date("2025-12-01");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Clients
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez tous les clients de votre établissement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportClientsDialog
            clients={clients || []}
            totalCount={totalCount}
          />
          <ClientAddDialog />
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Rechercher un client</CardTitle>
          <CardDescription>
            Recherchez par nom, email, téléphone ou ville
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Rechercher</Button>
          </form>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Liste des clients</CardTitle>
            <CardDescription>{totalCount} client(s) au total</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Client <SortIcon column="name" />
                    </div>
                  </TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead
                    className="cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("orders")}
                  >
                    <div className="flex items-center">
                      Commandes <SortIcon column="orders" />
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:text-foreground transition-colors"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center">
                      Inscrit le <SortIcon column="createdAt" />
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!clients || clients.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      Aucun client trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((client) => {
                    const isOldSoftware = isSameDay(
                      new Date(client.createdAt),
                      oldSoftwareDate,
                    );

                    return (
                      <TableRow key={client.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                              <UserIcon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {client.firstName} {client.lastName}
                                </span>
                                {isOldSoftware && (
                                  <Badge
                                    variant="outline"
                                    className="bg-orange-100 text-orange-800 border-orange-200"
                                  >
                                    Ancien logiciel
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">
                                  ID: {client.id.slice(0, 8)}...
                                </span>
                                <CopyTextComponent text={client.id} size="sm" />
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm">
                              <MailIcon className="h-3 w-3 text-muted-foreground" />
                              <span>{client.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <PhoneIcon className="h-3 w-3 text-muted-foreground" />
                              <span>{client.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-2">
                            <MapPinIcon2 className="h-3 w-3 text-muted-foreground mt-0.5" />
                            <div className="flex flex-col text-sm">
                              <span>{client.address}</span>
                              <span className="text-muted-foreground">
                                {client.postalCode} {client.city}
                              </span>
                              <span className="text-muted-foreground">
                                {client.country}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {client.orders.length} commande
                            {client.orders.length > 1 ? "s" : ""}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {format(
                                new Date(client.createdAt),
                                "dd/MM/yyyy",
                                {
                                  locale: fr,
                                },
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(client.createdAt), "HH:mm", {
                                locale: fr,
                              })}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Afficher</span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  setPageSize(parseInt(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue placeholder={pageSize.toString()} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">par page</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-4">
                Page {page} sur {totalPages || 1}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
