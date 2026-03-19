"use client";

import { useState } from "react";
import { useGetPayments } from "@/features/payments/api/use-get-payments";
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
  EuroSignIcon,
  CreditCardIcon2,
  TicketIcon,
} from "@/lib/icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import CopyTextComponent from "@/components/copy-text-component";

const paymentMethodLabels = {
  CARD: "Carte bancaire",
  BANK_TRANSFER: "Virement bancaire",
  CASH: "Espèces",
  CHECK: "Chèque",
};

const paymentTypeLabels = {
  STRIPE: "Stripe",
  MANUAL: "Manuel",
  GIFT_VOUCHER: "Bon Cadeau",
};

const itemTypeLabels = {
  STAGE: "Stage",
  BAPTEME: "Baptême",
  GIFT_VOUCHER: "Bon cadeau",
};

const stageTypeLabels = {
  INITIATION: "Initiation",
  PROGRESSION: "Progression",
  AUTONOMIE: "Autonomie",
  DOUBLE: "Double",
};

const baptemeCategoryLabels = {
  AVENTURE: "Aventure",
  DUREE: "Durée",
  LONGUE_DUREE: "Longue durée",
  ENFANT: "Enfant",
  HIVER: "Hiver",
};

export function PaymentsList() {
  const { data: payments, isLoading } = useGetPayments();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPayments = payments?.filter((payment: any) => {
    const query = searchQuery.toLowerCase();
    return (
      payment.order?.orderNumber?.toLowerCase().includes(query) ||
      payment.order?.client?.firstName?.toLowerCase().includes(query) ||
      payment.order?.client?.lastName?.toLowerCase().includes(query) ||
      payment.order?.client?.email?.toLowerCase().includes(query) ||
      payment.stripePaymentIntentId?.toLowerCase().includes(query) ||
      payment.recordedByUser?.name?.toLowerCase().includes(query) ||
      payment.recordedByUser?.email?.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Calculate stats
  const totalPayments = payments?.length || 0;
  const stripePayments =
    payments?.filter(
      (p: any) => p.paymentType === "STRIPE" || (!p.paymentType && !p.isManual),
    ).length || 0;
  const manualPayments =
    payments?.filter((p: any) => p.paymentType === "MANUAL" || p.isManual)
      .length || 0;
  const giftVoucherPayments =
    payments?.filter((p: any) => p.paymentType === "GIFT_VOUCHER").length || 0;
  const totalAmount =
    payments
      ?.filter(
        (p: any) =>
          p.status === "SUCCEEDED" && p.paymentType !== "GIFT_VOUCHER",
      )
      .reduce((sum: number, p: any) => sum + p.amount, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paiements</h1>
          <p className="text-muted-foreground">
            Consultez tous les paiements enregistrés (Stripe, manuels et bons
            cadeaux)
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <CreditCardIcon2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total encaissé</p>
              <p className="text-lg font-bold">
                {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(totalAmount)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <EuroSignIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Stripe</p>
              <p className="text-lg font-bold">{stripePayments}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
              <CreditCardIcon2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Manuels</p>
              <p className="text-lg font-bold">{manualPayments}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <TicketIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Bons Cadeaux</p>
              <p className="text-lg font-bold">{giftVoucherPayments}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par commande, client, email, ID transaction ou admin..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des paiements</CardTitle>
          <CardDescription>
            {filteredPayments?.length || 0} paiement(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Commande</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Détails</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!filteredPayments || filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      Aucun paiement trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment: any) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {format(new Date(payment.createdAt), "dd/MM/yyyy", {
                              locale: fr,
                            })}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(payment.createdAt), "HH:mm", {
                              locale: fr,
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {payment.order?.orderNumber || "-"}
                          </span>
                          {payment.order?.client ? (
                            <span className="text-xs text-muted-foreground">
                              {payment.order.client.firstName}{" "}
                              {payment.order.client.lastName}
                            </span>
                          ) : payment.allocations?.[0]?.orderItem?.stageBooking
                              ?.stagiaire ? (
                            <span className="text-xs text-muted-foreground">
                              {
                                payment.allocations[0].orderItem.stageBooking
                                  .stagiaire.firstName
                              }{" "}
                              {
                                payment.allocations[0].orderItem.stageBooking
                                  .stagiaire.lastName
                              }
                            </span>
                          ) : payment.allocations?.[0]?.orderItem
                              ?.baptemeBooking?.stagiaire ? (
                            <span className="text-xs text-muted-foreground">
                              {
                                payment.allocations[0].orderItem.baptemeBooking
                                  .stagiaire.firstName
                              }{" "}
                              {
                                payment.allocations[0].orderItem.baptemeBooking
                                  .stagiaire.lastName
                              }
                            </span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        {payment.paymentType === "GIFT_VOUCHER" ? (
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant="outline"
                              className="w-fit bg-green-50 text-green-700 border-green-300"
                            >
                              Bon Cadeau
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Payé via bon cadeau
                            </span>
                          </div>
                        ) : payment.paymentType === "MANUAL" ||
                          payment.isManual ? (
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className="w-fit">
                              Manuel
                            </Badge>
                            {payment.manualPaymentMethod && (
                              <span className="text-xs text-muted-foreground">
                                {
                                  paymentMethodLabels[
                                    payment.manualPaymentMethod as keyof typeof paymentMethodLabels
                                  ]
                                }
                              </span>
                            )}
                            {payment.recordedByUser && (
                              <span className="text-xs text-muted-foreground">
                                Par: {payment.recordedByUser.name}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <Badge
                              variant="outline"
                              className="w-fit bg-blue-50"
                            >
                              Stripe
                            </Badge>
                            {payment.stripePaymentIntentId && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground font-mono">
                                  {payment.stripePaymentIntentId}
                                </span>
                                <CopyTextComponent
                                  text={payment.stripePaymentIntentId}
                                  size="sm"
                                />
                              </div>
                            )}
                          </div>
                        )}
                        <div className="mt-2">
                          {payment.status === "PENDING" && (
                            <Badge
                              variant="secondary"
                              className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none w-fit"
                            >
                              Non finalisé
                            </Badge>
                          )}
                          {payment.status === "SUCCEEDED" && (
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-800 hover:bg-green-100 border-none w-fit"
                            >
                              Finalisé
                            </Badge>
                          )}
                          {payment.status === "FAILED" && (
                            <Badge variant="destructive" className="w-fit">
                              Échoué
                            </Badge>
                          )}
                          {payment.status === "CANCELLED" && (
                            <Badge
                              variant="outline"
                              className="text-gray-500 w-fit"
                            >
                              Annulé
                            </Badge>
                          )}
                          {payment.status === "REFUNDED" && (
                            <Badge
                              variant="outline"
                              className="text-orange-500 border-orange-200 bg-orange-50 w-fit"
                            >
                              Remboursé
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {payment.amount.toFixed(2)}€
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {payment.allocations &&
                          payment.allocations.length > 0 ? (
                            <div className="space-y-1">
                              {payment.allocations.length > 1 && (
                                <span className="text-xs font-medium text-muted-foreground">
                                  Allocations:
                                </span>
                              )}
                              {payment.allocations.map((allocation: any) => {
                                const participantData = allocation.orderItem
                                  .participantData as any;
                                return (
                                  <div
                                    key={allocation.id}
                                    className="text-xs space-y-0.5"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {
                                          itemTypeLabels[
                                            allocation.orderItem
                                              .type as keyof typeof itemTypeLabels
                                          ]
                                        }
                                      </Badge>
                                      <span className="font-medium">
                                        {allocation.allocatedAmount.toFixed(2)}€
                                      </span>
                                    </div>
                                    {allocation.orderItem.type === "STAGE" &&
                                      allocation.orderItem.stage && (
                                        <div className="text-muted-foreground">
                                          Stage{" "}
                                          {
                                            stageTypeLabels[
                                              allocation.orderItem.stage
                                                .type as keyof typeof stageTypeLabels
                                            ]
                                          }{" "}
                                          du{" "}
                                          {format(
                                            new Date(
                                              allocation.orderItem.stage
                                                .startDate,
                                            ),
                                            "dd/MM/yyyy",
                                            { locale: fr },
                                          )}
                                        </div>
                                      )}
                                    {allocation.orderItem.type === "BAPTEME" &&
                                      allocation.orderItem.bapteme && (
                                        <div className="text-muted-foreground">
                                          Baptême{" "}
                                          {participantData?.selectedCategory
                                            ? baptemeCategoryLabels[
                                                participantData.selectedCategory as keyof typeof baptemeCategoryLabels
                                              ]
                                            : ""}{" "}
                                          du{" "}
                                          {format(
                                            new Date(
                                              allocation.orderItem.bapteme.date,
                                            ),
                                            "dd/MM/yyyy",
                                            { locale: fr },
                                          )}
                                        </div>
                                      )}

                                    {allocation.orderItem.type ===
                                      "GIFT_VOUCHER" && (
                                      <div className="text-muted-foreground">
                                        Bon cadeau de{" "}
                                        {allocation.orderItem.giftVoucherAmount?.toFixed(
                                          2,
                                        )}
                                        €
                                        {participantData?.voucherProductType && (
                                          <span className="ml-1">
                                            (
                                            {participantData.voucherProductType ===
                                            "STAGE"
                                              ? `Stage ${participantData.voucherStageCategory}`
                                              : `Baptême ${participantData.voucherBaptemeCategory}`}
                                            )
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Aucune allocation
                            </span>
                          )}
                          {payment.manualPaymentNote && (
                            <div className="text-xs text-muted-foreground mt-2">
                              <span className="font-medium">Note:</span>{" "}
                              {payment.manualPaymentNote}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
