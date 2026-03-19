"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Afficher le banner à chaque visite après un court délai
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    // Update Google Consent Mode
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("consent", "update", {
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
        analytics_storage: "granted",
      });
    }

    // Masquer le banner (sera ré-affiché à la prochaine visite)
    setIsVisible(false);
  };

  const handleDecline = () => {
    // Default is denied, so no need to update gtag unless we want to be explicit
    // But usually 'denied' is the default state we set in layout.tsx

    // Masquer le banner (sera ré-affiché à la prochaine visite)
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-5xl animate-in slide-in-from-bottom-8 fade-in duration-700">
      <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-black/60 p-6 shadow-2xl backdrop-blur-xl supports-[backdrop-filter]:bg-black/40">
        {/* Decorative gradient blob */}
        <div className="pointer-events-none absolute -left-20 -top-20 size-60 rounded-full bg-blue-500/20 blur-[100px]" />

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold text-white">
              Nous respectons votre vie privée
            </h3>
            <p className="text-sm text-gray-300">
              Nous utilisons des cookies pour améliorer votre expérience,
              analyser le trafic et personnaliser les publicités. En acceptant,
              vous consentez à l&apos;utilisation de ces technologies.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              variant="outline"
              onClick={handleDecline}
              className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
            >
              Continuer sans accepter
            </Button>
            <Button
              onClick={handleAccept}
              className="bg-white text-black hover:bg-gray-200"
            >
              Accepter tout
            </Button>
          </div>
        </div>

        {/* Close button for "dismiss" implies decline/continuous without accepting in this context usually, 
            or just closes banner. Let's make it equivalent to decline for simplicity or just hide. 
            For compliance, explicit action is better, but a close button is user friendly.
            Mapping X to decline. */}
        <button
          onClick={handleDecline}
          className="absolute right-2 top-2 rounded-full p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Fermer"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
