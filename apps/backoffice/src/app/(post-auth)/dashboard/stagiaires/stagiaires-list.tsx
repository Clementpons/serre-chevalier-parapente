"use client";

import { useState } from "react";
import { useGetAllStagiaires } from "@/features/stagiaires/api/use-get-stagiaires";
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
  CalendarIcon,
  ArrowUpDownIcon2,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/lib/icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Stagiaire,
  StageBooking,
  BaptemeBooking,
  Stage,
  Bapteme,
} from "@prisma/client";
import CopyTextComponent from "@/components/copy-text-component";
import { ExportStagiairesDialog } from "./export-stagiaires-dialog";
import { StagiaireAddDialog } from "@/features/stagiaires/components/stagiaire-add-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StagiaireWithBookings = Stagiaire & {
  stageBookings: (StageBooking & { stage: Stage })[];
  baptemeBookings: (BaptemeBooking & { bapteme: Bapteme })[];
};

export function StagiairesList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data: response, isLoading } = useGetAllStagiaires({
    page,
    pageSize,
    sortBy,
    sortOrder,
    search: searchQuery,
  });

  const stagiaires = response?.stagiaires as
    | StagiaireWithBookings[]
    | undefined;
  const totalCount = response?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("desc");
    }
    setPage(1);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Stagiaires
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez tous les stagiaires de votre établissement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportStagiairesDialog
            stagiaires={stagiaires || []}
            totalCount={totalCount}
          />
          <StagiaireAddDialog />
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Rechercher un stagiaire</CardTitle>
          <CardDescription>
            Recherchez par nom, email ou téléphone
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

      {/* Stagiaires Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Liste des stagiaires</CardTitle>
            <CardDescription>
              {totalCount} stagiaire(s) au total
            </CardDescription>
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
                      Stagiaire <SortIcon column="name" />
                    </div>
                  </TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Informations</TableHead>
                  <TableHead>Réservations</TableHead>
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
                {!stagiaires || stagiaires.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      Aucun stagiaire trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  stagiaires.map((stagiaire) => {
                    const totalBookings =
                      stagiaire.stageBookings.length +
                      stagiaire.baptemeBookings.length;
                    return (
                      <TableRow key={stagiaire.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                              <UserIcon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {stagiaire.firstName} {stagiaire.lastName}
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">
                                  ID: {stagiaire.id.slice(0, 8)}...
                                </span>
                                <CopyTextComponent
                                  text={stagiaire.id}
                                  size="sm"
                                />
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm">
                              <MailIcon className="h-3 w-3 text-muted-foreground" />
                              <span>{stagiaire.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <PhoneIcon className="h-3 w-3 text-muted-foreground" />
                              <span>{stagiaire.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-sm">
                            {stagiaire.birthDate && (
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Né(e) le{" "}
                                  {format(
                                    new Date(stagiaire.birthDate),
                                    "dd/MM/yyyy",
                                    {
                                      locale: fr,
                                    },
                                  )}
                                </span>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <span className="text-muted-foreground">
                                Taille: {stagiaire.height}cm
                              </span>
                              <span className="text-muted-foreground">
                                Poids: {stagiaire.weight}kg
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <Badge variant="secondary">
                              {totalBookings} réservation
                              {totalBookings > 1 ? "s" : ""}
                            </Badge>
                            {stagiaire.stageBookings.length > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {stagiaire.stageBookings.length} stage
                                {stagiaire.stageBookings.length > 1 ? "s" : ""}
                              </span>
                            )}
                            {stagiaire.baptemeBookings.length > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {stagiaire.baptemeBookings.length} baptême
                                {stagiaire.baptemeBookings.length > 1
                                  ? "s"
                                  : ""}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {format(
                                new Date(stagiaire.createdAt),
                                "dd/MM/yyyy",
                                { locale: fr },
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(stagiaire.createdAt), "HH:mm", {
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
