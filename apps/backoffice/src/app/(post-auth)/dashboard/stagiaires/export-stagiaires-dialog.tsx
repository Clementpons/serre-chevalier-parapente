"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DownloadIcon, LoaderIcon } from "@/lib/icons";
import {
  Stagiaire,
  StageBooking,
  BaptemeBooking,
  Stage,
  Bapteme,
  StageType,
  BaptemeCategory,
} from "@prisma/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useGetAllStagiaires } from "@/features/stagiaires/api/use-get-stagiaires";

type StagiaireWithBookings = Stagiaire & {
  stageBookings: (StageBooking & { stage: Stage })[];
  baptemeBookings: (BaptemeBooking & { bapteme: Bapteme })[];
};

interface ExportStagiairesDialogProps {
  stagiaires: StagiaireWithBookings[];
  totalCount: number;
}

const FIELDS = [
  { id: "id", label: "ID" },
  { id: "firstName", label: "Prénom" },
  { id: "lastName", label: "Nom" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Téléphone" },
  { id: "birthDate", label: "Date de naissance" },
  { id: "height", label: "Taille (cm)" },
  { id: "weight", label: "Poids (kg)" },
  { id: "totalBookings", label: "Total Réservations" },
  { id: "stageCount", label: "Nombre Stages" },
  { id: "baptemeCount", label: "Nombre Baptêmes" },
  { id: "detailsStages", label: "Détails Stages (Type)" },
  { id: "detailsBaptemes", label: "Détails Baptêmes (Catégorie)" },
  { id: "inscriptionDate", label: "Date d'inscription (1ère résa)" },
  { id: "firstStageDate", label: "Date du premier stage" },
];

export function ExportStagiairesDialog({
  stagiaires: currentPageStagiaires,
  totalCount,
}: ExportStagiairesDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([
    "firstName",
    "lastName",
    "email",
    "phone",
    "totalBookings",
    "detailsStages",
    "detailsBaptemes",
    "inscriptionDate",
  ]);
  const [exportQuantity, setExportQuantity] = useState<"page" | "all">("page");

  // Optional Filters
  const [minBookings, setMinBookings] = useState<string>("");
  const [afterDate, setAfterDate] = useState<string>("");

  // Fetch ALL stagiaires only if requested
  const { data: allData, isLoading: isLoadingAll } = useGetAllStagiaires({
    nopaging: true,
  });

  const toggleField = (fieldId: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldId)
        ? prev.filter((id) => id !== fieldId)
        : [...prev, fieldId],
    );
  };

  const currentSelectionData = useMemo(() => {
    const dataSource =
      exportQuantity === "page"
        ? currentPageStagiaires
        : (allData?.stagiaires as unknown as StagiaireWithBookings[]) || [];

    return dataSource.filter((stagiaire) => {
      const totalRes =
        stagiaire.stageBookings.length + stagiaire.baptemeBookings.length;

      // Min bookings filter
      if (minBookings && totalRes < parseInt(minBookings)) return false;

      // Date filter (inscription date)
      if (afterDate) {
        // Calculate inscription date
        const dates = [
          ...stagiaire.stageBookings.map((b) => new Date(b.createdAt)),
          ...stagiaire.baptemeBookings.map((b) => new Date(b.createdAt)),
        ];
        if (dates.length > 0) {
          const firstDate = new Date(
            Math.min(...dates.map((d) => d.getTime())),
          );
          if (firstDate < new Date(afterDate)) return false;
        } else {
          // If no bookings, maybe filter out? Or check created_at of stagiaire if available?
          // Stagiaire has createdAt
          if (new Date(stagiaire.createdAt) < new Date(afterDate)) return false;
        }
      }

      return true;
    });
  }, [exportQuantity, currentPageStagiaires, allData, minBookings, afterDate]);

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      toast.error("Veuillez sélectionner au moins un champ à exporter");
      return;
    }

    if (exportQuantity === "all" && !allData) {
      toast.error("Données en cours de chargement...");
      return;
    }

    if (currentSelectionData.length === 0) {
      toast.error("Aucun stagiaire ne correspond aux filtres sélectionnés");
      return;
    }

    // Generate CSV
    const headerRow = selectedFields
      .map((id) => FIELDS.find((f) => f.id === id)?.label)
      .join(",");

    const csvRows = currentSelectionData.map((stagiaire) => {
      const totalStages = stagiaire.stageBookings.length;
      const totalBaptemes = stagiaire.baptemeBookings.length;

      // Calculate Inscription Date (first booking created_at OR stagiaire created_at)
      const bookingDates = [
        ...stagiaire.stageBookings.map((b) => new Date(b.createdAt)),
        ...stagiaire.baptemeBookings.map((b) => new Date(b.createdAt)),
      ];
      let inscriptionDate = new Date(stagiaire.createdAt);
      if (bookingDates.length > 0) {
        const minBookingDate = new Date(
          Math.min(...bookingDates.map((d) => d.getTime())),
        );
        if (minBookingDate < inscriptionDate) inscriptionDate = minBookingDate;
      }

      // Calculate First Stage Date
      let firstStageDateStr = "n/a";
      if (stagiaire.stageBookings.length > 0) {
        const stageDates = stagiaire.stageBookings.map(
          (b) => new Date(b.stage.startDate),
        );
        const minStageDate = new Date(
          Math.min(...stageDates.map((d) => d.getTime())),
        );
        firstStageDateStr = format(minStageDate, "yyyy-MM-dd");
      }

      // Details Stages
      const stageTypesCount: Record<string, number> = {};
      stagiaire.stageBookings.forEach((b) => {
        const type = b.type || "INCONNU";
        stageTypesCount[type] = (stageTypesCount[type] || 0) + 1;
      });
      const stageDetailsStr = Object.entries(stageTypesCount)
        .map(([k, v]) => `${k}: ${v}`)
        .join("; ");

      // Details Baptemes
      const baptemeCatsCount: Record<string, number> = {};
      stagiaire.baptemeBookings.forEach((b) => {
        const cat = b.category || "INCONNU";
        baptemeCatsCount[cat] = (baptemeCatsCount[cat] || 0) + 1;
      });
      const baptemeDetailsStr = Object.entries(baptemeCatsCount)
        .map(([k, v]) => `${k}: ${v}`)
        .join("; ");

      return selectedFields
        .map((id) => {
          let val: any = "";

          if (id === "totalBookings") val = totalStages + totalBaptemes;
          else if (id === "stageCount") val = totalStages;
          else if (id === "baptemeCount") val = totalBaptemes;
          else if (id === "detailsStages") val = stageDetailsStr;
          else if (id === "detailsBaptemes") val = baptemeDetailsStr;
          else if (id === "inscriptionDate")
            val = format(inscriptionDate, "yyyy-MM-dd");
          else if (id === "firstStageDate") val = firstStageDateStr;
          else if (id === "birthDate")
            val = stagiaire.birthDate
              ? format(new Date(stagiaire.birthDate), "yyyy-MM-dd")
              : "n/a";
          else val = (stagiaire as any)[id] || "n/a";

          // Escape commas and quotes
          const stringVal = String(val).replace(/"/g, '""');
          return `"${stringVal}"`;
        })
        .join(",");
    });

    const csvContent = "\uFEFF" + [headerRow, ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `export_stagiaires_${exportQuantity === "all" ? "total" : "page"}_${format(
        new Date(),
        "yyyyMMdd",
      )}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(
      `${currentSelectionData.length} stagiaires exportés avec succès`,
    );
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <DownloadIcon className="h-4 w-4" />
          Exporter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Exporter les stagiaires</DialogTitle>
          <DialogDescription>
            Configurez votre export CSV (UTF-8). Sélectionnez les colonnes et
            appliquez des filtres.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Fields Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              1. Sélectionner les champs
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FIELDS.map((field) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`field-${field.id}`}
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={() => toggleField(field.id)}
                  />
                  <Label
                    htmlFor={`field-${field.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {field.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-3 border-t pt-4">
            <Label className="text-base font-semibold">2. Quantité</Label>
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="qty-page"
                  checked={exportQuantity === "page"}
                  onCheckedChange={() => setExportQuantity("page")}
                />
                <Label htmlFor="qty-page" className="cursor-pointer">
                  Page actuelle ({currentPageStagiaires.length})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="qty-all"
                  checked={exportQuantity === "all"}
                  onCheckedChange={() => setExportQuantity("all")}
                />
                <Label
                  htmlFor="qty-all"
                  className="cursor-pointer flex items-center gap-2"
                >
                  Toute la base ({totalCount})
                  {exportQuantity === "all" && isLoadingAll && (
                    <LoaderIcon className="h-3 w-3 animate-spin text-muted-foreground" />
                  )}
                </Label>
              </div>
            </div>
          </div>

          {/* Optional Filters */}
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label>Réservations min.</Label>
              <Input
                type="number"
                placeholder="Ex: 1"
                value={minBookings}
                onChange={(e) => setMinBookings(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Inscrit après le</Label>
              <Input
                type="date"
                value={afterDate}
                onChange={(e) => setAfterDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-4 items-center">
          <div className="text-sm font-medium text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
            {currentSelectionData.length} stagiaire(s) à exporter
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleExport}
              className="gap-2"
              disabled={exportQuantity === "all" && isLoadingAll}
            >
              <DownloadIcon className="h-4 w-4" />
              Lancer l&apos;export
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
