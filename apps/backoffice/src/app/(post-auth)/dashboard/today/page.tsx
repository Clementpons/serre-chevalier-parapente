"use client";

import { useGetToday } from "@/features/dashboard/api/use-get-today";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  LoaderIcon,
  MountainIcon2,
  AirplaneIcon,
  UsersIcon,
  CalendarIcon,
} from "@/lib/icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

function PaymentBadge({
  isFullyPaid,
  remainingAmount,
  effectiveRemainingAmount,
}: {
  isFullyPaid: boolean;
  remainingAmount: number | null;
  effectiveRemainingAmount: number | null;
}) {
  if (isFullyPaid) {
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
        Soldé
      </Badge>
    );
  }
  const balance = effectiveRemainingAmount ?? remainingAmount ?? 0;
  if (balance > 0) {
    return (
      <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200">
        Solde: {formatCurrency(balance)}
      </Badge>
    );
  }
  return (
    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
      Acompte payé
    </Badge>
  );
}

export default function TodayPage() {
  const { data, isLoading } = useGetToday();

  const totalParticipants =
    (data?.stages?.reduce((s, st) => s + st.participants.length, 0) ?? 0) +
    (data?.baptemes?.reduce((s, b) => s + b.participants.length, 0) ?? 0);

  const dateLabel = data?.date
    ? format(new Date(data.date + "T12:00:00"), "EEEE d MMMM yyyy", {
        locale: fr,
      })
    : format(new Date(), "EEEE d MMMM yyyy", { locale: fr });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <LoaderIcon className="h-5 w-5 animate-spin" />
          <span>Chargement des activités du jour…</span>
        </div>
      </div>
    );
  }

  const hasNoActivities =
    !data ||
    (data.stages.length === 0 && data.baptemes.length === 0);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight capitalize">
          Activités du jour — {dateLabel}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {data?.stages.length ?? 0} stage{(data?.stages.length ?? 0) !== 1 ? "s" : ""}{" "}
          · {data?.baptemes.length ?? 0} baptême
          {(data?.baptemes.length ?? 0) !== 1 ? "s" : ""} · {totalParticipants}{" "}
          participant{totalParticipants !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Empty state */}
      {hasNoActivities && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-lg mb-2">
              Aucune activité aujourd&apos;hui
            </CardTitle>
            <CardDescription>
              Pas de stage ni de baptême programmé pour aujourd&apos;hui.
            </CardDescription>
          </CardContent>
        </Card>
      )}

      {/* Stages */}
      {data?.stages && data.stages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MountainIcon2 className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">
              Stages ({data.stages.length})
            </h3>
          </div>
          {data.stages.map((stage) => (
            <Card key={stage.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-base">
                    Stage {stage.type} —{" "}
                    {format(new Date(stage.startDate), "HH:mm", {
                      locale: fr,
                    })}
                  </CardTitle>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <UsersIcon className="h-3 w-3" />
                    {stage.bookingsCount} / {stage.places} inscrits
                  </Badge>
                </div>
                <CardDescription>
                  Durée : {stage.duration} jour{stage.duration !== 1 ? "s" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {stage.participants.length === 0 ? (
                  <p className="px-6 pb-4 text-sm text-muted-foreground">
                    Aucun participant inscrit.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="text-xs font-medium">Code</TableHead>
                          <TableHead className="text-xs font-medium">Nom</TableHead>
                          <TableHead className="text-xs font-medium hidden md:table-cell">Contact</TableHead>
                          <TableHead className="text-xs font-medium hidden lg:table-cell">Infos</TableHead>
                          <TableHead className="text-xs font-medium">Catégorie</TableHead>
                          <TableHead className="text-xs font-medium hidden sm:table-cell">Solde dû</TableHead>
                          <TableHead className="text-xs font-medium">Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stage.participants.map((p) => (
                          <TableRow key={p.bookingId}>
                            <TableCell className="text-xs font-mono text-muted-foreground">
                              {p.shortCode ?? "—"}
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                              {p.firstName} {p.lastName}
                            </TableCell>
                            <TableCell className="text-xs hidden md:table-cell">
                              <div>{p.email}</div>
                              <div className="text-muted-foreground">{p.phone}</div>
                            </TableCell>
                            <TableCell className="text-xs hidden lg:table-cell">
                              <div>{p.weight} kg</div>
                              <div className="text-muted-foreground">{p.height} cm</div>
                            </TableCell>
                            <TableCell className="text-xs">
                              {p.bookingType}
                            </TableCell>
                            <TableCell className="text-xs hidden sm:table-cell">
                              {p.isFullyPaid ? (
                                <span className="text-green-600 font-medium">—</span>
                              ) : (
                                <span className="text-orange-600 font-medium">
                                  {formatCurrency(
                                    p.effectiveRemainingAmount ??
                                      p.remainingAmount ??
                                      0
                                  )}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <PaymentBadge
                                isFullyPaid={p.isFullyPaid}
                                remainingAmount={p.remainingAmount}
                                effectiveRemainingAmount={p.effectiveRemainingAmount}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Baptemes */}
      {data?.baptemes && data.baptemes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AirplaneIcon className="h-5 w-5 text-sky-600" />
            <h3 className="text-lg font-semibold">
              Baptêmes ({data.baptemes.length})
            </h3>
          </div>
          {data.baptemes.map((bapteme) => (
            <Card key={bapteme.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-base">
                    Baptême —{" "}
                    {format(new Date(bapteme.date), "HH:mm", { locale: fr })}
                  </CardTitle>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <UsersIcon className="h-3 w-3" />
                    {bapteme.bookingsCount} / {bapteme.places} inscrits
                  </Badge>
                </div>
                <CardDescription>
                  Durée : {bapteme.duration} min
                  {bapteme.categories && bapteme.categories.length > 0 && (
                    <span className="ml-2">
                      · Catégories : {bapteme.categories.join(", ")}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {bapteme.participants.length === 0 ? (
                  <p className="px-6 pb-4 text-sm text-muted-foreground">
                    Aucun participant inscrit.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead className="text-xs font-medium">Code</TableHead>
                          <TableHead className="text-xs font-medium">Nom</TableHead>
                          <TableHead className="text-xs font-medium hidden md:table-cell">Contact</TableHead>
                          <TableHead className="text-xs font-medium hidden lg:table-cell">Infos</TableHead>
                          <TableHead className="text-xs font-medium">Catégorie</TableHead>
                          <TableHead className="text-xs font-medium hidden sm:table-cell">Vidéo</TableHead>
                          <TableHead className="text-xs font-medium hidden sm:table-cell">Solde dû</TableHead>
                          <TableHead className="text-xs font-medium">Statut</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bapteme.participants.map((p) => (
                          <TableRow key={p.bookingId}>
                            <TableCell className="text-xs font-mono text-muted-foreground">
                              {p.shortCode ?? "—"}
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                              {p.firstName} {p.lastName}
                            </TableCell>
                            <TableCell className="text-xs hidden md:table-cell">
                              <div>{p.email}</div>
                              <div className="text-muted-foreground">{p.phone}</div>
                            </TableCell>
                            <TableCell className="text-xs hidden lg:table-cell">
                              <div>{p.weight} kg</div>
                              <div className="text-muted-foreground">{p.height} cm</div>
                            </TableCell>
                            <TableCell className="text-xs">
                              {p.category}
                            </TableCell>
                            <TableCell className="text-xs hidden sm:table-cell">
                              {p.hasVideo ? (
                                <Badge variant="secondary" className="text-xs">
                                  Oui
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">Non</span>
                              )}
                            </TableCell>
                            <TableCell className="text-xs hidden sm:table-cell">
                              {p.isFullyPaid ? (
                                <span className="text-green-600 font-medium">—</span>
                              ) : (
                                <span className="text-orange-600 font-medium">
                                  {formatCurrency(
                                    p.effectiveRemainingAmount ??
                                      p.remainingAmount ??
                                      0
                                  )}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <PaymentBadge
                                isFullyPaid={p.isFullyPaid}
                                remainingAmount={p.remainingAmount}
                                effectiveRemainingAmount={p.effectiveRemainingAmount}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
