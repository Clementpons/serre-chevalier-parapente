"use client";

import { useState } from "react";
import {
  PlusIcon,
  TrashIcon,
  UsersIcon,
  RefreshIcon,
  LoaderIcon,
  FilterIcon2,
  PhoneIcon,
  PencilLineIcon,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetAudiences,
  useResolveAudience,
} from "@/features/audiences/api/use-get-audiences";
import { useDeleteAudience } from "@/features/audiences/api/use-delete-audience";
import { AddAudienceDialog } from "./add-audience-dialog";
import { EditAudienceDialog } from "./edit-audience-dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const RULE_LABELS: Record<string, string> = {
  CLIENT_RESERVED_STAGE: "Réservé un stage",
  CLIENT_RESERVED_BAPTEME: "Réservé un baptême",
  STAGIAIRE_STAGE: "Participé à un stage",
  STAGIAIRE_BAPTEME: "Participé à un baptême",
  PURCHASED_GIFT_VOUCHER: "Acheté un bon cadeau",
  ORDER_ABOVE_AMOUNT: "Commande > X€",
};

// Composant de prévisualisation des contacts d'une audience
function AudiencePreviewDialog({
  audienceId,
  audienceName,
  open,
  onOpenChange,
}: {
  audienceId: string;
  audienceName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading, refetch, isFetching } =
    useResolveAudience(audienceId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Contacts — <span className="text-blue-600">{audienceName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {isLoading || isFetching
                ? "Calcul en cours..."
                : `${data?.count ?? 0} contact(s) unique(s)`}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshIcon
                className={`h-3.5 w-3.5 mr-1 ${isFetching ? "animate-spin" : ""}`}
              />
              Recalculer
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : data?.contacts && ((data.contacts as any[])?.length ?? 0) > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {(data?.contacts as any[])?.map((contact: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 border rounded-md text-sm"
                >
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    {contact.email && (
                      <p className="text-xs text-muted-foreground">
                        {contact.email}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <PhoneIcon className="h-3 w-3" />
                    <span className="font-mono text-xs">{contact.phone}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Aucun contact trouvé pour ces règles
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AudiencesSection() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editAudience, setEditAudience] = useState<any>(null);
  const [previewAudience, setPreviewAudience] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: audiences, isLoading } = useGetAudiences();
  const deleteAudience = useDeleteAudience();

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Supprimer l'audience "${name}" ?`)) {
      await deleteAudience.mutateAsync({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Audiences
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Groupes de contacts pour vos campagnes SMS
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="w-full sm:w-auto"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Créer une audience
        </Button>
      </div>

      {/* Liste des audiences */}
      {!audiences || audiences.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground space-y-2">
            <UsersIcon className="h-8 w-8 mx-auto opacity-30" />
            <p>Aucune audience créée</p>
            <p className="text-xs">
              Créez une audience pour segmenter vos contacts
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {audiences.map((audience: any) => (
            <Card
              key={audience.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base truncate">
                      {audience.name}
                    </CardTitle>
                    {audience.description && (
                      <CardDescription className="text-xs mt-1 line-clamp-2">
                        {audience.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 items-end shrink-0">
                    <Badge variant="secondary" className="text-xs">
                      {audience._count?.rules ?? audience.rules?.length ?? 0}{" "}
                      règle(s)
                    </Badge>
                    {(audience._count?.contacts > 0 ||
                      audience.contacts?.length > 0) && (
                      <Badge variant="outline" className="text-xs">
                        {audience._count?.contacts ??
                          audience.contacts?.length ??
                          0}{" "}
                        contact(s)
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Aperçu des règles */}
                <div className="space-y-1">
                  {audience.rules?.slice(0, 3).map((rule: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    >
                      <FilterIcon2 className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {RULE_LABELS[rule.ruleType] ?? rule.ruleType}
                        {rule.stageType && ` (${rule.stageType})`}
                        {rule.baptemeCategory && ` (${rule.baptemeCategory})`}
                        {rule.minOrderAmount && ` > ${rule.minOrderAmount}€`}
                        {rule.dateFrom &&
                          ` · du ${format(new Date(rule.dateFrom), "dd/MM/yy", { locale: fr })}`}
                        {rule.dateTo &&
                          ` au ${format(new Date(rule.dateTo), "dd/MM/yy", { locale: fr })}`}
                      </span>
                    </div>
                  ))}
                  {audience.rules?.length > 3 && (
                    <p className="text-xs text-muted-foreground pl-5">
                      +{audience.rules.length - 3} règle(s) supplémentaire(s)
                    </p>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  Créée le{" "}
                  {format(new Date(audience.createdAt), "dd/MM/yyyy", {
                    locale: fr,
                  })}
                </p>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() =>
                      setPreviewAudience({
                        id: audience.id,
                        name: audience.name,
                      })
                    }
                  >
                    <UsersIcon className="h-3.5 w-3.5 mr-1.5" />
                    Voir les contacts
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditAudience(audience)}
                  >
                    <PencilLineIcon className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(audience.id, audience.name)}
                    disabled={deleteAudience.isPending}
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <AddAudienceDialog open={showAddDialog} onOpenChange={setShowAddDialog} />

      {editAudience && (
        <EditAudienceDialog
          audience={editAudience}
          open={!!editAudience}
          onOpenChange={(open) => !open && setEditAudience(null)}
        />
      )}

      {previewAudience && (
        <AudiencePreviewDialog
          audienceId={previewAudience.id}
          audienceName={previewAudience.name}
          open={!!previewAudience}
          onOpenChange={(open) => !open && setPreviewAudience(null)}
        />
      )}
    </div>
  );
}
