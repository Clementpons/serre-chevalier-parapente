"use client";

import { useResolveCampaign } from "@/features/campaigns/api/use-resolve-campaign";
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
import { LoaderIcon, UsersIcon } from "@/lib/icons";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface CampaignPreviewDialogProps {
  campaign: { id: string; name: string } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CampaignPreviewDialog({
  campaign,
  open,
  onOpenChange,
}: CampaignPreviewDialogProps) {
  const { data, isLoading } = useResolveCampaign(campaign?.id || "", open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-blue-600" />
            <DialogTitle>
              Contacts ciblés : {campaign?.name || "Chargement..."}
            </DialogTitle>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <LoaderIcon className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="px-1 py-2 text-sm text-muted-foreground">
              Total : <Badge variant="secondary">{data?.count || 0}</Badge>{" "}
              contacts uniques trouvés.
            </div>

            <ScrollArea className="flex-1 mt-2 border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Téléphone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.contacts?.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={2}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Aucun contact trouvé pour cette sélection.
                      </TableCell>
                    </TableRow>
                  )}
                  {data?.contacts?.map((contact: any, idx: number) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {contact.name || "Inconnu"}
                      </TableCell>
                      <TableCell>{contact.phone}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
