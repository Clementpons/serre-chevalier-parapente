"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Gift,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
  Calendar,
  Users,
  ShoppingCart,
} from "lucide-react";
import { SessionManager } from "@/lib/sessionManager";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

interface VoucherInfo {
  code: string;
  productType: "STAGE" | "BAPTEME";
  stageCategory: string | null;
  baptemeCategory: string | null;
  recipientName: string;
  expiryDate: string;
}

interface StageSlot {
  id: string;
  startDate: string;
  duration: number;
  places: number;
  availablePlaces: number;
  price: number;
  type: string;
  promotionOriginalPrice: number | null;
}

interface BaptemeSlot {
  id: string;
  date: string;
  startTime: string;
  duration: number;
  places: number;
  availablePlaces: number;
  categories: string[];
}

interface ParticipantFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  weight: number;
  height: number;
  birthDate?: string;
}

// ─── Label helpers ────────────────────────────────────────────────────────────

const STAGE_LABELS: Record<string, string> = {
  INITIATION: "Stage Initiation",
  PROGRESSION: "Stage Progression",
  AUTONOMIE: "Stage Autonomie",
};

const BAPTEME_LABELS: Record<string, string> = {
  AVENTURE: "Baptême Aventure",
  DUREE: "Baptême Durée",
  LONGUE_DUREE: "Baptême Longue Durée",
  ENFANT: "Baptême Enfant",
  HIVER: "Baptême Hiver",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─── Step indicators ──────────────────────────────────────────────────────────

const STEPS = [
  { label: "Mon code", icon: Gift },
  { label: "Mon créneau", icon: Calendar },
  { label: "Mes infos", icon: Users },
];

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const active = idx === current;
        const done = idx < current;
        return (
          <div key={idx} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                done
                  ? "bg-green-100 text-green-700"
                  : active
                  ? "bg-cyan-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {done ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`w-8 h-0.5 ${done ? "bg-green-400" : "bg-gray-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function UtiliserBonCadeauClient() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState(0); // 0: code, 1: slot, 2: infos, 3: done
  const [codeInput, setCodeInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [voucher, setVoucher] = useState<VoucherInfo | null>(null);
  const [slots, setSlots] = useState<(StageSlot | BaptemeSlot)[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<StageSlot | BaptemeSlot | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ParticipantFormData>();

  // ── Step 1: Validate voucher code ──────────────────────────────────────────

  const handleLookupCode = async () => {
    if (!codeInput.trim()) {
      toast({ title: "Erreur", description: "Veuillez saisir un code", variant: "destructive" });
      return;
    }

    setIsValidating(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/giftvouchers/lookup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
          },
          body: JSON.stringify({ code: codeInput.trim().toUpperCase() }),
        }
      );
      const data = await res.json();

      if (!data.success) {
        toast({ title: "Code invalide", description: data.message, variant: "destructive" });
        return;
      }

      setVoucher(data.data);
      await loadSlots(data.data);
      setStep(1);
    } catch {
      toast({ title: "Erreur", description: "Impossible de vérifier le code", variant: "destructive" });
    } finally {
      setIsValidating(false);
    }
  };

  // ── Step 2: Load slots ─────────────────────────────────────────────────────

  const loadSlots = async (v: VoucherInfo) => {
    setLoadingSlots(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_BACKOFFICE_URL;
      const headers = { "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "" };

      if (v.productType === "STAGE") {
        const res = await fetch(`${apiBase}/api/stages`, { headers });
        const data = await res.json();
        if (data.success) {
          const now = new Date();
          const filtered = (data.data as StageSlot[]).filter(
            (s) =>
              (s.type === v.stageCategory ||
                (v.stageCategory === "INITIATION" && s.type === "DOUBLE") ||
                (v.stageCategory === "PROGRESSION" && s.type === "DOUBLE")) &&
              new Date(s.startDate) > now &&
              s.availablePlaces > 0
          );
          setSlots(filtered);
        }
      } else {
        const res = await fetch(`${apiBase}/api/baptemes`, { headers });
        const data = await res.json();
        if (data.success) {
          const now = new Date();
          const filtered = (data.data as BaptemeSlot[]).filter(
            (b) =>
              b.categories.includes(v.baptemeCategory!) &&
              new Date(b.date) > now &&
              b.availablePlaces > 0
          );
          setSlots(filtered);
        }
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les créneaux", variant: "destructive" });
    } finally {
      setLoadingSlots(false);
    }
  };

  // ── Step 3 → Cart ──────────────────────────────────────────────────────────

  const onSubmitParticipant = async (formData: ParticipantFormData) => {
    if (!voucher || !selectedSlot) return;

    setIsSubmitting(true);
    try {
      const sessionId = SessionManager.getOrCreateSessionId();

      const body: Record<string, unknown> = {
        type: voucher.productType,
        itemId: selectedSlot.id,
        participantData: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          weight: formData.weight,
          height: formData.height,
          birthDate: formData.birthDate,
          usedGiftVoucherCode: voucher.code,
          ...(voucher.productType === "STAGE" && {
            selectedStageType: voucher.stageCategory,
          }),
          ...(voucher.productType === "BAPTEME" && {
            selectedCategory: voucher.baptemeCategory,
          }),
        },
        quantity: 1,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKOFFICE_URL}/api/cart/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-session-id": sessionId,
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
          },
          body: JSON.stringify(body),
        }
      );
      const result = await res.json();

      if (result.success) {
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        setStep(3);
      } else {
        toast({ title: "Erreur", description: result.message || "Erreur lors de l'ajout au panier", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", description: "Erreur lors de l'ajout au panier", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 pt-12">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/reserver">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-slate-800">Utiliser mon bon cadeau</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {step < 3 && <StepBar current={step} />}

        {/* ── Step 0: Saisie du code ────────────────────────────────────────── */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-cyan-600" />
                Entrez votre code bon cadeau
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 text-sm">
                Votre code a été fourni lors de l'achat du bon cadeau. Il commence
                par <strong>GVSCP-</strong>.
              </p>
              <div className="flex gap-2">
                <Input
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  placeholder="GVSCP-XXXXXXXX-XXXX"
                  className="font-mono text-lg tracking-wider"
                  onKeyDown={(e) => e.key === "Enter" && handleLookupCode()}
                />
                <Button
                  onClick={handleLookupCode}
                  disabled={isValidating}
                  className="bg-cyan-600 hover:bg-cyan-700 shrink-0"
                >
                  {isValidating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Valider
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Step 1: Choix du créneau ──────────────────────────────────────── */}
        {step === 1 && voucher && (
          <div className="space-y-4">
            {/* Info voucher */}
            <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 flex items-start gap-3">
              <Gift className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-cyan-900">
                  Bon cadeau pour{" "}
                  {voucher.productType === "STAGE"
                    ? STAGE_LABELS[voucher.stageCategory!] ?? voucher.stageCategory
                    : BAPTEME_LABELS[voucher.baptemeCategory!] ?? voucher.baptemeCategory}
                </p>
                <p className="text-sm text-cyan-700">
                  Bénéficiaire : <strong>{voucher.recipientName}</strong> · Valable
                  jusqu'au {new Date(voucher.expiryDate).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Choisissez votre créneau</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSlots ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">Aucun créneau disponible pour le moment</p>
                    <p className="text-sm mt-1">
                      Revenez plus tard ou contactez-nous directement.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {voucher.productType === "STAGE"
                      ? (slots as StageSlot[]).map((slot) => (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`w-full text-left p-4 border-2 rounded-xl transition-all ${
                              selectedSlot?.id === slot.id
                                ? "border-cyan-500 bg-cyan-50"
                                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-slate-800">
                                  {formatDate(slot.startDate)}
                                </p>
                                <p className="text-sm text-slate-500 mt-0.5">
                                  {slot.duration} jours · {slot.availablePlaces} place
                                  {slot.availablePlaces > 1 ? "s" : ""} disponible
                                  {slot.availablePlaces > 1 ? "s" : ""}
                                </p>
                              </div>
                              {slot.promotionOriginalPrice && (
                                <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                                  Promo
                                </Badge>
                              )}
                            </div>
                          </button>
                        ))
                      : (slots as BaptemeSlot[]).map((slot) => (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`w-full text-left p-4 border-2 rounded-xl transition-all ${
                              selectedSlot?.id === slot.id
                                ? "border-cyan-500 bg-cyan-50"
                                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <p className="font-semibold text-slate-800">
                              {formatDate(slot.date)}
                            </p>
                            <p className="text-sm text-slate-500 mt-0.5">
                              {slot.startTime} · {slot.duration} min ·{" "}
                              {slot.availablePlaces} place
                              {slot.availablePlaces > 1 ? "s" : ""} disponible
                              {slot.availablePlaces > 1 ? "s" : ""}
                            </p>
                          </button>
                        ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => { setStep(0); setSelectedSlot(null); }}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <Button
                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                disabled={!selectedSlot}
                onClick={() => setStep(2)}
              >
                Continuer
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 2: Infos participant ──────────────────────────────────────── */}
        {step === 2 && voucher && selectedSlot && (
          <div className="space-y-4">
            {/* Recap slot */}
            <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-sm text-slate-700">
              <p className="font-semibold">
                {voucher.productType === "STAGE"
                  ? STAGE_LABELS[(selectedSlot as StageSlot).type] ?? (selectedSlot as StageSlot).type
                  : BAPTEME_LABELS[voucher.baptemeCategory!] ?? voucher.baptemeCategory}
              </p>
              <p className="mt-0.5 text-slate-500">
                {voucher.productType === "STAGE"
                  ? formatDate((selectedSlot as StageSlot).startDate)
                  : formatDate((selectedSlot as BaptemeSlot).date)}
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Informations du participant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  id="participant-form"
                  onSubmit={handleSubmit(onSubmitParticipant)}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        {...register("firstName", { required: "Prénom requis" })}
                        placeholder="Jean"
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        {...register("lastName", { required: "Nom requis" })}
                        placeholder="Dupont"
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email", { required: "Email requis" })}
                      placeholder="jean.dupont@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      {...register("phone", { required: "Téléphone requis" })}
                      placeholder="06 12 34 56 78"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="weight">Poids (kg) *</Label>
                      <Input
                        id="weight"
                        type="number"
                        {...register("weight", {
                          required: "Poids requis",
                          valueAsNumber: true,
                          min: { value: 20, message: "Minimum 20 kg" },
                          max: { value: 120, message: "Maximum 120 kg" },
                        })}
                        placeholder="70"
                      />
                      {errors.weight && (
                        <p className="text-red-500 text-xs mt-1">{errors.weight.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="height">Taille (cm) *</Label>
                      <Input
                        id="height"
                        type="number"
                        {...register("height", {
                          required: "Taille requise",
                          valueAsNumber: true,
                          min: { value: 100, message: "Minimum 100 cm" },
                          max: { value: 220, message: "Maximum 220 cm" },
                        })}
                        placeholder="175"
                      />
                      {errors.height && (
                        <p className="text-red-500 text-xs mt-1">{errors.height.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="birthDate">Date de naissance</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      {...register("birthDate")}
                    />
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <Button
                type="submit"
                form="participant-form"
                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Ajout en cours...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Valider la réservation
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* ── Step 3: Confirmation ──────────────────────────────────────────── */}
        {step === 3 && (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-9 h-9 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Bon cadeau ajouté au panier !
              </h2>
              <p className="text-slate-600 mb-6">
                Votre créneau a été réservé. Finalisez votre commande pour
                confirmer la réservation.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => router.push("/checkout")}
                  className="bg-cyan-600 hover:bg-cyan-700"
                  size="lg"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Finaliser la commande
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/reserver")}
                  size="lg"
                >
                  Retour aux activités
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
