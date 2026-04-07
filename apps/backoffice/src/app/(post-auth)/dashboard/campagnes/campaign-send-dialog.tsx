"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  CheckCircleIcon,
  LoaderIcon,
  SearchIcon,
  SendIcon,
} from "@/lib/icons";
import { useResolveCampaign } from "@/features/campaigns/api/use-resolve-campaign";
import { useGetCampaignById } from "@/features/campaigns/api/use-get-campaign";
import { useSendContacts } from "@/features/campaigns/api/use-send-contacts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CampaignSendDialogProps {
  campaign: { id: string; name: string } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Filter = "all" | "pending" | "sent";

export function CampaignSendDialog({
  campaign,
  open,
  onOpenChange,
}: CampaignSendDialogProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<Filter>("pending");
  const [search, setSearch] = useState("");
  // Suivi local des envois dans cette session (pour UI instantanée)
  const [localSent, setLocalSent] = useState<Set<string>>(new Set());
  const [localFailed, setLocalFailed] = useState<Set<string>>(new Set());
  const [sendingPhones, setSendingPhones] = useState<Set<string>>(new Set());

  const queryClient = useQueryClient();

  const { data: resolvedData, isLoading: isLoadingContacts } = useResolveCampaign(
    campaign?.id ?? "",
    open,
  );

  const { data: campaignDetail, isLoading: isLoadingLogs } = useGetCampaignById(
    campaign?.id ?? "",
  );

  const sendContacts = useSendContacts(campaign?.id ?? "");

  // Index des numéros déjà envoyés (depuis les logs en base)
  const dbSentPhones = useMemo<Set<string>>(() => {
    const logs: any[] = campaignDetail?.logs ?? [];
    return new Set(
      logs.filter((l) => l.status === "SENT" || l.status === "DELIVERED").map((l) => l.recipientPhone),
    );
  }, [campaignDetail?.logs]);

  const isSent = (phone: string) => dbSentPhones.has(phone) || localSent.has(phone);
  const isFailed = (phone: string) => localFailed.has(phone);
  const isSending = (phone: string) => sendingPhones.has(phone);

  const allContacts: { name: string; phone: string }[] = resolvedData?.contacts ?? [];

  const filteredContacts = useMemo(() => {
    const sent = (phone: string) => dbSentPhones.has(phone) || localSent.has(phone);
    let list = allContacts;
    if (filter === "pending") list = list.filter((c) => !sent(c.phone));
    if (filter === "sent") list = list.filter((c) => sent(c.phone));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) || c.phone.includes(q),
      );
    }
    return list;
  }, [allContacts, filter, search, localSent, dbSentPhones]);

  const sentCount = allContacts.filter((c) => isSent(c.phone)).length;
  const pendingCount = allContacts.length - sentCount;

  const toggleSelect = (phone: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(phone)) {
        next.delete(phone);
      } else {
        next.add(phone);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    const pendingVisible = filteredContacts.filter((c) => !isSent(c.phone));
    if (selected.size === pendingVisible.length && pendingVisible.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pendingVisible.map((c) => c.phone)));
    }
  };

  const handleSend = async (phones: string[]) => {
    if (phones.length === 0) return;

    setSendingPhones((prev) => new Set([...prev, ...phones]));
    setSelected(new Set());

    try {
      const results = await sendContacts.mutateAsync(phones);

      const newSent = new Set(localSent);
      const newFailed = new Set(localFailed);

      results.forEach((r) => {
        if (r.success) {
          newSent.add(r.phone);
          newFailed.delete(r.phone);
        } else if (r.error !== "Déjà envoyé") {
          newFailed.add(r.phone);
        }
      });

      setLocalSent(newSent);
      setLocalFailed(newFailed);

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success && r.error !== "Déjà envoyé").length;

      if (successCount > 0)
        toast.success(`${successCount} SMS envoyé${successCount > 1 ? "s" : ""} avec succès`);
      if (failCount > 0)
        toast.error(`${failCount} envoi${failCount > 1 ? "s" : ""} échoué${failCount > 1 ? "s" : ""}`);
    } catch {
      // handled by hook
    } finally {
      setSendingPhones((prev) => {
        const next = new Set(prev);
        phones.forEach((p) => next.delete(p));
        return next;
      });
    }
  };

  // Marquer la campagne comme terminée
  const markComplete = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/campaigns/${campaign?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });
      if (!res.ok) throw new Error("Erreur");
    },
    onSuccess: () => {
      toast.success("Campagne marquée comme terminée");
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      onOpenChange(false);
    },
    onError: () => toast.error("Impossible de marquer comme terminée"),
  });

  const isLoading = isLoadingContacts || isLoadingLogs;
  const pendingVisible = filteredContacts.filter((c) => !isSent(c.phone));
  const allPendingSelected =
    pendingVisible.length > 0 && selected.size === pendingVisible.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-lg">
            Envoi de la campagne — {campaign?.name}
          </DialogTitle>
          {!isLoading && (
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-sm text-muted-foreground">
                <strong>{allContacts.length}</strong> contacts au total
              </span>
              <Badge variant="secondary" className="text-green-700 bg-green-50 border-green-200">
                {sentCount} envoyés
              </Badge>
              <Badge variant="outline">
                {pendingCount} restants
              </Badge>
            </div>
          )}
        </DialogHeader>

        {/* Filtres + recherche */}
        <div className="flex items-center gap-2 px-6 py-3 border-b flex-wrap">
          {(["all", "pending", "sent"] as Filter[]).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Tous" : f === "pending" ? "À envoyer" : "Déjà envoyés"}
            </Button>
          ))}
          <div className="relative ml-auto">
            <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="h-7 pl-7 text-xs w-48"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <ScrollArea className="flex-1 min-h-0">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <LoaderIcon className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              Aucun contact correspondant
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/60 backdrop-blur-sm z-10">
                <tr className="border-b">
                  <th className="px-4 py-2 text-left w-10">
                    <Checkbox
                      checked={allPendingSelected}
                      onCheckedChange={toggleSelectAll}
                      disabled={pendingVisible.length === 0}
                    />
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Nom</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Téléphone</th>
                  <th className="px-4 py-2 text-center font-medium text-muted-foreground">Statut</th>
                  <th className="px-4 py-2 text-right font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => {
                  const sent = isSent(contact.phone);
                  const failed = isFailed(contact.phone);
                  const sending = isSending(contact.phone);
                  const isChecked = selected.has(contact.phone);

                  return (
                    <tr
                      key={contact.phone}
                      className={`border-b transition-colors ${
                        sent ? "bg-green-50/50" : isChecked ? "bg-blue-50/40" : "hover:bg-muted/30"
                      }`}
                    >
                      <td className="px-4 py-2.5">
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleSelect(contact.phone)}
                          disabled={sent || sending}
                        />
                      </td>
                      <td className="px-4 py-2.5 font-medium">
                        {contact.name || <span className="text-muted-foreground italic">Sans nom</span>}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">
                        {contact.phone}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {sending ? (
                          <LoaderIcon className="h-4 w-4 animate-spin text-blue-500 inline" />
                        ) : sent ? (
                          <div className="flex items-center justify-center gap-1 text-green-600">
                            <CheckCircleIcon className="h-4 w-4" />
                            <span className="text-xs">Envoyé</span>
                          </div>
                        ) : failed ? (
                          <Badge variant="destructive" className="text-xs">Échec</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground">En attente</Badge>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {!sent && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs px-2"
                            disabled={sending || sendContacts.isPending}
                            onClick={() => handleSend([contact.phone])}
                          >
                            {sending ? (
                              <LoaderIcon className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <>
                                <SendIcon className="h-3.5 w-3.5 mr-1" />
                                Envoyer
                              </>
                            )}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between gap-3 flex-wrap">
          <div className="text-sm text-muted-foreground">
            {selected.size > 0 ? (
              <span><strong>{selected.size}</strong> contact{selected.size > 1 ? "s" : ""} sélectionné{selected.size > 1 ? "s" : ""}</span>
            ) : (
              <span>Sélectionnez des contacts pour un envoi groupé</span>
            )}
          </div>
          <div className="flex gap-2">
            {pendingCount === 0 && allContacts.length > 0 && campaignDetail?.status !== "COMPLETED" && (
              <Button
                variant="default"
                size="sm"
                onClick={() => markComplete.mutate()}
                disabled={markComplete.isPending}
              >
                {markComplete.isPending && <LoaderIcon className="h-4 w-4 animate-spin mr-2" />}
                Marquer comme terminée
              </Button>
            )}
            {selected.size > 0 && (
              <Button
                size="sm"
                disabled={sendContacts.isPending}
                onClick={() => handleSend(Array.from(selected))}
              >
                {sendContacts.isPending ? (
                  <LoaderIcon className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <SendIcon className="h-4 w-4 mr-2" />
                )}
                Envoyer la sélection ({selected.size})
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
