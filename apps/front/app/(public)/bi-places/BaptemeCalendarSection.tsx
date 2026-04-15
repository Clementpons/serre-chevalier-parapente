"use client";

import { useRouter } from "next/navigation";
import { BaptemeCalendar, ALL_CATEGORY_IDS, type Bapteme } from "@/components/booking/BaptemeCalendar";
import { useBaptemePrices } from "@/hooks/useBaptemePrices";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export function BaptemeCalendarSection() {
  const router = useRouter();
  const { getPrice: getBaptemePrice } = useBaptemePrices();

  const handleSlotSelect = (slot: Bapteme, category: string) => {
    const date = new Date(slot.date).toISOString().split("T")[0];
    router.push(
      `/reserver/bapteme?baptemeId=${slot.id}&baptemeCategory=${category}&date=${date}`,
    );
  };

  return (
    <section className="mx-4 my-16 lg:mx-36 xl:mx-64 2xl:mx-96">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-3">
          <CalendarDays className="w-6 h-6 text-blue-600" />
          <h2 className="font-bold text-3xl text-slate-800">
            Créneaux disponibles
          </h2>
        </div>
        <p className="text-slate-500 max-w-xl mx-auto">
          Consultez les prochains créneaux de baptême et cliquez sur un créneau
          pour réserver directement.
        </p>
      </div>
      <Card className="shadow-sm">
        <CardContent className="p-3 sm:p-5">
          <BaptemeCalendar
            selectedCategories={ALL_CATEGORY_IDS}
            onSlotSelect={handleSlotSelect}
            selectedSlot={null}
            onBaptemesAccumulated={() => {}}
            getBaptemePrice={getBaptemePrice}
            selectLabel="Réserver ce créneau"
          />
        </CardContent>
      </Card>
    </section>
  );
}
