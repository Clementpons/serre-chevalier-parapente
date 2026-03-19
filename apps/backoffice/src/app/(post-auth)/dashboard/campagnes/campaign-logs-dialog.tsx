"use client";

import { useGetCampaignById } from "@/features/campaigns/api/use-get-campaign";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircleIcon, XCircleIcon, LoaderIcon } from "@/lib/icons";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CampaignLogsDialogProps {
  campaignId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CampaignLogsDialog({
  campaignId,
  open,
  onOpenChange,
}: CampaignLogsDialogProps) {
  const { data: campaign, isLoading } = useGetCampaignById(campaignId || "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Rapport d&apos;envoi : {campaign?.name || "Chargement..."}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <LoaderIcon className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="flex-1 mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Destinataire</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date d&apos;envoi</TableHead>
                  <TableHead>Détails / Erreur</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaign?.logs?.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Aucun log disponible pour cette campagne.
                    </TableCell>
                  </TableRow>
                )}
                {campaign?.logs?.map((log: any) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      {log.recipientName || "-"}
                    </TableCell>
                    <TableCell>{log.recipientPhone}</TableCell>
                    <TableCell>
                      {log.status === "SENT" || log.status === "DELIVERED" ? (
                        <div className="flex items-center text-green-600 gap-1">
                          <CheckCircleIcon className="h-4 w-4" />
                          <span>Envoyé</span>
                        </div>
                      ) : log.status === "FAILED" ? (
                        <div className="flex items-center text-destructive gap-1">
                          <XCircleIcon className="h-4 w-4" />
                          <span>Échec</span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="animate-pulse">
                          {log.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.sentAt
                        ? format(new Date(log.sentAt), "dd MMM HH:mm", {
                            locale: fr,
                          })
                        : "-"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                      {log.errorMessage || log.messageSid || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
