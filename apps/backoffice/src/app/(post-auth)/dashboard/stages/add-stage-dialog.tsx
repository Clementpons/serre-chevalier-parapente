"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StageAddForm } from "@/features/stages/forms/stage-add-form";
import { StageType } from "@prisma/client";

interface StageData {
  startDate: Date;
  duration: number;
  places: number;
  moniteurIds: string[];
  price: number;
  acomptePrice: number;
  type: StageType;
}

interface AddStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  onCreateStage: (stage: StageData) => void;
  isSubmitting?: boolean;
}

export function AddStageDialog({
  open,
  onOpenChange,
  selectedDate,
  onCreateStage,
  isSubmitting = false,
}: AddStageDialogProps) {
  const handleSubmit = (stageData: StageData) => {
    onCreateStage(stageData);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nouveau Stage</DialogTitle>
        </DialogHeader>

        <StageAddForm
          selectedDate={selectedDate}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
