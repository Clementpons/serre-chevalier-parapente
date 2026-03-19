"use client";

import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BaptemeEditForm } from "@/features/biplaces/forms/bapteme-edit-form";
import { BaptemeCategory } from "@/features/biplaces/schemas";

interface BaptemeData {
  id: string;
  date: Date;
  duration: number;
  places: number;
  acomptePrice: number;
  moniteurs?: Array<{
    moniteur: {
      id: string;
      name: string;
      avatarUrl: string | null;
      role: string;
    };
  }>;
  categories: BaptemeCategory[];
  bookings?: any[];
}

interface EditBaptemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bapteme: BaptemeData | null;
  role?: string;
  userId?: string;
}

export function EditBaptemeDialog({
  open,
  onOpenChange,
  bapteme,
  role,
  userId,
}: EditBaptemeDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!bapteme) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le Baptême</DialogTitle>
        </DialogHeader>

        <BaptemeEditForm
          bapteme={bapteme}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          role={role}
          userId={userId}
        />
      </DialogContent>
    </Dialog>
  );
}
