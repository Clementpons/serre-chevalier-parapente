"use client";

import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GiftVoucherAddForm } from "./giftvoucher-add-form";

interface AddGiftVoucherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddGiftVoucherDialog({
  open,
  onOpenChange,
}: AddGiftVoucherDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Créer un Bon Cadeau</DialogTitle>
        </DialogHeader>

        <GiftVoucherAddForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}