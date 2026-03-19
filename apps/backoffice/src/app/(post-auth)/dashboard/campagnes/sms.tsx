"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PencilLineIcon,
  PlusIcon,
  RefreshIcon,
  SendIcon,
  TrashIcon,
  UsersIcon,
  HistoryIcon,
  PhoneIcon,
  LoaderIcon,
  MailCheckIcon,
} from "@/lib/icons";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetCampaigns } from "@/features/campaigns/api/use-get-campaigns";
import { useDeleteCampaign } from "@/features/campaigns/api/use-delete-campaign";
import { useSendCampaign } from "@/features/campaigns/api/use-send-campaign";
import { useResolveCampaign } from "@/features/campaigns/api/use-resolve-campaign";
import { AddCampaignDialog } from "./add-campaign-dialog";
import { EditCampaignDialog } from "./edit-campaign-dialog";
import { CampaignPreviewDialog } from "./campaign-preview-dialog";
import { CampaignLogsDialog } from "./campaign-logs-dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

function SMSSection() {
  const { data: campaigns, isLoading } = useGetCampaigns();
  const deleteCampaign = useDeleteCampaign();
  const sendCampaign = useSendCampaign();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editCampaign, setEditCampaign] = useState<any>(null);
  const [previewCampaign, setPreviewCampaign] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [logsCampaignId, setLogsCampaignId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <LoaderIcon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            Campagnes SMS
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gérez vos envois de SMS en masse à destination de vos audiences.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Nouvelle campagne
        </Button>
      </div>

      {!campaigns || campaigns.length === 0 ? (
        <div className="border border-dashed rounded-lg p-12 text-center bg-muted/10">
          <MailCheckIcon className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-medium text-lg">Aucune campagne</h3>
          <p className="text-sm text-muted-foreground">
            Vous n&apos;avez pas encore créé de campagne SMS.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign: any) => (
            <div
              key={campaign.id}
              className="border rounded-xl p-5 bg-card flex flex-col gap-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{campaign.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={
                        campaign.status === "DRAFT" ? "secondary" : "default"
                      }
                    >
                      {campaign.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                      Audience:{" "}
                      {campaign.audiences?.map((a: any) => a.name).join(", ") ||
                        "aucune"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-sm bg-muted/30 p-3 rounded-md border min-h-[80px]">
                {campaign.content}
              </div>

              {campaign.promoCodes && campaign.promoCodes.length > 0 && (
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-md border border-blue-100 flex flex-col gap-1">
                  <span>
                    <strong>{campaign.promoCodes.length}</strong> code(s) promo
                    lié(s).
                  </span>
                  <span className="truncate">
                    (Ex: {campaign.promoCodes[0].code})
                  </span>
                </div>
              )}
              {campaign.status === "DRAFT" && campaign.generatePromoCode && (
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-md border border-blue-100 flex items-center justify-between">
                  <span>Une promo sera générée à l&apos;envoi</span>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Créée le{" "}
                {format(new Date(campaign.createdAt), "dd/MM/yyyy", {
                  locale: fr,
                })}
              </div>

              <div className="flex gap-2 pt-2 border-t mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Voulez-vous vraiment supprimer cette campagne ?",
                      )
                    ) {
                      deleteCampaign.mutate(campaign.id);
                    }
                  }}
                  disabled={
                    deleteCampaign.isPending || campaign.status === "SENDING"
                  }
                >
                  <TrashIcon className="h-4 w-4 text-destructive" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <UsersIcon className="h-4 w-4 mr-2" />
                      Contacts
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setPreviewCampaign(campaign)}
                    >
                      <UsersIcon className="h-4 w-4 mr-2" />
                      Voir les contacts ciblés
                    </DropdownMenuItem>
                    {campaign.status !== "DRAFT" && (
                      <DropdownMenuItem
                        onClick={() => setLogsCampaignId(campaign.id)}
                      >
                        <HistoryIcon className="h-4 w-4 mr-2 text-orange-600" />
                        Voir le rapport d&apos;envoi
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {campaign.status === "DRAFT" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    title="Modifier la campagne"
                    onClick={() => setEditCampaign(campaign)}
                  >
                    <PencilLineIcon className="h-4 w-4 text-blue-600" />
                  </Button>
                )}

                {campaign.status === "DRAFT" && (
                  <Button
                    size="sm"
                    className="flex-[2]"
                    onClick={() => sendCampaign.mutate(campaign.id)}
                    disabled={sendCampaign.isPending}
                  >
                    <SendIcon className="h-4 w-4 mr-2" />
                    Envoyer
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddCampaignDialog open={isAddOpen} onOpenChange={setIsAddOpen} />

      {editCampaign && (
        <EditCampaignDialog
          campaign={editCampaign}
          open={!!editCampaign}
          onOpenChange={(open) => !open && setEditCampaign(null)}
        />
      )}

      <CampaignPreviewDialog
        campaign={previewCampaign}
        open={!!previewCampaign}
        onOpenChange={(open: boolean) => !open && setPreviewCampaign(null)}
      />

      <CampaignLogsDialog
        campaignId={logsCampaignId}
        open={!!logsCampaignId}
        onOpenChange={(open: boolean) => !open && setLogsCampaignId(null)}
      />
    </div>
  );
}

export default SMSSection;
