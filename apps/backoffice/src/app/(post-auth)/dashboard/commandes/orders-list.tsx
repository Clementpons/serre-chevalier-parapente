"use client";

import { useState } from "react";
import { useGetOrders } from "@/features/orders/api/use-get-orders";
import { useUpdateOrderStatus } from "@/features/orders/api/use-update-order-status";
import { useDeleteGhostOrders } from "@/features/orders/api/use-delete-ghost-orders";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  SearchIcon,
  ExternalLinkIcon,
  EditIcon,
  TrashIcon,
  EyeIcon2,
} from "@/lib/icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

const statusColors = {
  PENDING: "bg-yellow-500",
  PAID: "bg-green-500",
  PARTIALLY_PAID: "bg-orange-500",
  FULLY_PAID: "bg-green-700",
  CONFIRMED: "bg-blue-500",
  CANCELLED: "bg-red-500",
  REFUNDED: "bg-gray-500",
};

const statusLabels = {
  PENDING: "En attente",
  PAID: "Payée",
  PARTIALLY_PAID: "Acompte payé",
  FULLY_PAID: "Entièrement payée",
  CONFIRMED: "Confirmée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

const editableStatuses = ["PENDING", "PAID", "CONFIRMED", "CANCELLED", "REFUNDED"] as const;
type EditableStatus = (typeof editableStatuses)[number];

export function OrdersList() {
  const { data: orders, isLoading } = useGetOrders();
  const updateStatus = useUpdateOrderStatus();
  const deleteGhosts = useDeleteGhostOrders();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    orderId: string;
    orderNumber: string;
    currentStatus: string;
    newStatus: EditableStatus;
  }>({
    open: false,
    orderId: "",
    orderNumber: "",
    currentStatus: "",
    newStatus: "CONFIRMED",
  });
  const [ghostDialog, setGhostDialog] = useState(false);

  const filteredOrders = orders?.filter((order: any) => {
    const query = searchQuery.toLowerCase();
    return (
      order.orderNumber.toLowerCase().includes(query) ||
      order.client?.firstName?.toLowerCase().includes(query) ||
      order.client?.lastName?.toLowerCase().includes(query) ||
      order.client?.email?.toLowerCase().includes(query)
    );
  });

  const handleStatusChange = () => {
    updateStatus.mutate(
      {
        param: { id: statusDialog.orderId },
        json: { status: statusDialog.newStatus },
      },
      { onSettled: () => setStatusDialog((s) => ({ ...s, open: false })) }
    );
  };

  const handleGhostCleanup = () => {
    deleteGhosts.mutate(undefined, {
      onSettled: () => setGhostDialog(false),
    });
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
            Commandes
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérez toutes les commandes de votre établissement
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setGhostDialog(true)}
          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 w-fit"
        >
          <TrashIcon className="h-4 w-4 mr-2" />
          Nettoyer les fantômes
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher par numéro de commande, nom ou email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des commandes</CardTitle>
          <CardDescription>
            {filteredOrders?.length || 0} commande(s) trouvée(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!filteredOrders || filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      Aucune commande trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/dashboard/commandes/${order.id}`}
                          className="hover:underline text-blue-600"
                        >
                          {order.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {order.client ? (
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {order.client.firstName} {order.client.lastName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {order.client.email}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.createdAt), "dd/MM/yyyy", {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {order.orderItems.map((item: any) => (
                            <Badge
                              key={item.id}
                              variant="outline"
                              className="text-xs"
                            >
                              {item.quantity}x {item.type}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {order.totalAmount.toFixed(2)}€
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${
                            statusColors[
                              order.status as keyof typeof statusColors
                            ]
                          } text-white`}
                        >
                          {
                            statusLabels[
                              order.status as keyof typeof statusLabels
                            ]
                          }
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/dashboard/commandes/${order.id}`}>
                            <Button variant="ghost" size="sm" title="Voir le détail de la commande">
                              <EyeIcon2 className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Changer le statut"
                            onClick={() =>
                              setStatusDialog({
                                open: true,
                                orderId: order.id,
                                orderNumber: order.orderNumber,
                                currentStatus: order.status,
                                newStatus: order.status as EditableStatus,
                              })
                            }
                          >
                            <EditIcon className="h-4 w-4" />
                          </Button>
                          <Link
                            href={`/dashboard/reservations?order=${order.id}`}
                          >
                            <Button variant="ghost" size="sm" title="Voir les réservations">
                              <ExternalLinkIcon className="h-4 w-4" />
                            </Button>
                          </Link>
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

      {/* Status change dialog */}
      <Dialog
        open={statusDialog.open}
        onOpenChange={(open) => setStatusDialog((s) => ({ ...s, open }))}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Changer le statut</DialogTitle>
            <DialogDescription>
              Commande {statusDialog.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <Label htmlFor="newStatus">Nouveau statut</Label>
            <Select
              value={statusDialog.newStatus}
              onValueChange={(v) =>
                setStatusDialog((s) => ({
                  ...s,
                  newStatus: v as EditableStatus,
                }))
              }
            >
              <SelectTrigger id="newStatus">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {editableStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setStatusDialog((s) => ({ ...s, open: false }))}
            >
              Annuler
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={
                updateStatus.isPending ||
                statusDialog.newStatus === statusDialog.currentStatus
              }
            >
              {updateStatus.isPending ? "Enregistrement..." : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ghost cleanup confirmation dialog */}
      <Dialog open={ghostDialog} onOpenChange={setGhostDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Nettoyer les commandes fantômes</DialogTitle>
            <DialogDescription>
              Supprime définitivement toutes les commandes PENDING sans paiement
              réussi créées il y a plus de 24h. Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGhostDialog(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleGhostCleanup}
              disabled={deleteGhosts.isPending}
            >
              {deleteGhosts.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
