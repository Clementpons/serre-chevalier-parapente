import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResponsiveModalProps {
  children: React.ReactNode;
  open: boolean;
  title: React.ReactNode;
  description: React.ReactNode;
  onOpenChange: (open: boolean) => void;
}

function ResponsiveModal({
  children,
  open,
  title,
  description,
  onOpenChange,
}: ResponsiveModalProps) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full sm:max-w-lg p-8 border-none overflow-y-auto hide-scrollbar max-h-[85vh]">
          <DialogHeader className="mb-6 -space-y-1">
            <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
            {description && (
              <DialogDescription className="text-sm">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          {title && (
            <DrawerTitle className="text-xl font-bold">{title}</DrawerTitle>
          )}
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>
        <div className="overflow-y-auto hide-scrollbar p-4">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}

export default ResponsiveModal;
