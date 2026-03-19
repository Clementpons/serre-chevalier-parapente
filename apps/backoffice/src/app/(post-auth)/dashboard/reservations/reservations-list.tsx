"use client";

import { useState } from "react";
import { useGetReservations } from "@/features/reservations/api/use-get-reservations";
import { useCreateReservationStageByAdmin } from "@/features/reservations/stages/api/use-create-reservation-stage";
import { useGetAllStages } from "@/features/stages/api/use-get-stage";
import { useGetAllStagiaires } from "@/features/stagiaires/api/use-get-stagiaires";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  VideoIcon,
  FilterIcon2,
  XIcon,
  ExternalLinkIcon,
  PlusIcon,
} from "@/lib/icons";
import { format, addMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export function ReservationsList() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"ALL" | "STAGE" | "BAPTEME">("ALL");
  const [status, setStatus] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [dateRange, setDateRange] = useState({
    start: format(new Date(), "yyyy-MM-dd"),
    end: format(addMonths(new Date(), 12), "yyyy-MM-dd"),
  });

  // Admin reservation dialog
  const [adminDialog, setAdminDialog] = useState(false);
  const [adminForm, setAdminForm] = useState({
    customerId: "",
    stageId: "",
    type: "INITIATION" as "INITIATION" | "PROGRESSION" | "AUTONOMIE",
  });
  const createAdminReservation = useCreateReservationStageByAdmin();
  const { data: stagesData } = useGetAllStages();
  const { data: stagiaireData } = useGetAllStagiaires({ nopaging: true });

  const { data, isLoading, error } = useGetReservations({
    page,
    limit: 20,
    search: search || undefined,
    type,
    status: status || undefined,
    category: category || undefined,
    startDate: dateRange.start,
    endDate: dateRange.end,
  });

  const reservations = data?.data?.reservations || [];
  const pagination = data?.data?.pagination;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleTypeChange = (value: string) => {
    setType(value as "ALL" | "STAGE" | "BAPTEME");
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(1);
  };

  const handleDateRangeChange = (field: "start" | "end", value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setType("ALL");
    setStatus("");
    setCategory("");
    setDateRange({
      start: format(new Date(), "yyyy-MM-dd"),
      end: format(addMonths(new Date(), 12), "yyyy-MM-dd"),
    });
    setPage(1);
  };

  const hasActiveFilters = search || type !== "ALL" || status || category;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "FULLY_PAID":
        return "bg-green-700 text-white border-transparent hover:bg-green-700";
      case "PAID":
        return "bg-green-500 text-white border-transparent hover:bg-green-500";
      case "PARTIALLY_PAID":
        return "bg-orange-500 text-white border-transparent hover:bg-orange-500";
      case "CONFIRMED":
        return "bg-blue-500 text-white border-transparent hover:bg-blue-500";
      case "PENDING":
        return "bg-yellow-500 text-white border-transparent hover:bg-yellow-500";
      case "CANCELLED":
        return "bg-red-500 text-white border-transparent hover:bg-red-500";
      default:
        return "bg-gray-400 text-white border-transparent";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PAID":
        return "Payé";
      case "PARTIALLY_PAID":
        return "Acompte payé";
      case "FULLY_PAID":
        return "Entièrement payé";
      case "CONFIRMED":
        return "Confirmé";
      case "PENDING":
        return "En attente";
      default:
        return status;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      AVENTURE: "Aventure",
      DUREE: "Durée",
      LONGUE_DUREE: "Longue Durée",
      ENFANT: "Enfant",
      HIVER: "Hiver",
      INITIATION: "Initiation",
      PROGRESSION: "Progression",
      AUTONOMIE: "Autonomie",
    };
    return labels[category] || category;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Réservations
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Recherchez et filtrez toutes les réservations
          </p>
        </div>
        <Button onClick={() => setAdminDialog(true)} className="w-fit">
          <PlusIcon className="h-4 w-4 mr-2" />
          Réservation manuelle
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FilterIcon2 className="h-5 w-5" />
              <CardTitle>Filtres</CardTitle>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <XIcon className="h-4 w-4 mr-2" />
                Réinitialiser
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email ou numéro de commande..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Row */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tous</SelectItem>
                  <SelectItem value="STAGE">Stages</SelectItem>
                  <SelectItem value="BAPTEME">Baptêmes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Statut</Label>
              <Select
                value={status || "ALL_STATUS"}
                onValueChange={(v) =>
                  handleStatusChange(v === "ALL_STATUS" ? "" : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_STATUS">Tous</SelectItem>
                  <SelectItem value="PAID">Payé</SelectItem>
                  <SelectItem value="PARTIALLY_PAID">Acompte payé</SelectItem>
                  <SelectItem value="FULLY_PAID">Entièrement payé</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Catégorie</Label>
              <Select
                value={category || "ALL_CATEGORIES"}
                onValueChange={(v) =>
                  handleCategoryChange(v === "ALL_CATEGORIES" ? "" : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_CATEGORIES">Toutes</SelectItem>
                  {type !== "BAPTEME" && (
                    <>
                      <SelectItem value="INITIATION">Initiation</SelectItem>
                      <SelectItem value="PROGRESSION">Progression</SelectItem>
                      <SelectItem value="AUTONOMIE">Autonomie</SelectItem>
                    </>
                  )}
                  {type !== "STAGE" && (
                    <>
                      <SelectItem value="AVENTURE">Aventure</SelectItem>
                      <SelectItem value="DUREE">Durée</SelectItem>
                      <SelectItem value="LONGUE_DUREE">Longue Durée</SelectItem>
                      <SelectItem value="ENFANT">Enfant</SelectItem>
                      <SelectItem value="HIVER">Hiver</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Date de début</Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => handleDateRangeChange("start", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Date de fin</Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => handleDateRangeChange("end", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Résultats {pagination && `(${pagination.total})`}
          </CardTitle>
          <CardDescription>
            {pagination &&
              `Page ${pagination.page} sur ${pagination.totalPages}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-muted-foreground">
              Erreur lors du chargement des réservations
            </div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune réservation trouvée
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-[1000px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Réservé le</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date du stage</TableHead>
                    <TableHead>Stagiaire</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Commande</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">
                      Paiements effectués
                    </TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.map((reservation: any) => {
                    const isStage = reservation.bookingType === "STAGE";
                    const stagiaire = reservation.stagiaire;
                    const order = reservation.orderItem?.order;
                    const orderItem = reservation.orderItem;
                    const date = isStage
                      ? reservation.stage.startDate
                      : reservation.bapteme.date;
                    const categoryValue = isStage
                      ? reservation.type
                      : reservation.category;

                    // Check if reservation is recent (less than 24 hours old)
                    const createdAt = new Date(reservation.createdAt);
                    const now = new Date();
                    const hoursSinceCreation =
                      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
                    const isRecent = hoursSinceCreation < 12;

                    // Calcul des montants
                    const totalPrice = orderItem?.totalPrice || 0;
                    const depositAmount = orderItem?.depositAmount || 0;
                    const remainingAmount = orderItem?.remainingAmount || 0;
                    const isFullyPaid = orderItem?.isFullyPaid || false;
                    // Both stages and baptemes can have deposits (bapteme: acompte + video paid upfront)
                    const hasDeposit = depositAmount > 0;

                    return (
                      <TableRow
                        key={reservation.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() =>
                          router.push(
                            `/dashboard/reservations/${reservation.id}`
                          )
                        }
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">
                              {format(createdAt, "dd/MM/yyyy", { locale: fr })}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(createdAt, "HH'h'mm", { locale: fr })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="relative inline-block">
                            <Badge variant={isStage ? "default" : "secondary"}>
                              {isStage ? "Stage" : "Baptême"}
                            </Badge>
                            {isRecent && (
                              <span className="block w-3 h-3 absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-green-500  rounded-full"></span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {format(new Date(date), "dd/MM/yyyy", {
                                locale: fr,
                              })}
                            </span>
                            {!isStage && (
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(date), "HH:mm", {
                                  locale: fr,
                                })}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {stagiaire.firstName} {stagiaire.lastName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {stagiaire.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span>{getCategoryLabel(categoryValue)}</span>
                            {!isStage && reservation.hasVideo && (
                              <Badge variant="outline" className="w-fit">
                                <VideoIcon className="h-3 w-3 mr-1" />
                                Vidéo
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            #{order?.orderNumber}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={getStatusBadgeClass(order?.status || "")}
                          >
                            {getStatusLabel(order?.status || "")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-medium text-green-600">
                              {formatCurrency(
                                isFullyPaid
                                  ? totalPrice
                                  : totalPrice - remainingAmount
                              )}
                            </span>
                            {!isFullyPaid && remainingAmount > 0 && (
                              <span className="text-xs text-orange-600">
                                Reste: {formatCurrency(remainingAmount)}
                              </span>
                            )}
                            {isFullyPaid && (
                              <span className="text-xs text-green-600">
                                ✓ Soldé
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-medium">
                              {formatCurrency(totalPrice)}
                            </span>
                            <ExternalLinkIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
              <div className="text-sm text-muted-foreground">
                Affichage de {(pagination.page - 1) * pagination.limit + 1} à{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                sur {pagination.total} résultats
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full sm:w-auto justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeftIcon className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Précédent</span>
                </Button>
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, pagination.totalPages))].map(
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <Button
                          key={i}
                          variant={
                            pagination.page === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className="h-8 w-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={pagination.page === pagination.totalPages}
                >
                  <span className="hidden sm:inline">Suivant</span>
                  <ChevronRightIcon className="h-4 w-4 sm:ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin manual reservation dialog */}
      <Dialog open={adminDialog} onOpenChange={setAdminDialog}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Réservation manuelle</DialogTitle>
            <DialogDescription>
              Inscrit directement un stagiaire à un stage sans passer par le
              processus de paiement.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="adminStage">Stage *</Label>
              <Select
                value={adminForm.stageId}
                onValueChange={(v) =>
                  setAdminForm((f) => ({ ...f, stageId: v }))
                }
              >
                <SelectTrigger id="adminStage">
                  <SelectValue placeholder="Sélectionner un stage..." />
                </SelectTrigger>
                <SelectContent>
                  {(stagesData ?? []).map((stage: any) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {format(new Date(stage.startDate), "dd/MM/yyyy", {
                        locale: fr,
                      })}{" "}
                      — {stage.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminStagiaire">Stagiaire *</Label>
              <Select
                value={adminForm.customerId}
                onValueChange={(v) =>
                  setAdminForm((f) => ({ ...f, customerId: v }))
                }
              >
                <SelectTrigger id="adminStagiaire">
                  <SelectValue placeholder="Sélectionner un stagiaire..." />
                </SelectTrigger>
                <SelectContent>
                  {((stagiaireData as any)?.stagiaires ?? []).map(
                    (s: any) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.firstName} {s.lastName}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminType">Type de stage *</Label>
              <Select
                value={adminForm.type}
                onValueChange={(v) =>
                  setAdminForm((f) => ({
                    ...f,
                    type: v as "INITIATION" | "PROGRESSION" | "AUTONOMIE",
                  }))
                }
              >
                <SelectTrigger id="adminType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INITIATION">Initiation</SelectItem>
                  <SelectItem value="PROGRESSION">Progression</SelectItem>
                  <SelectItem value="AUTONOMIE">Autonomie</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAdminDialog(false)}
              disabled={createAdminReservation.isPending}
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (!adminForm.stageId || !adminForm.customerId) return;
                createAdminReservation.mutate(adminForm, {
                  onSuccess: () => {
                    setAdminDialog(false);
                    setAdminForm({
                      customerId: "",
                      stageId: "",
                      type: "INITIATION",
                    });
                  },
                });
              }}
              disabled={
                createAdminReservation.isPending ||
                !adminForm.stageId ||
                !adminForm.customerId
              }
            >
              {createAdminReservation.isPending
                ? "Création..."
                : "Créer la réservation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
