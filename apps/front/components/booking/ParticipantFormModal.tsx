"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { SessionManager } from "@/lib/sessionManager";
import { useToast } from "@/components/ui/use-toast";
import { Clock, Calendar } from "lucide-react";
import { useBaptemePrices } from "@/hooks/useBaptemePrices";

interface Stage {
  id: string;
  startDate: string;
  duration: number;
  places: number;
  price: number;
  type: string;
}

interface Bapteme {
  id: string;
  date: string;
  duration: number;
  places: number;
  categories: string[];
}

interface ParticipantFormData {
  participantType: "self" | "other";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  weight: number;
  height: number;
  birthDate?: string;
  // Pour baptêmes
  selectedCategory?: string;
  hasVideo?: boolean;
}

interface ParticipantFormModalProps {
  type: "stage" | "bapteme";
  item: Stage | Bapteme;
  preselectedCategory?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ParticipantFormModal({
  type,
  item,
  preselectedCategory,
  onClose,
  onSuccess,
}: ParticipantFormModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ParticipantFormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    preselectedCategory || "",
  );
  const [hasVideo, setHasVideo] = useState(false);
  const { toast } = useToast();
  const { getPrice: getBaptemePrice, videoOptionPrice, loading: pricesLoading } = useBaptemePrices();

  const participantType = watch("participantType");

  // Charger les données depuis le localStorage au montage du composant
  useEffect(() => {
    const savedData = localStorage.getItem("userInfo");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setValue("firstName", parsedData.firstName || "");
        setValue("lastName", parsedData.lastName || "");
        setValue("email", parsedData.email || "");
        setValue("phone", parsedData.phone || "");
        setValue("weight", parsedData.weight || "");
        setValue("height", parsedData.height || "");
        setValue("birthDate", parsedData.birthDate || "");
      } catch (error) {
        console.error(
          "Erreur lors du chargement des données utilisateur:",
          error,
        );
      }
    }
  }, [setValue]);

  // Sauvegarder les données dans le localStorage quand l'utilisateur choisit "Pour moi"
  const saveUserInfo = (data: ParticipantFormData) => {
    if (participantType === "self") {
      const userInfo = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        weight: data.weight,
        height: data.height,
        birthDate: data.birthDate,
      };
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      AVENTURE: "Baptême Aventure",
      DUREE: "Baptême Durée",
      LONGUE_DUREE: "Baptême Longue Durée",
      ENFANT: "Baptême Enfant",
      HIVER: "Baptême Hiver",
    };
    return labels[category] || category;
  };

  const onSubmit = async (data: ParticipantFormData) => {
    setIsLoading(true);

    try {
      // Sauvegarder les informations utilisateur si c'est pour lui
      saveUserInfo(data);

      const sessionId = SessionManager.getOrCreateSessionId();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/cart/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-session-id": sessionId,
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
          },
          body: JSON.stringify({
            type: type.toUpperCase(),
            itemId: item.id,
            participantData: {
              ...data,
              weight: Number(data.weight),
              height: Number(data.height),
              selectedCategory: preselectedCategory || selectedCategory,
              hasVideo: hasVideo,
            },
            quantity: 1,
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Ajouté au panier !",
          description: `${type === "stage" ? "Stage" : "Baptême"} ajouté avec succès`,
        });

        // Déclencher un événement pour rafraîchir le panier
        window.dispatchEvent(new CustomEvent("cartUpdated"));

        onSuccess();
      } else {
        toast({
          title: "Erreur",
          description: result.message || "Erreur lors de l'ajout au panier",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erreur ajout panier:", error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'ajout au panier",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="w-6 h-6 text-blue-600" />
            {type === "stage"
              ? "Finaliser votre réservation de stage"
              : "Finaliser votre réservation de baptême"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Sélection participant avec design moderne */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-slate-800">
              Pour qui réservez-vous ?
            </Label>
            <RadioGroup
              defaultValue="self"
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              onValueChange={(value) =>
                setValue("participantType", value as "self" | "other")
              }
            >
              <div className="relative">
                <RadioGroupItem
                  value="self"
                  id="self"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="self"
                  className={`flex items-center justify-center p-6 bg-slate-50 border-2 rounded-lg cursor-pointer transition-all hover:bg-slate-100 hover:border-slate-300 ${
                    participantType === "self"
                      ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                      : "border-slate-200"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-3">🙋‍♂️</div>
                    <div
                      className={`font-semibold text-lg ${participantType === "self" ? "text-blue-700" : "text-slate-800"}`}
                    >
                      Pour moi
                    </div>
                    <div
                      className={`text-sm mt-1 ${participantType === "self" ? "text-blue-600" : "text-slate-600"}`}
                    >
                      Mes informations seront sauvegardées
                    </div>
                  </div>
                </Label>
              </div>
              <div className="relative">
                <RadioGroupItem
                  value="other"
                  id="other"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="other"
                  className={`flex items-center justify-center p-6 bg-slate-50 border-2 rounded-lg cursor-pointer transition-all hover:bg-slate-100 hover:border-slate-300 ${
                    participantType === "other"
                      ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                      : "border-slate-200"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-3">🎁</div>
                    <div
                      className={`font-semibold text-lg ${participantType === "other" ? "text-blue-700" : "text-slate-800"}`}
                    >
                      Pour quelqu'un d'autre
                    </div>
                    <div
                      className={`text-sm mt-1 ${participantType === "other" ? "text-blue-600" : "text-slate-600"}`}
                    >
                      Cadeau ou réservation tierce
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Informations participant */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">
              Informations{" "}
              {participantType === "self" ? "personnelles" : "du participant"}
            </h3>

            {/* Identité */}
            <div className="space-y-4">
              <h4 className="font-medium text-slate-700 border-l-4 border-blue-600 pl-3">
                Identité
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    {...register("firstName", { required: "Prénom requis" })}
                    placeholder={
                      participantType === "self"
                        ? "Votre prénom"
                        : "Prénom du participant"
                    }
                    className="mt-1"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    {...register("lastName", { required: "Nom requis" })}
                    placeholder={
                      participantType === "self"
                        ? "Votre nom"
                        : "Nom du participant"
                    }
                    className="mt-1"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="font-medium text-slate-700 border-l-4 border-blue-600 pl-3">
                Contact
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email", { required: "Email requis" })}
                    placeholder="email@exemple.com"
                    className="mt-1"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    {...register("phone", { required: "Téléphone requis" })}
                    placeholder="06 12 34 56 78"
                    className="mt-1"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Informations physiques */}
            <div className="space-y-4">
              <h4 className="font-medium text-slate-700 border-l-4 border-blue-600 pl-3">
                Informations physiques
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Poids (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    {...register("weight", {
                      required: "Poids requis",
                      min: { value: 20, message: "Poids minimum 20kg" },
                      max: { value: 120, message: "Poids maximum 120kg" },
                    })}
                    placeholder="70"
                    className="mt-1"
                  />
                  {errors.weight && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.weight.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="height">Taille (cm) *</Label>
                  <Input
                    id="height"
                    type="number"
                    {...register("height", {
                      required: "Taille requise",
                      min: { value: 120, message: "Taille minimum 120cm" },
                      max: { value: 220, message: "Taille maximum 220cm" },
                    })}
                    placeholder="175"
                    className="mt-1"
                  />
                  {errors.height && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.height.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Options spécifiques baptême */}
          {type === "bapteme" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Options de votre baptême
              </h3>

              {/* Affichage de la catégorie sélectionnée (non modifiable) */}
              {preselectedCategory && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <Label className="text-sm font-medium text-slate-600">
                    Formule sélectionnée
                  </Label>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-semibold text-lg text-slate-800">
                      {getCategoryLabel(preselectedCategory)}
                    </span>
                    <span className="font-bold text-xl text-blue-600">
                      {pricesLoading ? (
                        <span className="inline-block w-14 h-6 bg-slate-200 animate-pulse rounded" />
                      ) : `${getBaptemePrice(preselectedCategory)}€`}
                    </span>
                  </div>
                </div>
              )}

              {/* Option vidéo avec design moderne */}
              <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:bg-slate-100 ${
                  hasVideo
                    ? "bg-blue-50 border-blue-600 ring-2 ring-blue-200"
                    : "bg-slate-50 border-slate-200"
                }`}
                onClick={() => setHasVideo(!hasVideo)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎥</span>
                    <div>
                      <div
                        className={`font-semibold text-lg ${hasVideo ? "text-blue-700" : "text-slate-800"}`}
                      >
                        Option vidéo souvenir
                      </div>
                      <p
                        className={`text-sm ${hasVideo ? "text-blue-600" : "text-slate-600"}`}
                      >
                        Immortalisez votre vol avec une vidéo professionnelle
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-lg text-blue-600">
                        {pricesLoading ? (
                          <span className="inline-block w-12 h-5 bg-slate-200 animate-pulse rounded" />
                        ) : `+${videoOptionPrice}€`}
                      </p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                        hasVideo
                          ? "bg-blue-600 border-blue-600"
                          : "bg-white border-slate-300"
                      }`}
                    >
                      {hasVideo && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Récapitulatif prix */}
          <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Récapitulatif de votre commande
            </h3>

            <div className="space-y-3">
              {type === "stage" ? (
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-700">
                    Stage {(item as Stage).type}
                  </span>
                  <span className="font-bold text-xl text-blue-600">
                    {(item as Stage).price}€
                  </span>
                </div>
              ) : preselectedCategory ? (
                <>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-slate-700">
                      {getCategoryLabel(preselectedCategory)}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {pricesLoading ? (
                        <span className="inline-block w-14 h-5 bg-slate-200 animate-pulse rounded" />
                      ) : `${getBaptemePrice(preselectedCategory)}€`}
                    </span>
                  </div>
                  {hasVideo && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-700">
                        Option vidéo
                      </span>
                      <span className="font-semibold text-slate-800">
                        {pricesLoading ? (
                          <span className="inline-block w-10 h-4 bg-slate-200 animate-pulse rounded" />
                        ) : `+${videoOptionPrice}€`}
                      </span>
                    </div>
                  )}
                  <hr className="border-slate-300" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xl text-slate-800">
                      Total
                    </span>
                    <span className="font-bold text-2xl text-blue-600">
                      {getBaptemePrice(preselectedCategory) +
                        (hasVideo ? videoOptionPrice : 0)}
                      €
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center text-slate-500">
                  Formule non sélectionnée
                </div>
              )}
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12"
              size="lg"
            >
              Retour
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-12"
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 animate-spin" />
                  Ajout en cours...
                </div>
              ) : (
                "Ajouter au panier"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
