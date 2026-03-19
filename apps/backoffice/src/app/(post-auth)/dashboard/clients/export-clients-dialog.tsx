"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DownloadIcon, FilterIcon2 } from "@/lib/icons";
import { departements } from "@/data/departements";
import { Client, Order } from "@prisma/client";
import { toast } from "sonner";
import { format } from "date-fns";

type ClientWithOrders = Client & {
  orders: Order[];
};

interface ExportClientsDialogProps {
  clients: ClientWithOrders[];
  totalCount: number;
}

const FIELDS = [
  { id: "id", label: "ID" },
  { id: "firstName", label: "Prénom" },
  { id: "lastName", label: "Nom" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Téléphone" },
  { id: "address", label: "Adresse" },
  { id: "postalCode", label: "Code Postal" },
  { id: "city", label: "Ville" },
  { id: "country", label: "Pays" },
  { id: "orderCount", label: "Nombre de commandes" },
  { id: "createdAt", label: "Date d'inscription" },
];

import { useGetAllClients } from "@/features/clients/api/use-get-clients";
import { useEffect, useMemo } from "react";
import { LoaderIcon } from "@/lib/icons";

export function ExportClientsDialog({
  clients: currentPageClients,
  totalCount,
}: ExportClientsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([
    "firstName",
    "lastName",
    "email",
    "phone",
    "orderCount",
  ]);
  const [exportQuantity, setExportQuantity] = useState<"page" | "all">("page");

  // Optional Filters
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [minOrders, setMinOrders] = useState<string>("");
  const [afterDate, setAfterDate] = useState<string>("");

  // Fetch ALL clients only if requested
  const { data: allData, isLoading: isLoadingAll } = useGetAllClients({
    nopaging: true,
  });

  const regions = useMemo(
    () => Array.from(new Set(departements.map((d) => d.region))).sort(),
    []
  );

  const filteredDepts = useMemo(
    () =>
      selectedRegion === "all"
        ? departements
        : departements.filter((d) => d.region === selectedRegion),
    [selectedRegion]
  );

  const activeDeptCodes = useMemo(() => {
    const clients = (allData?.clients as any[]) || [];
    const codes = new Set<string>();
    clients.forEach((c) => {
      if (c.postalCode) {
        codes.add(c.postalCode.substring(0, 2));
      }
    });
    return codes;
  }, [allData]);

  const activeRegions = useMemo(() => {
    const activeReg = new Set<string>();
    departements.forEach((d) => {
      if (activeDeptCodes.has(d.code)) {
        activeReg.add(d.region);
      }
    });
    return activeReg;
  }, [activeDeptCodes]);

  const toggleField = (fieldId: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldId)
        ? prev.filter((id) => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const currentSelectionData = useMemo(() => {
    const dataSource =
      exportQuantity === "page"
        ? currentPageClients
        : (allData?.clients as any[]) || [];

    return dataSource.filter((client) => {
      // Dept filter (2 first digits of postalCode)
      if (selectedDept !== "all") {
        if (!client.postalCode.startsWith(selectedDept)) return false;
      } else if (selectedRegion !== "all") {
        const deptCodesInRegion = departements
          .filter((d) => d.region === selectedRegion)
          .map((d) => d.code);
        const clientDept = client.postalCode.substring(0, 2);
        if (!deptCodesInRegion.includes(clientDept)) return false;
      }

      // Min orders filter
      if (minOrders && client.orders.length < parseInt(minOrders)) return false;

      // Date filter
      if (afterDate && new Date(client.createdAt) < new Date(afterDate))
        return false;

      return true;
    });
  }, [
    exportQuantity,
    currentPageClients,
    allData,
    selectedDept,
    selectedRegion,
    minOrders,
    afterDate,
  ]);

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
      toast.error("Aucun client ne correspond aux filtres sélectionnés");
      return;
    }

    // Generate CSV
    const headerRow = selectedFields
      .map((id) => FIELDS.find((f) => f.id === id)?.label)
      .join(",");

    const csvRows = currentSelectionData.map((client) => {
      return selectedFields
        .map((id) => {
          let val: any = "";
          if (id === "orderCount") val = client.orders.length;
          else if (id === "createdAt")
            val = format(new Date(client.createdAt), "yyyy-MM-dd HH:mm");
          else val = (client as any)[id] || "n/a";

          // Escape commas and quotes
          const stringVal = String(val).replace(/"/g, '""');
          return `"${stringVal}"`;
        })
        .join(",");
    });

    const csvContent = "\uFEFF" + [headerRow, ...csvRows].join("\n"); // Add BOM for Excel UTF-8
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `export_clients_${exportQuantity === "all" ? "total" : "page"}_${format(
        new Date(),
        "yyyyMMdd"
      )}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(
      `${currentSelectionData.length} clients exportés avec succès`
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
          <DialogTitle>Exporter les clients</DialogTitle>
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
                  Page actuelle ({currentPageClients.length})
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
            <div className="flex items-center gap-2">
              <FilterIcon2 className="h-4 w-4 text-primary" />
              <Label className="text-base font-semibold">
                3. Filtres optionnels
              </Label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Région</Label>
                <Select
                  value={selectedRegion}
                  onValueChange={(val) => {
                    setSelectedRegion(val);
                    setSelectedDept("all");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les régions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les régions</SelectItem>
                    {regions.map((r) => (
                      <SelectItem
                        key={r}
                        value={r}
                        className={
                          !activeRegions.has(r) ? "opacity-50 italic" : ""
                        }
                      >
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Département</Label>
                <Select value={selectedDept} onValueChange={setSelectedDept}>
                  <SelectTrigger disabled={filteredDepts.length === 0}>
                    <SelectValue placeholder="Tous les départements" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les départements</SelectItem>
                    {filteredDepts.map((d) => (
                      <SelectItem
                        key={d.code}
                        value={d.code}
                        className={
                          !activeDeptCodes.has(d.code)
                            ? "opacity-50 italic"
                            : ""
                        }
                      >
                        {d.code} - {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Commandes min.</Label>
                <Input
                  type="number"
                  placeholder="Ex: 2"
                  value={minOrders}
                  onChange={(e) => setMinOrders(e.target.value)}
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
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-4 items-center">
          <div className="text-sm font-medium text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
            {currentSelectionData.length} client(s) à exporter
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
