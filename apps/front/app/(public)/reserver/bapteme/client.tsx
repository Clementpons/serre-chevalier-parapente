"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  ArrowLeft,
  ShoppingCart,
  Loader2,
  Check,
  Video,
} from "lucide-react";
import { useBaptemePrices } from "@/hooks/useBaptemePrices";
import { SessionManager } from "@/lib/sessionManager";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import {
  BaptemeCalendar,
  BAPTEME_CATEGORIES,
  ALL_CATEGORY_IDS,
  MONTH_NAMES,
  CATEGORY_CONFIG,
  formatDateFull,
  formatTime,
  initCategoriesFromParam,
  type Bapteme,
} from "@/components/booking/BaptemeCalendar";

// ─── Local Types ──────────────────────────────────────────────────────────────

interface ParticipantFormData {
  participantType: "self" | "other";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  weight: number;
  height: number;
  birthDate?: string;
}


// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ currentStep, onGoToStep1 }: { currentStep: 1 | 2; onGoToStep1?: () => void }) {
  return (
    <div className="flex items-center justify-center gap-2 py-2">
      <button
        type="button"
        onClick={currentStep === 2 ? onGoToStep1 : undefined}
        className={cn(
          "flex items-center gap-2 transition-opacity",
          currentStep === 2 ? "cursor-pointer hover:opacity-70" : "cursor-default",
        )}
      >
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
          currentStep >= 1 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500",
        )}>
          {currentStep > 1 ? <Check className="w-4 h-4" /> : "1"}
        </div>
        <span className={cn("hidden sm:inline text-sm font-medium", currentStep >= 1 ? "text-blue-700" : "text-slate-400")}>
          Choisir un créneau
        </span>
      </button>
      <div className={cn("h-0.5 w-6 sm:w-8 mx-1 transition-colors", currentStep >= 2 ? "bg-blue-600" : "bg-slate-200")} />
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
          currentStep >= 2 ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500",
        )}>
          2
        </div>
        <span className={cn("hidden sm:inline text-sm font-medium", currentStep >= 2 ? "text-blue-700" : "text-slate-400")}>
          Vos informations
        </span>
      </div>
    </div>
  );
}

// ─── Stats Summary ────────────────────────────────────────────────────────────

function StatsSummary({
  allBaptemes,
  selectedCategories,
  viewDate,
}: {
  allBaptemes: Bapteme[];
  selectedCategories: string[];
  viewDate: Date;
}) {
  const startOfMonth = useMemo(() => new Date(viewDate.getFullYear(), viewDate.getMonth(), 1), [viewDate]);
  const endOfMonth = useMemo(() => new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0), [viewDate]);

  const stats = useMemo(() =>
    selectedCategories.map((catId) => {
      const matching = allBaptemes.filter((b) => {
        const d = new Date(b.date); d.setHours(0, 0, 0, 0);
        if (d < startOfMonth || d > endOfMonth) return false;
        return b.categories.includes(catId);
      });
      return {
        catId,
        count: matching.length,
        totalPlaces: matching.reduce((sum, b) => sum + b.places, 0),
      };
    }),
  [allBaptemes, selectedCategories, startOfMonth, endOfMonth]);

  if (allBaptemes.length === 0 || selectedCategories.length === 0) return null;

  return (
    <div className="text-sm space-y-1.5">
      <p className="text-slate-500">
        En <strong className="text-slate-700">{MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}</strong> :
      </p>
      <div className="space-y-1">
        {stats.map(({ catId, count, totalPlaces }) => {
          const cfg = CATEGORY_CONFIG[catId];
          return (
            <div key={catId} className="flex items-center gap-2">
              <span className={cn("inline-block w-3 h-2.5 rounded-sm shrink-0", cfg?.bgBar)} />
              <span className="text-slate-600">
                <strong className="text-slate-800">{count}</strong> créneau{count > 1 ? "x" : ""}{" "}
                <strong className={cfg?.textClass}>{cfg?.shortLabel}</strong>
                {totalPlaces > 0 && (
                  <span className="text-slate-400">
                    {" "}— {totalPlaces} place{totalPlaces > 1 ? "s" : ""} au total
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function BaptemeReservationPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [isScrolled, setIsScrolled] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { errors } } =
    useForm<ParticipantFormData>();
  const [isLoading, setIsLoading] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
    initCategoriesFromParam(searchParams.get("category")),
  );
  const [accumulatedBaptemes, setAccumulatedBaptemes] = useState<Bapteme[]>([]);
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [selectedSlot, setSelectedSlot] = useState<Bapteme | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [hasVideo, setHasVideo] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const { getPrice: getBaptemePrice, videoOptionPrice, loading: pricesLoading } =
    useBaptemePrices();

  const participantType = watch("participantType");

  useEffect(() => {
    const handleScroll = () =>
      setIsScrolled((window.pageYOffset || document.documentElement.scrollTop) > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("userInfo");
    if (saved) {
      try {
        const d = JSON.parse(saved);
        setValue("firstName", d.firstName || "");
        setValue("lastName", d.lastName || "");
        setValue("email", d.email || "");
        setValue("phone", d.phone || "");
        setValue("weight", d.weight || "");
        setValue("height", d.height || "");
        setValue("birthDate", d.birthDate || "");
      } catch { /* ignore */ }
    }
  }, [setValue]);

  // Pre-select a slot from URL params (coming from /bi-places calendar)
  useEffect(() => {
    const baptemeId = searchParams.get("baptemeId");
    const baptemeCategory = searchParams.get("baptemeCategory");
    const date = searchParams.get("date");

    if (!baptemeId || !baptemeCategory || !date) return;

    const d = new Date(date);
    if (isNaN(d.getTime())) return;

    const year = d.getFullYear();
    const month = d.getMonth();
    const from = new Date(year, month, 1).toISOString().split("T")[0];
    const to = new Date(year, month + 1, 0).toISOString().split("T")[0];

    fetch(
      `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/baptemes?from=${from}&to=${to}&categories=all`,
      { headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "" } },
    )
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) return;
        const bapteme = (data.data as Bapteme[]).find((b) => b.id === baptemeId);
        if (!bapteme) return;
        setSelectedSlot(bapteme);
        setSelectedCategory(baptemeCategory);
        setHasVideo(false);
        setShowForm(true);
        setValue("participantType", "self");
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push a history entry when entering step 2 so the browser back button works
  useEffect(() => {
    if (showForm) {
      history.pushState({ step: 2 }, "");
    }
  }, [showForm]);

  // Intercept browser back button when on step 2 → go back to step 1
  useEffect(() => {
    const handlePopState = () => {
      if (showForm) {
        setSelectedSlot(null);
        setShowForm(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [showForm]);

  const goToStep1 = () => {
    setSelectedSlot(null);
    setShowForm(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(catId) && prev.length === 1) return prev;
      const next = prev.includes(catId)
        ? prev.filter((c) => c !== catId)
        : [...prev, catId];
      const param = next.length === ALL_CATEGORY_IDS.length ? "all" : next.join(",");
      router.replace(`?category=${param}`, { scroll: false });
      return next;
    });
    setSelectedSlot(null);
    setShowForm(false);
  };

  const handleSlotSelect = (slot: Bapteme, category: string) => {
    setSelectedSlot(slot);
    setSelectedCategory(category);
    setHasVideo(false);
    setShowForm(true);
    setValue("participantType", "self");
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  const saveUserInfo = (data: ParticipantFormData) => {
    if (data.participantType === "self") {
      localStorage.setItem("userInfo", JSON.stringify({
        firstName: data.firstName, lastName: data.lastName,
        email: data.email, phone: data.phone,
        weight: data.weight, height: data.height, birthDate: data.birthDate,
      }));
    }
  };

  const catCfg = CATEGORY_CONFIG[selectedCategory];
  const catInfo = BAPTEME_CATEGORIES.find((c) => c.id === selectedCategory);
  const basePrice = selectedSlot && selectedCategory ? getBaptemePrice(selectedCategory) : 0;
  const totalPrice = basePrice + (hasVideo ? videoOptionPrice : 0);

  const onSubmit = async (data: ParticipantFormData) => {
    if (!selectedSlot || !selectedCategory) return;
    setIsLoading(true);
    try {
      saveUserInfo(data);
      const sessionId = SessionManager.getOrCreateSessionId();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/cart/items`, {
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
            selectedCategory,
            hasVideo,
          },
          quantity: 1,
        }),
      });
      const result = await res.json();
      if (result.success) {
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        toast({
          title: "Place réservée temporairement",
          description: "Cette place est bloquée pendant 1h00. Finalisez votre paiement pour confirmer.",
          duration: 5000,
        });
        setShowSuccessDialog(true);
      } else {
        toast({
          title: "Erreur",
          description: result.message || "Erreur lors de l'ajout au panier",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Erreur", description: "Erreur lors de l'ajout au panier", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky header */}
      <div className={cn(
        "bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm transition-all ease-in-out duration-300",
        isScrolled ? "pt-0 pb-0" : "pt-12 pb-4",
      )}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="shrink-0">
              {showForm ? (
                <Button variant="outline" size="sm" onClick={goToStep1}>
                  <ArrowLeft className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Retour</span>
                </Button>
              ) : (
                <Link href="/reserver">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Retour</span>
                  </Button>
                </Link>
              )}
            </div>
            <h1 className="text-base sm:text-xl font-bold text-slate-800 truncate flex-1 text-center sm:text-left">
              Réserver un baptême
            </h1>
            <div className="shrink-0">
              <StepIndicator currentStep={showForm ? 2 : 1} onGoToStep1={goToStep1} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 pt-24 space-y-6">

        {/* ── ÉTAPE 1 : calendrier (masqué en étape 2) ── */}
        {!showForm ? (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                Choisissez votre créneau
              </h2>
            </div>

            {/* Category filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-slate-600 shrink-0">Filtrer par formule</span>
              {BAPTEME_CATEGORIES.map((cat) => {
                const isChecked = selectedCategories.includes(cat.id);
                const cfg = CATEGORY_CONFIG[cat.id];
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                      isChecked
                        ? `${cfg.bgLight} ${cfg.textClass}`
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700",
                    )}
                  >
                    <span className={cn(
                      "inline-flex items-center justify-center w-3.5 h-3.5 rounded shrink-0 transition-all",
                      isChecked ? `${cfg.dotClass} border-transparent` : "border border-slate-300 bg-white",
                    )}>
                      {isChecked && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
                    </span>
                    {cat.name}
                    <span className="opacity-60 font-normal">{cat.durationLabel}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-sm text-slate-500">
              Vous avez un bon cadeau ?{" "}
              <Link href="/utiliser-bon-cadeau" className="text-cyan-600 hover:underline font-medium">
                Utilisez-le pour régler votre réservation
              </Link>
            </p>

            {/* Calendar */}
            <Card>
              <CardContent className="p-3 sm:p-5">
                <BaptemeCalendar
                  selectedCategories={selectedCategories}
                  onSlotSelect={handleSlotSelect}
                  selectedSlot={selectedSlot}
                  onBaptemesAccumulated={setAccumulatedBaptemes}
                  getBaptemePrice={getBaptemePrice}
                  onViewDateChange={setCalendarViewDate}
                />
              </CardContent>
            </Card>

            {/* Stats below calendar */}
            {accumulatedBaptemes.length > 0 && (
              <StatsSummary
                allBaptemes={accumulatedBaptemes}
                selectedCategories={selectedCategories}
                viewDate={calendarViewDate}
              />
            )}
          </div>
        ) : selectedSlot && selectedCategory && (
          /* Résumé compact du créneau en étape 2 */
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <p className="text-xs font-semibold text-blue-600 uppercase mb-1.5 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Créneau sélectionné
                  </p>
                  <p className="font-bold text-sm" style={{ color: catCfg?.bgBarHex }}>
                    {catCfg?.label}
                  </p>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5">
                    {formatDateFull(selectedSlot.date)} à {formatTime(selectedSlot.date)}
                    {catInfo && (
                      <span className="text-slate-500 font-normal">
                        {" "}({catInfo.durationLabel} de vol)
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <p className="font-bold text-2xl text-blue-600">{basePrice}€</p>
                  {selectedSlot.acomptePrice && (
                    <p className="text-xs text-slate-500">
                      Acompte aujourd&apos;hui :{" "}
                      <span className="font-semibold text-slate-700">{selectedSlot.acomptePrice}€</span>
                      {" · "}solde sur place :{" "}
                      <span className="font-semibold text-slate-700">
                        {basePrice - selectedSlot.acomptePrice}€
                      </span>
                    </p>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-1"
                    onClick={() => {
                      setSelectedSlot(null);
                      setSelectedCategory("");
                      setShowForm(false);
                    }}
                  >
                    Changer de créneau
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── ÉTAPE 2 ── */}
        {showForm && selectedSlot && selectedCategory && (
          <>
            <Separator id="participant-form-separator" />
            <div
              id="participant-form"
              className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500"
            >
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                  Vos informations
                </h2>
                <p className="text-slate-600 text-sm sm:text-base">
                  Renseignez les informations du participant pour finaliser la réservation
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Pour qui */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold text-slate-800">
                    Pour qui réservez-vous ?
                  </Label>
                  <RadioGroup
                    defaultValue="self"
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    onValueChange={(v) => setValue("participantType", v as "self" | "other")}
                  >
                    {(["self", "other"] as const).map((val) => (
                      <div key={val} className="relative">
                        <RadioGroupItem value={val} id={val} className="peer sr-only" />
                        <Label
                          htmlFor={val}
                          className={cn(
                            "flex items-center justify-center p-5 bg-slate-50 border-2 rounded-lg cursor-pointer transition-all hover:bg-slate-100",
                            participantType === val
                              ? "border-blue-600 bg-blue-50 ring-2 ring-blue-200"
                              : "border-slate-200",
                          )}
                        >
                          <div className="text-center">
                            <div className={cn(
                              "font-semibold text-base",
                              participantType === val ? "text-blue-700" : "text-slate-800",
                            )}>
                              {val === "self" ? "Pour moi" : "Pour quelqu'un d'autre"}
                            </div>
                            <div className={cn(
                              "text-xs mt-1",
                              participantType === val ? "text-blue-600" : "text-slate-500",
                            )}>
                              {val === "self"
                                ? "Mes informations seront sauvegardées"
                                : "Cadeau ou réservation tierce"}
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Informations participant */}
                <div className="space-y-6">
                  <h3 className="text-base font-semibold text-slate-800">
                    Informations {participantType === "self" ? "personnelles" : "du participant"}
                  </h3>
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-700 border-l-4 border-blue-600 pl-3 text-sm">
                      Identité
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Prénom *</Label>
                        <Input
                          id="firstName"
                          {...register("firstName", { required: "Prénom requis" })}
                          placeholder={participantType === "self" ? "Votre prénom" : "Prénom du participant"}
                          className="mt-1"
                        />
                        {errors.firstName && (
                          <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Nom *</Label>
                        <Input
                          id="lastName"
                          {...register("lastName", { required: "Nom requis" })}
                          placeholder={participantType === "self" ? "Votre nom" : "Nom du participant"}
                          className="mt-1"
                        />
                        {errors.lastName && (
                          <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="birthDate">Date de naissance *</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        {...register("birthDate", { required: "Requise" })}
                        className="mt-1"
                      />
                      {errors.birthDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.birthDate.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-700 border-l-4 border-blue-600 pl-3 text-sm">
                      Contact
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="phone">Téléphone *</Label>
                        <Input
                          id="phone"
                          {...register("phone", { required: "Requis" })}
                          placeholder="06 12 34 56 78"
                          className="mt-1"
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-700 border-l-4 border-blue-600 pl-3 text-sm">
                      Informations physiques
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="weight">Poids (kg) *</Label>
                        <Input
                          id="weight"
                          type="number"
                          {...register("weight", {
                            required: "Requis",
                            min: { value: 20, message: "Min 20kg" },
                            max: { value: 120, message: "Max 120kg" },
                          })}
                          placeholder="70"
                          className="mt-1"
                        />
                        {errors.weight && (
                          <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="height">Taille (cm) *</Label>
                        <Input
                          id="height"
                          type="number"
                          {...register("height", {
                            required: "Requise",
                            min: { value: 120, message: "Min 120cm" },
                            max: { value: 220, message: "Max 220cm" },
                          })}
                          placeholder="175"
                          className="mt-1"
                        />
                        {errors.height && (
                          <p className="text-red-500 text-sm mt-1">{errors.height.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Option vidéo */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold text-slate-800">Options</Label>
                  <button
                    type="button"
                    onClick={() => setHasVideo(!hasVideo)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all hover:shadow-md",
                      hasVideo
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300",
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all",
                      hasVideo ? "bg-blue-600 border-transparent" : "border-slate-300 bg-white",
                    )}>
                      {hasVideo && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                    <Video className={cn("w-5 h-5 shrink-0", hasVideo ? "text-blue-600" : "text-slate-400")} />
                    <div className="flex-1 min-w-0">
                      <p className={cn("font-semibold text-sm", hasVideo ? "text-blue-700" : "text-slate-700")}>
                        Option vidéo
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Recevez une vidéo souvenir de votre vol
                      </p>
                    </div>
                    <span className={cn("font-bold text-sm shrink-0", hasVideo ? "text-blue-700" : "text-slate-600")}>
                      +{pricesLoading ? "..." : `${videoOptionPrice}€`}
                    </span>
                  </button>
                </div>

                {/* Récapitulatif */}
                <div className="p-4 sm:p-6 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="text-base font-semibold text-slate-800 mb-4">Récapitulatif</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-slate-700">{catCfg?.label}</span>
                      <span className="font-semibold text-slate-800">{basePrice}€</span>
                    </div>
                    {hasVideo && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 flex items-center gap-2">
                          <Video className="w-3 h-3" /> Option vidéo
                        </span>
                        <span className="text-slate-800">+{videoOptionPrice}€</span>
                      </div>
                    )}
                    <hr className="border-slate-300" />
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg text-slate-800">Total</span>
                      <span className="font-bold text-2xl text-blue-600">{totalPrice}€</span>
                    </div>
                    {selectedSlot.acomptePrice && (
                      <>
                        <hr className="border-dashed border-slate-200" />
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-600">Acompte à régler aujourd&apos;hui</span>
                          <span className="font-semibold text-slate-800">
                            {selectedSlot.acomptePrice}€
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Solde à régler sur place</span>
                          <span className="text-slate-600">
                            {totalPrice - selectedSlot.acomptePrice}€
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedSlot(null);
                      setSelectedCategory("");
                      setShowForm(false);
                    }}
                    className="flex-1 h-12"
                    size="lg"
                  >
                    Modifier le créneau
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1 h-12" size="lg">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 animate-spin" /> Ajout en cours…
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" /> Ajouter au panier
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Dialog: place bloquée */}
      <Dialog
        open={showSuccessDialog}
        onOpenChange={(open) => {
          setShowSuccessDialog(open);
          if (!open) router.push("/reserver");
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
                Finalisez votre paiement dans l&apos;heure pour confirmer votre réservation.
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
                    const [s, setS] = useState(initialSeconds);
                    useEffect(() => {
                      if (!start) return;
                      setS(initialSeconds);
                      const id = setInterval(
                        () => setS((p) => (p <= 1 ? (clearInterval(id), 0) : p - 1)),
                        1000,
                      );
                      return () => clearInterval(id);
                    }, [start, initialSeconds]);
                    return (
                      <span className="text-sm font-medium">
                        Temps restant :{" "}
                        {Math.floor(s / 60).toString().padStart(2, "0")}:
                        {(s % 60).toString().padStart(2, "0")}
                      </span>
                    );
                  }
                  return <Countdown initialSeconds={3600} start={showSuccessDialog} />;
                })()}
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-4">
            <Button
              onClick={() => { setShowSuccessDialog(false); router.push("/reserver"); }}
              className="w-full gap-2"
              size="lg"
            >
              <ArrowLeft className="w-4 h-4" /> Je continue mes achats
            </Button>
            <Button
              onClick={() => { setShowSuccessDialog(false); router.push("/checkout"); }}
              variant="outline"
              className="w-full gap-2"
              size="lg"
            >
              <ShoppingCart className="w-4 h-4" /> Voir mon panier
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function BaptemeReservationClientPage() {
  return (
    <Suspense fallback={<div>Chargement…</div>}>
      <BaptemeReservationPageContent />
    </Suspense>
  );
}
