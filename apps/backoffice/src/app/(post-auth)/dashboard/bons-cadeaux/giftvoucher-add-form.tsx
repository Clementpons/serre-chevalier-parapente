"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateGiftVoucher } from "@/features/giftvouchers/api/use-create-giftvoucher";
import { InfoIcon } from "@/lib/icons";

interface GiftVoucherAddFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const STAGE_CATEGORIES = [
  { value: "INITIATION", label: "Initiation" },
  { value: "PROGRESSION", label: "Progression" },
  { value: "AUTONOMIE", label: "Autonomie" },
];

const BAPTEME_CATEGORIES = [
  { value: "DUREE", label: "Durée" },
  { value: "LONGUE_DUREE", label: "Longue Durée" },
  { value: "ENFANT", label: "Enfant" },
  { value: "HIVER", label: "Hiver" },
  { value: "AVENTURE", label: "Aventure" },
];

export function GiftVoucherAddForm({
  onSuccess,
  onCancel,
}: GiftVoucherAddFormProps) {
  const createGiftVoucher = useCreateGiftVoucher();

  const [formData, setFormData] = useState({
    productType: "" as "STAGE" | "BAPTEME" | "",
    category: "",
    recipientName: "",
    recipientEmail: "",
  });

  const isLoading = createGiftVoucher.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productType || !formData.category || !formData.recipientName || !formData.recipientEmail) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      await createGiftVoucher.mutateAsync({
        productType: formData.productType as "STAGE" | "BAPTEME",
        stageCategory: formData.productType === "STAGE" ? (formData.category as any) : undefined,
        baptemeCategory: formData.productType === "BAPTEME" ? (formData.category as any) : undefined,
        recipientName: formData.recipientName,
        recipientEmail: formData.recipientEmail,
        // purchasePrice sera calculé automatiquement par le backend
      });

      // Reset form
      setFormData({
        productType: "",
        category: "",
        recipientName: "",
        recipientEmail: "",
      });
      
      onSuccess?.();
    } catch (error) {
      console.error("Erreur lors de la création:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      productType: "",
      category: "",
      recipientName: "",
      recipientEmail: "",
    });
  };

  const categories = formData.productType === "STAGE" ? STAGE_CATEGORIES : 
                     formData.productType === "BAPTEME" ? BAPTEME_CATEGORIES : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="productType">Type de produit *</Label>
          <Select
            value={formData.productType}
            onValueChange={(value) => {
              setFormData((prev) => ({ 
                ...prev, 
                productType: value as "STAGE" | "BAPTEME",
                category: "" // Reset category when type changes
              }));
            }}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="STAGE">Stage</SelectItem>
              <SelectItem value="BAPTEME">Baptême</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Catégorie *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, category: value }))
            }
            disabled={isLoading || !formData.productType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipientName">Nom du bénéficiaire *</Label>
        <Input
          id="recipientName"
          value={formData.recipientName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, recipientName: e.target.value }))
          }
          placeholder="Ex: Jean Dupont"
          disabled={isLoading}
          required
        />
        <p className="text-xs text-muted-foreground">
          Nom de la personne qui recevra le bon cadeau
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="recipientEmail">Email du bénéficiaire *</Label>
        <Input
          id="recipientEmail"
          type="email"
          value={formData.recipientEmail}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, recipientEmail: e.target.value }))
          }
          placeholder="Ex: jean.dupont@example.com"
          disabled={isLoading}
          required
        />
        <p className="text-xs text-muted-foreground">
          Email où le code du bon cadeau sera envoyé
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <div className="flex items-start gap-2">
          <InfoIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-2">Informations importantes</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Le code sera généré automatiquement au format GVSCP-XXXXXXXX-XXXX</li>
              <li>• Le bon sera valide pendant 1 an à partir de sa création</li>
              <li>• Le bon couvre une place complète pour le type et la catégorie sélectionnés</li>
              <li>• Le bénéficiaire devra utiliser le code lors de sa réservation</li>
              <li>• <strong>Ce bon est offert gratuitement</strong> (création admin)</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetForm();
              onCancel();
            }}
            disabled={isLoading}
            className="flex-1"
          >
            Annuler
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? "Création..." : "Créer le bon cadeau"}
        </Button>
      </div>
    </form>
  );
}