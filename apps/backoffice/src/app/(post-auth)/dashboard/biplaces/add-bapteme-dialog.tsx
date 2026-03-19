"use client";

import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bapteme } from "@prisma/client";
import { BaptemeAddForm } from "@/features/biplaces/forms/bapteme-add-form";
import { BaptemeCategory } from "@/features/biplaces/schemas";

interface BaptemeData {
  date: Date;
  duration: number;
  places: number;
  moniteurIds: string[];
  categories: BaptemeCategory[];
  acomptePrice: number;
}

interface AddBaptemeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  selectedHour?: number;
  onCreateBapteme: (bapteme: BaptemeData) => void;
  isSubmitting?: boolean;
  role?: string;
  userId?: string;
}

export function AddBaptemeDialog({
  open,
  onOpenChange,
  selectedDate,
  selectedHour,
  onCreateBapteme,
  isSubmitting = false,
  role,
  userId,
}: AddBaptemeDialogProps) {
  const handleSubmit = (baptemeData: BaptemeData) => {
    onCreateBapteme(baptemeData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau Baptême</DialogTitle>
        </DialogHeader>

        <BaptemeAddForm
          selectedDate={selectedDate}
          selectedHour={selectedHour}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          role={role}
          userId={userId}
        />
      </DialogContent>
    </Dialog>
  );
}
