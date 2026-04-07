"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { SendIcon, PlusIcon, TrashIcon } from "@/lib/icons";
import { useSendTestSms } from "@/features/campaigns/api/use-send-test-sms";

interface TestSmsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TestSmsDialog({ open, onOpenChange }: TestSmsDialogProps) {
  const [message, setMessage] = useState("");
  const [recipients, setRecipients] = useState([""]);
  const sendTestSms = useSendTestSms();

  const addRecipient = () => setRecipients((r) => [...r, ""]);
  const removeRecipient = (i: number) =>
    setRecipients((r) => r.filter((_, idx) => idx !== i));
  const updateRecipient = (i: number, value: string) =>
    setRecipients((r) => r.map((v, idx) => (idx === i ? value : v)));

  const handleSend = () => {
    const validRecipients = recipients.map((r) => r.trim()).filter(Boolean);
    if (!message.trim() || validRecipients.length === 0) return;
    sendTestSms.mutate(
      { message: message.trim(), recipients: validRecipients },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Envoyer un SMS de test</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              placeholder="Votre message..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1600}
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length} / 1600 caractères
            </p>
          </div>

          <div className="space-y-2">
            <Label>Numéros destinataires</Label>
            <div className="space-y-2">
              {recipients.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="06 12 34 56 78"
                    value={r}
                    onChange={(e) => updateRecipient(i, e.target.value)}
                  />
                  {recipients.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRecipient(i)}
                    >
                      <TrashIcon className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {recipients.length < 10 && (
              <Button
                variant="outline"
                size="sm"
                className="mt-1"
                onClick={addRecipient}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Ajouter un numéro
              </Button>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSend}
              disabled={
                sendTestSms.isPending ||
                !message.trim() ||
                recipients.every((r) => !r.trim())
              }
            >
              <SendIcon className="h-4 w-4 mr-2" />
              {sendTestSms.isPending ? "Envoi..." : "Envoyer le test"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
