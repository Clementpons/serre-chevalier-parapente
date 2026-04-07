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
import { Input } from "@/components/ui/input";
import {
  CheckCircleIcon,
  LoaderIcon,
  SearchIcon,
  SendIcon,
  RefreshIcon,
} from "@/lib/icons";
import {
  useContactsStatus,
  type ContactWithStatus,
} from "@/features/campaigns/api/use-contacts-status";
import { useSendContacts } from "@/features/campaigns/api/use-send-contacts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CampaignSendDialogProps {
  campaign: { id: string; name: string } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Filter = "all" | "pending" | "sent" | "failed";

export function CampaignSendDialog({
  campaign,
  open,
  onOpenChange,
}: CampaignSendDialogProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<Filter>("pending");
  const [search, setSearch] = useState("");
  const [sendingPhones, setSendingPhones] = useState<Set<string>>(new Set());
  // Optimistic local state pour feedback immédiat
  const [localSent, setLocalSent] = useState<Set<string>>(new Set());
  const [localFailed, setLocalFailed] = useState<Set<string>>(new Set());

  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useContactsStatus(campaign?.id ?? "", open);
  const sendContacts = useSendContacts(campaign?.id ?? "");

  const allContacts: ContactWithStatus[] = data?.contacts ?? [];

  const isSent = (c: ContactWithStatus) => c.sent || localSent.has(c.phone);
  const isFailed = (c: ContactWithStatus) => (c.failed && !c.sent) || localFailed.has(c.phone);
  const isSending = (phone: string) => sendingPhones.has(phone);

  const sentCount = allContacts.filter(isSent).length;
  const failedCount = allContacts.filter((c) => isFailed(c)).length;
  const pendingCount = allContacts.length - sentCount - failedCount;

  const filteredContacts = useMemo(() => {
    let list = allContacts;
    if (filter === "pending") list = list.filter((c) => !c.sent && !localSent.has(c.phone) && !c.failed && !localFailed.has(c.phone));
    if (filter === "sent") list = list.filter((c) => c.sent || localSent.has(c.phone));
    if (filter === "failed") list = list.filter((c) => (c.failed || localFailed.has(c.phone)) && !c.sent && !localSent.has(c.phone));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) => c.name?.toLowerCase().includes(q) || c.phone.includes(q),
      );
    }
    return list;
  }, [allContacts, filter, search, localSent]);

  const pendingVisible = filteredContacts.filter((c) => !isSent(c));

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

      // Rafraîchir les données depuis le serveur
      await refetch();
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

  const allPendingSelected =
    pendingVisible.length > 0 && selected.size === pendingVisible.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full flex flex-col" style={{ maxHeight: "90vh", padding: 0 }}>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Envoi — {campaign?.name}
            </DialogTitle>
          </DialogHeader>
          {!isLoading && (
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-sm text-muted-foreground">
                <strong>{allContacts.length}</strong> contacts au total
              </span>
              <Badge className="text-green-700 bg-green-50 border border-green-200 shadow-none">
                {sentCount} envoyés
              </Badge>
              <Badge variant="outline">
                {pendingCount} restants
              </Badge>
              {failedCount > 0 && (
                <Badge variant="destructive" className="cursor-pointer" onClick={() => setFilter("failed")}>
                  {failedCount} échec{failedCount > 1 ? "s" : ""}
                </Badge>
              )}
              <Button variant="ghost" size="sm" className="h-6 px-2 ml-auto" onClick={() => refetch()}>
                <RefreshIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>

        {/* Filtres + recherche */}
        <div className="flex items-center gap-2 px-6 py-3 border-b shrink-0 flex-wrap">
          {([
            { key: "all", label: `Tous (${allContacts.length})` },
            { key: "pending", label: `À envoyer (${pendingCount})` },
            { key: "sent", label: `Envoyés (${sentCount})` },
            ...(failedCount > 0 ? [{ key: "failed", label: `Échecs (${failedCount})` }] : []),
          ] as { key: Filter; label: string }[]).map(({ key, label }) => (
            <Button
              key={key}
              variant={filter === key ? "default" : key === "failed" ? "outline" : "outline"}
              size="sm"
              className={`h-7 text-xs ${key === "failed" ? "border-destructive text-destructive hover:bg-destructive hover:text-white" : ""} ${filter === key && key === "failed" ? "bg-destructive text-white" : ""}`}
              onClick={() => setFilter(key)}
            >
              {label}
            </Button>
          ))}
          <div className="relative ml-auto">
            <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="h-7 pl-7 text-xs w-44"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table scrollable */}
        <div className="overflow-y-auto flex-1 min-h-0">
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
              <thead className="sticky top-0 bg-background border-b z-10">
                <tr>
                  <th className="px-4 py-2.5 text-left w-10">
                    <Checkbox
                      checked={allPendingSelected}
                      onCheckedChange={toggleSelectAll}
                      disabled={pendingVisible.length === 0}
                    />
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Nom</th>
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Téléphone</th>
                  <th className="px-4 py-2.5 text-center text-xs font-medium text-muted-foreground">Statut</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => {
                  const sent = isSent(contact);
                  const failed = isFailed(contact);
                  const sending = isSending(contact.phone);
                  const checked = selected.has(contact.phone);

                  return (
                    <tr
                      key={contact.phone}
                      className={`border-b transition-colors ${
                        sent
                          ? "bg-green-50/40"
                          : checked
                            ? "bg-blue-50/40"
                            : "hover:bg-muted/30"
                      }`}
                    >
                      <td className="px-4 py-2.5">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleSelect(contact.phone)}
                          disabled={sent || sending}
                        />
                      </td>
                      <td className="px-4 py-2.5 font-medium max-w-[160px] truncate">
                        {contact.name || (
                          <span className="text-muted-foreground italic text-xs">Sans nom</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                        {contact.phone}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {sending ? (
                          <LoaderIcon className="h-4 w-4 animate-spin text-blue-500 mx-auto" />
                        ) : sent ? (
                          <div className="flex items-center justify-center gap-1 text-green-600">
                            <CheckCircleIcon className="h-4 w-4" />
                            <span className="text-xs">Envoyé</span>
                          </div>
                        ) : failed ? (
                          <div title={contact.error ?? undefined}>
                            <Badge variant="destructive" className="text-xs cursor-help">Échec</Badge>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">En attente</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {!sent && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs px-2 hover:bg-blue-50 hover:text-blue-700"
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
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t shrink-0 flex items-center justify-between gap-3 flex-wrap bg-background">
          <p className="text-sm text-muted-foreground">
            {selected.size > 0
              ? `${selected.size} contact${selected.size > 1 ? "s" : ""} sélectionné${selected.size > 1 ? "s" : ""}`
              : "Sélectionnez des contacts pour un envoi groupé"}
          </p>
          <div className="flex gap-2">
            {failedCount > 0 && (
              <Button
                size="sm"
                variant="destructive"
                disabled={sendContacts.isPending}
                onClick={() => {
                  const failedPhones = allContacts
                    .filter((c) => (c.failed || localFailed.has(c.phone)) && !c.sent && !localSent.has(c.phone))
                    .map((c) => c.phone);
                  handleSend(failedPhones);
                }}
              >
                <RefreshIcon className="h-4 w-4 mr-2" />
                Renvoyer les échecs ({failedCount})
              </Button>
            )}
            {pendingCount === 0 && failedCount === 0 && allContacts.length > 0 && (
              <Button
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
