"use client";

import { useState } from "react";
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  TagIcon,
  PercentIcon2,
  EuroSignIcon,
  CopyIcon,
  CheckIcon,
  UsersIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetPromoCodes } from "@/features/promocodes/api/use-get-promocodes";
import { useDeletePromoCode } from "@/features/promocodes/api/use-delete-promocode";
import { AddPromoCodeDialog } from "./add-promocode-dialog";
import { EditPromoCodeDialog } from "./edit-promocode-dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

export function PromoCodesSection() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const { data: promoCodes, isLoading } = useGetPromoCodes();
  const deletePromoCode = useDeletePromoCode();

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDelete = async (id: string, code: string) => {
    if (confirm(`Supprimer le code promo "${code}" ?`)) {
      await deletePromoCode.mutateAsync({ id });
    }
  };

  const getDiscountLabel = (promoCode: any) => {
    if (promoCode.discountType === "FIXED") {
      return `-${promoCode.discountValue.toFixed(2)}€`;
    }
    const label = `-${promoCode.discountValue}%`;
    if (promoCode.maxDiscountAmount) {
      return `${label} (max ${promoCode.maxDiscountAmount.toFixed(2)}€)`;
    }
    return label;
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isMaxedOut = (promoCode: any) => {
    if (!promoCode.maxUses) return false;
    return promoCode.currentUses >= promoCode.maxUses;
  };

  const getStatus = (promoCode: any) => {
    if (!promoCode.isActive)
      return {
        label: "Inactif",
        variant: "secondary" as const,
        icon: XCircleIcon,
        color: "text-gray-500",
      };
    if (isExpired(promoCode.expiryDate))
      return {
        label: "Expiré",
        variant: "destructive" as const,
        icon: AlertTriangleIcon,
        color: "text-red-500",
      };
    if (isMaxedOut(promoCode))
      return {
        label: "Épuisé",
        variant: "destructive" as const,
        icon: AlertTriangleIcon,
        color: "text-orange-500",
      };
    return {
      label: "Actif",
      variant: "default" as const,
      icon: CheckCircleIcon,
      color: "text-green-500",
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const activeCodes =
    promoCodes?.filter(
      (c: any) => c.isActive && !isExpired(c.expiryDate) && !isMaxedOut(c),
    ) ?? [];
  const totalUses =
    promoCodes?.reduce((sum: number, c: any) => sum + c.currentUses, 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Codes Promo
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez les codes de réduction utilisables au checkout
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="w-full sm:w-auto"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Créer un code promo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Codes actifs</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCodes.length}</div>
            <p className="text-xs text-muted-foreground">
              sur {promoCodes?.length ?? 0} total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Utilisations totales
            </CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUses}</div>
            <p className="text-xs text-muted-foreground">
              toutes campagnes confondues
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Codes inactifs/expirés
            </CardTitle>
            <XCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(promoCodes?.length ?? 0) - activeCodes.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des codes promo</CardTitle>
          <CardDescription>
            Cliquez sur un code pour voir l&apos;historique des utilisations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!promoCodes || promoCodes.length === 0 ? (
            <div className="text-center text-muted-foreground py-12 space-y-2">
              <TagIcon className="h-8 w-8 mx-auto opacity-30" />
              <p>Aucun code promo créé</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Réduction</TableHead>
                    <TableHead>Règles</TableHead>
                    <TableHead>Utilisations</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoCodes.map((promoCode: any) => {
                    const status = getStatus(promoCode);
                    const StatusIcon = status.icon;

                    return (
                      <TableRow key={promoCode.id}>
                        {/* Code */}
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <code className="font-mono font-bold text-sm bg-muted px-2 py-0.5 rounded">
                                {promoCode.code}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleCopyCode(promoCode.code)}
                              >
                                {copiedCode === promoCode.code ? (
                                  <CheckIcon className="h-3 w-3 text-green-500" />
                                ) : (
                                  <CopyIcon className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                            {promoCode.label && (
                              <p className="text-xs text-muted-foreground">
                                {promoCode.label}
                              </p>
                            )}
                            {promoCode.recipientNote && (
                              <p className="text-xs text-blue-600 italic">
                                {promoCode.recipientNote}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        {/* Réduction */}
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {promoCode.discountType === "PERCENTAGE" ? (
                              <PercentIcon2 className="h-3.5 w-3.5 text-purple-500" />
                            ) : (
                              <EuroSignIcon className="h-3.5 w-3.5 text-blue-500" />
                            )}
                            <span className="font-medium text-sm">
                              {getDiscountLabel(promoCode)}
                            </span>
                          </div>
                        </TableCell>

                        {/* Règles */}
                        <TableCell>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            {promoCode.minCartAmount && (
                              <div>
                                Min panier :{" "}
                                {promoCode.minCartAmount.toFixed(2)}€
                              </div>
                            )}
                            {promoCode.campaignId && (
                              <Badge variant="outline" className="text-xs">
                                Via campagne SMS
                              </Badge>
                            )}
                            {!promoCode.minCartAmount &&
                              !promoCode.campaignId && (
                                <span className="text-muted-foreground">—</span>
                              )}
                          </div>
                        </TableCell>

                        {/* Utilisations */}
                        <TableCell>
                          <div className="text-sm">
                            <span className="font-medium">
                              {promoCode.currentUses}
                            </span>
                            {promoCode.maxUses ? (
                              <span className="text-muted-foreground">
                                {" "}
                                / {promoCode.maxUses}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">
                                {" "}
                                / ∞
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Expiration */}
                        <TableCell>
                          {promoCode.expiryDate ? (
                            <span
                              className={`text-sm ${isExpired(promoCode.expiryDate) ? "text-red-500 font-medium" : "text-muted-foreground"}`}
                            >
                              {format(
                                new Date(promoCode.expiryDate),
                                "dd/MM/yyyy",
                                { locale: fr },
                              )}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              ∞
                            </span>
                          )}
                        </TableCell>

                        {/* Statut */}
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <StatusIcon className={`h-4 w-4 ${status.color}`} />
                            <Badge variant={status.variant} className="text-xs">
                              {status.label}
                            </Badge>
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingPromoCode(promoCode)}
                                >
                                  <EditIcon className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Modifier</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                    handleDelete(promoCode.id, promoCode.code)
                                  }
                                  disabled={
                                    deletePromoCode.isPending ||
                                    promoCode.currentUses > 0
                                  }
                                >
                                  <TrashIcon className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {promoCode.currentUses > 0
                                  ? "Impossible (déjà utilisé — désactivez à la place)"
                                  : "Supprimer"}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddPromoCodeDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
      <EditPromoCodeDialog
        open={!!editingPromoCode}
        onOpenChange={(open) => !open && setEditingPromoCode(null)}
        promoCode={editingPromoCode}
      />
    </div>
  );
}
