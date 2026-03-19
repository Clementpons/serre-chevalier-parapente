"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  Clock,
  ChevronRight,
  ArrowLeft,
  ShoppingCart,
  Plus,
  Gift,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useAvailability } from "@/hooks/useAvailability";
import { useBaptemePrices } from "@/hooks/useBaptemePrices";
import { SessionManager } from "@/lib/sessionManager";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface BaptemeCategory {
  id: string;
  name: string;
  price: number;
  description: string;
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
  giftVoucherCode?: string;
}

const BAPTEME_CATEGORIES: BaptemeCategory[] = [
  {
    id: "AVENTURE",
    name: "Baptême Aventure",
    price: 110,
    description:
      "Vivez votre baptême aérien : liberté, frissons et vue imprenable. 15 minutes de vol.",
  },
  {
    id: "DUREE",
    name: "Baptême Durée",
    price: 150,
    description:
      "Plus long, plus haut, plus fort. Adrénaline garantie. 30 minutes de vol.",
  },
  {
    id: "LONGUE_DUREE",
    name: "Baptême Longue Durée",
    price: 185,
    description:
      "Plus on reste dans le ciel, plus le plaisir grandit. 45 minutes de vol.",
  },
  {
    id: "ENFANT",
    name: "Baptême Enfant",
    price: 90,
    description:
      "Pour les p'tits loups dans l'aventure et la montagne. 10 minutes de vol.",
  },
  {
    id: "HIVER",
    name: "Baptême Hiver",
    price: 130,
    description: "Les sommets enneigés à perte de vue, en toute liberté.",
  },
];

const MONTHS = [
  { value: 1, label: "Janvier" },
  { value: 2, label: "Février" },
  { value: 3, label: "Mars" },
  { value: 4, label: "Avril" },
  { value: 5, label: "Mai" },
  { value: 6, label: "Juin" },
  { value: 7, label: "Juillet" },
  { value: 8, label: "Août" },
  { value: 9, label: "Septembre" },
  { value: 10, label: "Octobre" },
  { value: 11, label: "Novembre" },
  { value: 12, label: "Décembre" },
];

function BaptemeReservationPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  // Paramètres URL
  const preselectedCategory = searchParams.get("category") as
    | "AVENTURE"
    | "DUREE"
    | "LONGUE_DUREE"
    | "ENFANT"
    | "HIVER";

  //Etat de scroll de la page
  const [isScrolled, setIsScrolled] = useState(false);

  // États du formulaire
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ParticipantFormData>();
  const [isLoading, setIsLoading] = useState(false);

  // États de sélection
  const [selectedCategory, setSelectedCategory] = useState<string>(
    preselectedCategory || "",
  );
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Bapteme | null>(null);
  const [hasVideo, setHasVideo] = useState(false);

  // États pour le bon cadeau
  const [giftVoucherCode, setGiftVoucherCode] = useState("");
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);
  const [voucherValidated, setVoucherValidated] = useState(false);
  const [voucherError, setVoucherError] = useState("");
  const [showVoucherSuccessDialog, setShowVoucherSuccessDialog] =
    useState(false);

  // États pour l'affichage progressif
  const [showSlots, setShowSlots] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // États de données
  const [availableYears, setAvailableYears] = useState<
    { year: number; count: number }[]
  >([]);
  const [availableMonths, setAvailableMonths] = useState<
    { month: number; count: number }[]
  >([]);
  const [monthsByYear, setMonthsByYear] = useState<
    Record<string, { month: number; count: number }[]>
  >({});
  const [slots, setSlots] = useState<Bapteme[]>([]);
  const [loadingPeriods, setLoadingPeriods] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Hook de prix
  const { getPrice: getBaptemePrice, videoOptionPrice, loading: pricesLoading } = useBaptemePrices();

  const participantType = watch("participantType");

  // SetState du scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Charger les données utilisateur depuis localStorage
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

  // Charger les périodes disponibles quand la catégorie change
  useEffect(() => {
    if (selectedCategory) {
      loadAvailablePeriods();
    }
  }, [selectedCategory]);

  // Charger les créneaux quand année/mois changent
  useEffect(() => {
    if (selectedYear && selectedMonth) {
      loadAvailableSlots();
      setShowSlots(true);
      setShowForm(false);
      setSelectedSlot(null);
    }
  }, [selectedYear, selectedMonth, selectedCategory]);

  // Mettre à jour les mois disponibles quand l'année change
  useEffect(() => {
    if (selectedYear && monthsByYear) {
      const months = monthsByYear[selectedYear.toString()] || [];
      if (months.length > 0) {
        setAvailableMonths(months);

        // Auto-sélection du mois par défaut
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        // Si c'est l'année en cours et que le mois en cours est disponible, on le sélectionne
        if (selectedYear === currentYear) {
          const hasCurrentMonth = months.some((m) => m.month === currentMonth);
          if (hasCurrentMonth) {
            setSelectedMonth(currentMonth);
          } else if (months.length === 1) {
            setSelectedMonth(months[0].month);
          }
        } else if (months.length === 1) {
          // Sinon si un seul mois dispo (pour une autre année), on le sélectionne
          setSelectedMonth(months[0].month);
        }
      } else {
        setAvailableMonths([]);
      }
    }
  }, [selectedYear, monthsByYear]);

  const loadAvailablePeriods = async () => {
    try {
      setLoadingPeriods(true);

      const params = new URLSearchParams({ type: "bapteme" });
      if (selectedCategory) params.set("category", selectedCategory);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/availability/periods?${params}`,
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
          },
        },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAvailableYears(data.data.years || []);
          setMonthsByYear(data.data.monthsByYear || {});

          // Logique de sélection par défaut de l'année
          const years = data.data.years || [];
          const now = new Date();
          const currentYear = now.getFullYear();

          if (years.some((y: { year: number }) => y.year === currentYear)) {
            // Si l'année en cours est disponible, on la sélectionne
            setSelectedYear(currentYear);
          } else if (years.length === 1) {
            // Sinon si une seule année disponible, on la sélectionne
            setSelectedYear(years[0].year);
          }
        }
      }
    } catch (error) {
      console.error("Erreur chargement périodes disponibles:", error);
    } finally {
      setLoadingPeriods(false);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedYear || !selectedMonth) return;

    try {
      setLoadingSlots(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/baptemes`,
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        let filteredSlots = data.data;

        // Filtrer par catégorie - inclut les baptêmes qui ont la catégorie recherchée parmi leurs catégories
        filteredSlots = filteredSlots.filter((bapteme: Bapteme) => {
          // Vérifier si le baptême a la catégorie sélectionnée dans son tableau de catégories
          return (
            bapteme.categories && bapteme.categories.includes(selectedCategory)
          );
        });

        // Filtrer par année et mois
        const startOfMonth = new Date(selectedYear, selectedMonth - 1, 1);
        const endOfMonth = new Date(selectedYear, selectedMonth, 0, 23, 59, 59);

        filteredSlots = filteredSlots.filter((slot: Bapteme) => {
          const slotDate = new Date(slot.date);
          return slotDate >= startOfMonth && slotDate <= endOfMonth;
        });

        // Filtrer les créneaux futurs
        const now = new Date();
        filteredSlots = filteredSlots.filter((slot: Bapteme) => {
          const slotDate = new Date(slot.date);
          return slotDate > now;
        });

        // Trier par date
        filteredSlots.sort((a: Bapteme, b: Bapteme) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateA.getTime() - dateB.getTime();
        });

        setSlots(filteredSlots);
      }
    } catch (error) {
      console.error("Erreur chargement créneaux:", error);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSlotSelect = (slot: Bapteme) => {
    setSelectedSlot(slot);
    setShowForm(true);
    // Initialiser participantType à "self" par défaut
    setValue("participantType", "self");
    // Scroll vers le formulaire
    setTimeout(() => {
      const formElement = document.getElementById("participant-form-separator");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

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

  const validateGiftVoucher = async () => {
    if (!giftVoucherCode.trim()) {
      setVoucherError("Veuillez entrer un code de bon cadeau");
      return;
    }

    setIsValidatingVoucher(true);
    setVoucherError("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/giftvouchers/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
          },
          body: JSON.stringify({
            code: giftVoucherCode,
            productType: "BAPTEME",
            category: selectedCategory,
          }),
        },
      );

      const data = await response.json();

      if (data.success && data.data.valid) {
        setVoucherValidated(true);
        setShowVoucherSuccessDialog(true);
        setVoucherError("");
        // Désactiver l'option vidéo car le bon cadeau ne couvre que le baptême de base
        setHasVideo(false);
      } else {
        setVoucherError(
          data.message || data.data?.reason || "Code de bon cadeau invalide",
        );
        setVoucherValidated(false);
      }
    } catch (error) {
      console.error("Erreur validation bon cadeau:", error);
      setVoucherError("Erreur lors de la validation du bon cadeau");
      setVoucherValidated(false);
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const removeVoucher = () => {
    setVoucherValidated(false);
    setGiftVoucherCode("");
    setVoucherError("");
  };

  const onSubmit = async (data: ParticipantFormData) => {
    if (!selectedSlot) return;

    setIsLoading(true);

    try {
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
            type: "BAPTEME",
            itemId: selectedSlot.id,
            participantData: {
              ...data,
              weight: Number(data.weight),
              height: Number(data.height),
              selectedCategory: selectedCategory,
              hasVideo: hasVideo,
              usedGiftVoucherCode: voucherValidated
                ? giftVoucherCode
                : undefined,
            },
            quantity: 1,
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        // Déclencher un événement pour rafraîchir le panier
        window.dispatchEvent(new CustomEvent("cartUpdated"));

        // Afficher un toast informatif sur le blocage de la place
        toast({
          title: "Place réservée temporairement",
          description:
            "Cette place est bloquée pendant 1h00. Finalisez votre paiement pour confirmer la réservation.",
          duration: 5000,
        });

        // Afficher la popup de confirmation
        setShowSuccessDialog(true);
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

  const getSelectedCategoryInfo = () => {
    return BAPTEME_CATEGORIES.find((cat) => cat.id === selectedCategory);
  };

  const getMonthLabel = (month: number) => {
    return MONTHS.find((m) => m.value === month)?.label || `Mois ${month}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const formatted = date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTotalPrice = () => {
    if (voucherValidated) return 0;
    return getBaptemePrice(selectedCategory) + (hasVideo ? videoOptionPrice : 0);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div
        className={cn(
          "bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm",
          "transition-all ease-in-out duration-300",
          isScrolled ? "pt-0 pb-0" : "pt-12 pb-4",
        )}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/reserver">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">
              Réserver un baptême
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 pt-24 space-y-12">
        {/* Section 1: Sélection catégorie, année, mois */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Choisissez votre formule et période
            </h2>
            <p className="text-slate-600">
              Sélectionnez votre formule de baptême et la période souhaitée
            </p>
          </div>

          {/* Sélection de catégorie pour les baptêmes */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-slate-800">
              Type de baptême
            </Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => {
                setSelectedCategory(value);
                setSelectedYear(null);
                setSelectedMonth(null);
                setShowSlots(false);
                setShowForm(false);
                setSelectedSlot(null);
              }}
            >
              <SelectTrigger className="h-12 bg-white">
                <SelectValue placeholder="Sélectionnez un type de baptême" />
              </SelectTrigger>
              <SelectContent>
                {BAPTEME_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name} — {pricesLoading ? '…' : `${getBaptemePrice(category.id)}€`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Présentation de la catégorie sélectionnée */}
            {selectedCategory && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 mr-4">
                      <h3 className="font-semibold text-xl text-blue-600 mb-2">
                        {getSelectedCategoryInfo()?.name}
                      </h3>
                      <p className="text-slate-600">
                        {getSelectedCategoryInfo()?.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase font-semibold">Tarif</p>
                      <p className="font-bold text-2xl text-blue-600">
                        {pricesLoading ? (
                          <span className="inline-block w-20 h-7 bg-slate-200 animate-pulse rounded" />
                        ) : `${getBaptemePrice(selectedCategory)}€`}
                      </p>
                      <p className="text-sm text-slate-500">
                        + Option vidéo : {pricesLoading ? (
                          <span className="inline-block w-8 h-4 bg-slate-200 animate-pulse rounded align-middle" />
                        ) : `${videoOptionPrice}€`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sélection année et mois */}
          {selectedCategory && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Année */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold text-slate-800">
                  Année
                </Label>
                {loadingPeriods ? (
                  <div className="flex items-center justify-center py-4 border rounded-lg">
                    <Clock className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-sm">Chargement...</span>
                  </div>
                ) : (
                  <>
                    <Select
                      value={selectedYear?.toString() || ""}
                      onValueChange={(value) => {
                        setSelectedYear(parseInt(value));
                        setSelectedMonth(null);
                        setShowSlots(false);
                        setShowForm(false);
                        setSelectedSlot(null);
                      }}
                      disabled={availableYears.length === 0}
                    >
                      <SelectTrigger className="h-12 bg-white">
                        <SelectValue placeholder="Sélectionner une année" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableYears.map((yearData) => (
                          <SelectItem
                            key={yearData.year}
                            value={yearData.year.toString()}
                          >
                            {yearData.year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {availableYears.length === 0 && (
                      <div className="p-3 bg-slate-100 border border-slate-300 rounded-lg text-center mt-2">
                        <Calendar className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                        <p className="text-slate-600 font-medium text-sm">
                          Aucun créneau disponible
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Aucun créneau disponible pour cette formule de baptême
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
              {/* Mois */}
              <div className="space-y-3">
                <Label className="text-lg font-semibold text-slate-800">
                  Mois
                </Label>
                <Select
                  value={selectedMonth?.toString() || ""}
                  onValueChange={(value) => setSelectedMonth(parseInt(value))}
                  disabled={!selectedYear || availableMonths.length === 0}
                >
                  <SelectTrigger className="h-12 bg-white">
                    <SelectValue placeholder="Sélectionner un mois" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month) => {
                      const monthData = availableMonths.find(
                        (m) => m.month === month.value,
                      );
                      const count = monthData?.count || 0;
                      return (
                        <SelectItem
                          key={month.value}
                          value={month.value.toString()}
                          disabled={count === 0}
                        >
                          <div className="flex items-center justify-between w-full gap-2">
                            <span>{month.label}</span>
                            <Badge
                              variant={count > 0 ? "default" : "secondary"}
                              className={cn(
                                "ml-2",
                                count > 0 ? "bg-blue-600" : "bg-gray-400",
                              )}
                            >
                              {count} créneau{count > 1 ? "x" : ""} disponible
                              {count > 1 ? "s" : ""}
                            </Badge>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Sélection du créneau - Affichée progressivement */}
        {showSlots && selectedYear && selectedMonth && (
          <>
            <Separator />
            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">
                  Choisissez votre créneau
                </h2>
                <p className="text-slate-600">
                  Sélectionnez le créneau qui vous convient pour{" "}
                  {getMonthLabel(selectedMonth)} {selectedYear}
                </p>
              </div>

              {loadingSlots ? (
                <div className="flex items-center justify-center py-12">
                  <Clock className="w-6 h-6 animate-spin mr-2" />
                  Chargement des créneaux disponibles...
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 text-lg">
                    Aucun créneau disponible pour cette période
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {!selectedSlot ? (
                    <>
                      <h3 className="font-semibold text-lg text-slate-800">
                        Créneaux disponibles
                      </h3>
                      <div className="grid gap-4">
                        {slots.map((slot) => (
                          <SlotCard
                            key={slot.id}
                            slot={slot}
                            onSelect={() => handleSlotSelect(slot)}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <Card className="border-2 border-blue-600">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold text-lg text-slate-800 mb-2">
                              Créneau sélectionné
                            </h3>
                            <p className="font-semibold text-lg">
                              {formatDate(selectedSlot.date)}
                            </p>
                            <p className="text-slate-600">
                              {formatTime(selectedSlot.date)} -{" "}
                              {selectedSlot.duration} min
                            </p>
                          </div>
                          <Button
                            onClick={() => {
                              setSelectedSlot(null);
                              setShowForm(false);
                            }}
                            variant="outline"
                            size="sm"
                          >
                            Modifier
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Section 3: Informations participant - Affichée après sélection du créneau */}
        {showForm && selectedSlot && (
          <>
            <Separator id="participant-form-separator" />
            <div
              id="participant-form"
              className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500"
            >
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-slate-800 mb-2">
                    Vos informations
                  </h2>
                  <p className="text-slate-600">
                    Renseignez les informations du participant pour finaliser la
                    réservation
                  </p>
                </div>

                {/* Récapitulatif créneau sélectionné */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg text-slate-800 mb-4">
                      Créneau sélectionné
                    </h3>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-lg">
                          {formatDate(selectedSlot.date)}
                        </p>
                        <p className="text-slate-600">
                          {formatTime(selectedSlot.date)} -{" "}
                          {selectedSlot.duration} min
                        </p>
                      </div>
                      <div className="text-right">
                        {voucherValidated ? (
                          <div>
                            <p className="font-bold text-xl text-gray-400 line-through">
                              {pricesLoading ? (
                                <span className="inline-block w-14 h-6 bg-slate-200 animate-pulse rounded" />
                              ) : `${getBaptemePrice(selectedCategory)}€`}
                            </p>
                            <p className="font-bold text-2xl text-green-600">0€</p>
                          </div>
                        ) : (
                          <p className="font-bold text-xl text-blue-600">
                            {pricesLoading ? (
                              <span className="inline-block w-14 h-6 bg-slate-200 animate-pulse rounded" />
                            ) : `${getBaptemePrice(selectedCategory)}€`}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {/* Sélection participant */}
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
                            <div
                              className={`font-semibold text-lg ${
                                participantType === "self"
                                  ? "text-blue-700"
                                  : "text-slate-800"
                              }`}
                            >
                              Pour moi
                            </div>
                            <div
                              className={`text-sm mt-1 ${
                                participantType === "self"
                                  ? "text-blue-600"
                                  : "text-slate-600"
                              }`}
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
                            <div
                              className={`font-semibold text-lg ${
                                participantType === "other"
                                  ? "text-blue-700"
                                  : "text-slate-800"
                              }`}
                            >
                              Pour quelqu&apos;un d&apos;autre
                            </div>
                            <div
                              className={`text-sm mt-1 ${
                                participantType === "other"
                                  ? "text-blue-600"
                                  : "text-slate-600"
                              }`}
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
                      {participantType === "self"
                        ? "personnelles"
                        : "du participant"}
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
                            {...register("firstName", {
                              required: "Prénom requis",
                            })}
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
                            {...register("lastName", {
                              required: "Nom requis",
                            })}
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

                      <div>
                        <Label htmlFor="birthDate">Date de naissance *</Label>
                        <Input
                          id="birthDate"
                          type="date"
                          {...register("birthDate", {
                            required: "Date de naissance requise",
                          })}
                          className="mt-1"
                        />
                        {errors.birthDate && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.birthDate.message}
                          </p>
                        )}
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
                            {...register("phone", {
                              required: "Téléphone requis",
                            })}
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
                              max: {
                                value: 120,
                                message: "Poids maximum 120kg",
                              },
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
                              min: {
                                value: 120,
                                message: "Taille minimum 120cm",
                              },
                              max: {
                                value: 220,
                                message: "Taille maximum 220cm",
                              },
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

                  {/* Section Bon Cadeau */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">
                      Vous avez un bon cadeau ?
                    </h3>

                    <Card className="border-2 border-cyan-200 bg-cyan-50">
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-start gap-3">
                          <Gift className="w-6 h-6 text-cyan-600 mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-cyan-900 mb-2">
                              Utilisez votre bon cadeau
                            </h4>
                            <p className="text-sm text-cyan-800 mb-4">
                              Si vous avez reçu un bon cadeau pour ce type de
                              baptême, entrez le code ci-dessous pour bénéficier
                              de votre place gratuite.
                            </p>

                            {!voucherValidated ? (
                              <div className="space-y-3">
                                <div className="flex gap-2">
                                  <Input
                                    value={giftVoucherCode}
                                    onChange={(e) => {
                                      setGiftVoucherCode(
                                        e.target.value.toUpperCase(),
                                      );
                                      setVoucherError("");
                                    }}
                                    placeholder="GVSCP-XXXXXXXX-XXXX"
                                    className={`flex-1 ${
                                      voucherError ? "border-red-500" : ""
                                    }`}
                                    disabled={isValidatingVoucher}
                                  />
                                  <Button
                                    type="button"
                                    onClick={validateGiftVoucher}
                                    disabled={
                                      isValidatingVoucher ||
                                      !giftVoucherCode.trim()
                                    }
                                    className="bg-cyan-600 hover:bg-cyan-700"
                                  >
                                    {isValidatingVoucher ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Validation...
                                      </>
                                    ) : (
                                      "Valider"
                                    )}
                                  </Button>
                                </div>
                                {voucherError && (
                                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-800">
                                      {voucherError}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-green-800">
                                    Bon cadeau validé !
                                  </p>
                                  <p className="text-xs text-green-700 mt-1">
                                    Code : {giftVoucherCode}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={removeVoucher}
                                  className="text-green-700 hover:text-green-900"
                                >
                                  Retirer
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Option vidéo pour baptêmes - Masquée si bon cadeau validé */}
                  {!voucherValidated && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-slate-800">
                        Options
                      </h3>

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
                                className={`font-semibold text-lg ${
                                  hasVideo ? "text-blue-700" : "text-slate-800"
                                }`}
                              >
                                Option vidéo souvenir
                              </div>
                              <p
                                className={`text-sm ${
                                  hasVideo ? "text-blue-600" : "text-slate-600"
                                }`}
                              >
                                Immortalisez votre vol avec une vidéo
                                professionnelle
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
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-700">
                          {getCategoryLabel(selectedCategory)}
                        </span>
                        <span className="font-semibold text-slate-800">
                          {pricesLoading ? (
                            <span className="inline-block w-14 h-5 bg-slate-200 animate-pulse rounded" />
                          ) : `${getBaptemePrice(selectedCategory)}€`}
                        </span>
                      </div>
                      {hasVideo && !voucherValidated && (
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
                      {voucherValidated && (
                        <div className="flex justify-between items-center text-green-600">
                          <span className="font-medium text-slate-700">
                            Bon cadeau appliqué
                          </span>
                          <span className="font-semibold">
                            {pricesLoading ? (
                              <span className="inline-block w-14 h-5 bg-slate-200 animate-pulse rounded" />
                            ) : `-${getBaptemePrice(selectedCategory)}€`}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xl text-slate-800">
                          Total
                        </span>
                        {voucherValidated ? (
                          <div className="text-right">
                            <span className="font-bold text-xl text-gray-400 line-through block">
                              {pricesLoading ? (
                                <span className="inline-block w-16 h-6 bg-slate-200 animate-pulse rounded" />
                              ) : `${getBaptemePrice(selectedCategory) + (hasVideo ? videoOptionPrice : 0)}€`}
                            </span>
                            <span className="font-bold text-2xl text-green-600">
                              0€
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-2xl text-blue-600">
                            {pricesLoading ? (
                              <span className="inline-block w-16 h-7 bg-slate-200 animate-pulse rounded" />
                            ) : `${getTotalPrice()}€`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Boutons */}
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedSlot(null);
                        setShowForm(false);
                      }}
                      className="flex-1 h-12"
                      size="lg"
                    >
                      Modifier le créneau
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
              </div>
            </div>
          </>
        )}
      </div>

      {/* Dialog de succès validation bon cadeau */}
      <Dialog
        open={showVoucherSuccessDialog}
        onOpenChange={setShowVoucherSuccessDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center">
                <Gift className="w-8 h-8 text-cyan-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              Bon cadeau validé !
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Votre bon cadeau a été validé avec succès.
              <br />
              Votre réservation sera gratuite !
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              onClick={() => setShowVoucherSuccessDialog(false)}
              className="w-full bg-cyan-600 hover:bg-cyan-700"
              size="lg"
            >
              Continuer ma réservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation après ajout au panier */}
      <Dialog
        open={showSuccessDialog}
        onOpenChange={(open) => {
          setShowSuccessDialog(open);
          // Si la popup est fermée sans action, rediriger vers /reserver
          if (!open) {
            router.push("/reserver");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl">
              Place temporairement bloquée.
            </DialogTitle>
            <DialogDescription className="text-center text-base space-y-2">
              <p className="font-semibold text-slate-800">
                Votre place est bloquée pendant 1h00
              </p>
              <p className="text-sm">
                Cette place est temporairement réservée pour vous. Finalisez
                votre paiement dans l&apos;heure pour confirmer votre réservation.
              </p>
              <div className="flex items-center justify-center gap-2 text-orange-600 bg-orange-50 p-2 rounded-lg mt-3">
                <Clock className="w-4 h-4" />
                {(() => {
                  function Countdown({
                    initialSeconds,
                    start,
                  }: {
                    initialSeconds: number;
                    start: boolean;
                  }) {
                    const [secondsLeft, setSecondsLeft] =
                      useState(initialSeconds);

                    // Reset when dialog re-opens
                    useEffect(() => {
                      if (!start) return;
                      setSecondsLeft(initialSeconds);
                      const id = setInterval(() => {
                        setSecondsLeft((prev) => {
                          if (prev <= 1) {
                            clearInterval(id);
                            return 0;
                          }
                          return prev - 1;
                        });
                      }, 1000);
                      return () => clearInterval(id);
                    }, [start, initialSeconds]);

                    const minutes = Math.floor(secondsLeft / 60)
                      .toString()
                      .padStart(2, "0");
                    const seconds = (secondsLeft % 60)
                      .toString()
                      .padStart(2, "0");

                    return (
                      <span className="text-sm font-medium">
                        Temps restant : {minutes}:{seconds}
                      </span>
                    );
                  }

                  return (
                    <Countdown
                      initialSeconds={60 * 60}
                      start={showSuccessDialog}
                    />
                  );
                })()}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-col gap-2 mt-4">
            <Button
              onClick={() => {
                setShowSuccessDialog(false);
                router.push("/reserver");
              }}
              className="w-full gap-2"
              size="lg"
            >
              <Plus className="w-4 h-4" />
              Je continue mes achats
            </Button>
            <Button
              onClick={() => {
                setShowSuccessDialog(false);
                router.push("/checkout");
              }}
              variant="outline"
              className="w-full gap-2"
              size="lg"
            >
              <ShoppingCart className="w-4 h-4" />
              Voir mon panier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Composant pour afficher un créneau
function SlotCard({ slot, onSelect }: { slot: Bapteme; onSelect: () => void }) {
  const { availability, loading } = useAvailability("bapteme", slot.id);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const formatted = date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isAvailable = availability?.available ?? true;
  const availablePlaces = availability?.availablePlaces ?? slot.places;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        !isAvailable ? "opacity-50" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <div>
                <h3 className="font-semibold">{formatDate(slot.date)}</h3>
                <p className="text-sm text-slate-600">
                  {formatTime(slot.date)}- {slot.duration} min
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {loading ? (
                  <span className="text-sm text-slate-500">
                    Vérification...
                  </span>
                ) : (
                  <Badge variant={isAvailable ? "default" : "destructive"}>
                    {isAvailable
                      ? `${availablePlaces} place${
                          availablePlaces > 1 ? "s" : ""
                        }`
                      : "Complet"}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                onClick={onSelect}
                disabled={!isAvailable}
                size="sm"
                className="gap-1"
              >
                Choisir ce créneau
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BaptemeReservationClientPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <BaptemeReservationPageContent />
    </Suspense>
  );
}
