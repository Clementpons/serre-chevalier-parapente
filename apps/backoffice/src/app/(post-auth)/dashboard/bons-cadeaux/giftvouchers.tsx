"use client";

import { useState } from "react";
import {
  SadIcon,
  RefreshIcon,
  GiftCardIcon,
  EyeIcon2,
  EyeOffIcon,
  EditIcon,
  UserIcon,
  PlusIcon,
  ExternalLinkIcon,
  CalendarIcon,
  TagIcon,
} from "@/lib/icons";
import { AddGiftVoucherDialog } from "./add-giftvoucher-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useRouter } from "next/navigation";
import { useGetGiftVouchers } from "@/features/giftvouchers/api/use-get-giftvouchers";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

export function GiftVouchers() {
  const [showUsedVouchers, setShowUsedVouchers] = useState(false);
  const [visibleCodes, setVisibleCodes] = useState<Set<string>>(new Set());
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { data: vouchers, isLoading } = useGetGiftVouchers();

  const router = useRouter();

  const toggleCodeVisibility = (voucherId: string) => {
    const newVisibleCodes = new Set(visibleCodes);
    if (newVisibleCodes.has(voucherId)) {
      newVisibleCodes.delete(voucherId);
    } else {
      newVisibleCodes.add(voucherId);
    }
    setVisibleCodes(newVisibleCodes);
  };

  const formatCode = (code: string, isVisible: boolean) => {
    if (isVisible) return code;
    return code.replace(/./g, "•");
  };

  const getCategoryLabel = (voucher: any) => {
    if (voucher.productType === "STAGE") {
      return voucher.stageCategory;
    }
    return voucher.baptemeCategory;
  };

  const getTypeLabel = (type: string) => {
    return type === "STAGE" ? "Stage" : "Baptême";
  };

  if (isLoading) {
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

  if (!vouchers) {
    return (
      <div className="bg-slate-200 text-slate-800 rounded-md p-8 flex flex-col items-center justify-center border border-slate-400 gap-4">
        <SadIcon />
        <div className="flex flex-col items-center">
          <p>Aucun bon cadeau n&apos;a été trouvé.</p>
          <p className="text-xs">
            Ceci peut être dû à une erreur de connexion avec la base de données.
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
            Rafraîchir la page
          </Button>
        </div>
      </div>
    );
  }

  const unusedVouchers = vouchers.filter((v: any) => !v.isUsed);
  const usedVouchers = vouchers.filter((v: any) => v.isUsed);
  const expiredVouchers = unusedVouchers.filter(
    (v: any) => new Date(v.expiryDate) < new Date()
  );
  const activeVouchers = unusedVouchers.filter(
    (v: any) => new Date(v.expiryDate) >= new Date()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Bons Cadeaux
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez les bons cadeaux (places gratuites) de votre établissement
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="w-full sm:w-auto"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Créer un bon cadeau
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bons actifs</CardTitle>
            <GiftCardIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {activeVouchers.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Valeur totale:{" "}
              {activeVouchers
                .reduce((sum: number, v: any) => sum + v.purchasePrice, 0)
                .toFixed(2)}
              €
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bons utilisés</CardTitle>
            <GiftCardIcon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {usedVouchers.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Valeur totale:{" "}
              {usedVouchers
                .reduce((sum: number, v: any) => sum + v.purchasePrice, 0)
                .toFixed(2)}
              €
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bons expirés</CardTitle>
            <GiftCardIcon className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-600">
              {expiredVouchers.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Valeur totale:{" "}
              {expiredVouchers
                .reduce((sum: number, v: any) => sum + v.purchasePrice, 0)
                .toFixed(2)}
              €
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Vouchers Section */}
      <Card>
        <CardHeader>
          <CardTitle>Bons Cadeaux Actifs</CardTitle>
          <CardDescription>
            Liste des bons cadeaux disponibles à l&apos;utilisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeVouchers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun bon cadeau actif
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeVouchers.map((voucher: any) => (
                <Card
                  key={voucher.id}
                  className="border-l-4 border-l-green-500"
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          Actif
                        </Badge>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {voucher.purchasePrice.toFixed(2)}€
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Valeur du bon
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Code:</span>
                          <code className="bg-muted px-2 py-1 rounded text-sm flex-1 font-mono">
                            {formatCode(
                              voucher.code,
                              visibleCodes.has(voucher.id)
                            )}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCodeVisibility(voucher.id)}
                          >
                            {visibleCodes.has(voucher.id) ? (
                              <EyeOffIcon className="h-4 w-4" />
                            ) : (
                              <EyeIcon2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <TagIcon className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">
                            {getTypeLabel(voucher.productType)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {getCategoryLabel(voucher)}
                          </Badge>
                        </div>

                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            Expire le{" "}
                            {format(
                              new Date(voucher.expiryDate),
                              "dd/MM/yyyy",
                              { locale: fr }
                            )}
                          </div>
                          <div>
                            Créé le{" "}
                            {format(new Date(voucher.createdAt), "dd/MM/yyyy", {
                              locale: fr,
                            })}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-xs font-medium">
                            Bénéficiaire:
                          </div>
                          <div className="text-sm">{voucher.recipientName}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {voucher.recipientEmail}
                          </div>
                        </div>

                        {voucher.client && (
                          <div className="flex items-center gap-1 text-sm pt-2 border-t">
                            <UserIcon className="h-3 w-3" />
                            <span className="text-xs">Acheté par:</span>
                            <Link
                              href={`/dashboard/customers/${voucher.client.id}`}
                              className="text-blue-600 hover:underline text-xs truncate"
                            >
                              {voucher.client.firstName}{" "}
                              {voucher.client.lastName}
                            </Link>
                          </div>
                        )}

                        {voucher.reservedBySessionId && (
                          <Badge
                            variant="outline"
                            className="w-full justify-center text-xs"
                          >
                            🔒 Réservé (dans un panier)
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expired Vouchers Section */}
      {expiredVouchers.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Bons Cadeaux Expirés</CardTitle>
            <CardDescription>
              Ces bons ne peuvent plus être utilisés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {expiredVouchers.map((voucher: any) => (
                <Card
                  key={voucher.id}
                  className="border-l-4 border-l-red-500 opacity-60"
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="destructive">Expiré</Badge>
                        <div className="text-right">
                          <div className="text-lg font-bold text-red-600">
                            {voucher.purchasePrice.toFixed(2)}€
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Code:</span>
                          <code className="bg-muted px-2 py-1 rounded text-sm flex-1 font-mono">
                            {formatCode(
                              voucher.code,
                              visibleCodes.has(voucher.id)
                            )}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleCodeVisibility(voucher.id)}
                          >
                            {visibleCodes.has(voucher.id) ? (
                              <EyeOffIcon className="h-4 w-4" />
                            ) : (
                              <EyeIcon2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <TagIcon className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">
                            {getTypeLabel(voucher.productType)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {getCategoryLabel(voucher)}
                          </Badge>
                        </div>

                        <div className="text-xs text-red-600">
                          Expiré le{" "}
                          {format(new Date(voucher.expiryDate), "dd/MM/yyyy", {
                            locale: fr,
                          })}
                        </div>

                        <div className="space-y-1">
                          <div className="text-xs font-medium">
                            Bénéficiaire:
                          </div>
                          <div className="text-sm">{voucher.recipientName}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Used Vouchers Section (Collapsible) */}
      <Collapsible open={showUsedVouchers} onOpenChange={setShowUsedVouchers}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bons Cadeaux Utilisés</CardTitle>
                  <CardDescription>
                    Historique des bons cadeaux utilisés
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm">
                  {showUsedVouchers ? "Masquer" : "Afficher"}
                </Button>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              {usedVouchers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucun bon cadeau utilisé
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {usedVouchers.map((voucher: any) => (
                    <Card
                      key={voucher.id}
                      className="border-l-4 border-l-blue-500"
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-blue-800"
                            >
                              Utilisé
                            </Badge>
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-600">
                                {voucher.purchasePrice.toFixed(2)}€
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Code:</span>
                              <code className="bg-muted px-2 py-1 rounded text-sm flex-1 font-mono">
                                {formatCode(
                                  voucher.code,
                                  visibleCodes.has(voucher.id)
                                )}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleCodeVisibility(voucher.id)}
                              >
                                {visibleCodes.has(voucher.id) ? (
                                  <EyeOffIcon className="h-4 w-4" />
                                ) : (
                                  <EyeIcon2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <TagIcon className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium">
                                {getTypeLabel(voucher.productType)}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {getCategoryLabel(voucher)}
                              </Badge>
                            </div>

                            <div className="text-xs text-muted-foreground">
                              Utilisé le{" "}
                              {voucher.usedAt &&
                                format(new Date(voucher.usedAt), "dd/MM/yyyy", {
                                  locale: fr,
                                })}
                            </div>

                            <div className="space-y-1">
                              <div className="text-xs font-medium">
                                Bénéficiaire:
                              </div>
                              <div className="text-sm">
                                {voucher.recipientName}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {voucher.recipientEmail}
                              </div>
                            </div>

                            {voucher.client && (
                              <div className="flex items-center gap-1 text-sm pt-2 border-t">
                                <UserIcon className="h-3 w-3" />
                                <span className="text-xs">Acheté par:</span>
                                <Link
                                  href={`/dashboard/customers/${voucher.client.id}`}
                                  className="text-blue-600 hover:underline text-xs truncate"
                                >
                                  {voucher.client.firstName}{" "}
                                  {voucher.client.lastName}
                                </Link>
                              </div>
                            )}

                            {voucher.usedInOrderItem && (
                              <div className="pt-2">
                                <Link
                                  href={`/dashboard/reservations/${voucher.usedInOrderItem.orderId}`}
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                  >
                                    <ExternalLinkIcon className="h-4 w-4 mr-2" />
                                    Voir la réservation
                                  </Button>
                                </Link>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Add Dialog */}
      <AddGiftVoucherDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
}
