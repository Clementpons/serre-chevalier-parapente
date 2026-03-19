"use client";

import { TooltipContent } from "@radix-ui/react-tooltip";
import { Button } from "../ui/button";
import { Tooltip, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { MinPriceDisplay } from "../price/MinPriceDisplay";

export default function PricingSection() {
  return (
    <section
      className="px-4 py-12 my-12 lg:px-36 xl:px-48 lg:py-24 lg:my-24 text-center scroll-pt-[-100px]"
      id="pricing"
    >
      <p className="font-bold text-2xl text-slate-800 text-center">
        NOS TARIFS
      </p>
      <p className="bg-blue-100 px-4 py-2 text-xs lg:text-sm text-slate-900 rounded-lg text-center mt-4 inline-flex mx-auto">
        Attention, dernière saison avant augmentation des tarifs ! Nombre de
        places limité
      </p>
      <div className="text-left space-y-8 lg:space-y-0 my-8 xl:my-16 lg:flex lg:items-stretch lg:gap-8">
        <div className="border border-slate-900 rounded-lg p-4 xl:p-8 text-slate-900 space-y-6 w-full flex flex-col justify-between min-h-[35vh]">
          <div>
            <p className="text-xl font-bold">Stage Initiation</p>
            <p className="text-sm">Premier contact avec le parapente</p>
            <p className="text-sm">5 jours</p>
          </div>
          <div>
            <div className="mb-4">
              <MinPriceDisplay
                type="STAGE"
                subType="INITIATION"
                durationDays={5}
              />
            </div>
            <Link
              href="/reserver/stage?stageType=INITIATION"
              title="Réserver votre place"
              className="w-full"
            >
              <Button
                variant={"default"}
                size={"lg"}
                className="w-full"
              >
                Je réserve ma place
              </Button>
            </Link>
            <p className="text-sm text-center mt-4 lg:text-xs">
              Journée supplémentaire : 140,00€
            </p>
          </div>
        </div>
        <div className="border border-slate-900 rounded-lg p-4 xl:p-8 text-slate-900 space-y-6 w-full flex flex-col justify-between min-h-[35vh]">
          <div>
            <p className="text-xl font-bold">Stage Progression</p>
            <p className="text-sm">Aller plus loin et améliorer son pilotage</p>
            <p className="text-sm">5 jours</p>
          </div>
          <div>
            <div className="mb-4">
              <MinPriceDisplay
                type="STAGE"
                subType="PROGRESSION"
                durationDays={5}
              />
            </div>
            <Link
              href="/reserver/stage?stageType=PROGRESSION"
              title="Réserver votre place"
              className="w-full"
            >
              <Button
                variant={"default"}
                size={"lg"}
                className="w-full"
              >
                Je réserve ma place
              </Button>
            </Link>
            <p className="text-sm text-center mt-4 lg:text-xs">
              Journée supplémentaire : 140,00€
            </p>
          </div>
        </div>
        <div className="border border-slate-900 bg-slate-900 rounded-lg p-4 xl:p-8 text-slate-50 space-y-6 w-full flex flex-col justify-between min-h-[35vh]">
          <div>
            <Badge className="bg-blue-600 text-slate-50 mb-2">
              Offre Spéciale
            </Badge>
            <p className="text-xl font-bold">Stage Autonomie*</p>
            <p className="text-sm">(Initiation + Progression)</p>
            <p className="text-sm">10 jours</p>
          </div>
          <div>
            <div className="mb-4">
              <MinPriceDisplay
                type="STAGE"
                subType="AUTONOMIE"
                durationDays={10}
                priceClassName="text-slate-50"
              />
            </div>
            <Link
              href="/reserver/stage?stageType=AUTONOMIE"
              title="Réserver votre place"
              className="w-full"
            >
              <Button
                variant={"default"}
                size={"lg"}
                className="w-full bg-slate-50 text-slate-900 hover:bg-slate-50/90"
              >
                Je réserve ma place
              </Button>
            </Link>
            <p className="text-sm text-center mt-4 lg:text-xs">
              Journée supplémentaire : 120,00€
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-8 lg:flex lg:flex-row-reverse lg:items-stretch lg:space-y-0 lg:gap-8">
        <div className="border border-slate-900 p-4 xl:p-8 rounded-lg bg-slate-50 text-left">
          <div>
            <p className="py-1 px-2 rounded-full bg-blue-700 text-slate-50 inline">
              *Offert
            </p>
          </div>
          <p className="mt-6">
            Si votre autonomie
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline mx-1 cursor-pointer">
                    “lâché solo” <InfoCircledIcon className="inline" />
                  </span>
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 z-20 text-slate-50 rounded-lg text-xs px-2 py-1 -translate-y-2 shadow-lg">
                  <p>
                    Voir section &apos;Quand serai-je autonome en vol ?&apos; de
                    la FAQ
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            n’est pas atteinte à la fin du stage Autonomie, une journée
            supplémentaire vous est offerte (à enchaîner à la suite des 10 jours
            pratiqués).
          </p>
        </div>
        <div className="border border-slate-900 p-4 xl:p-8 rounded-lg bg-slate-50">
          <p className="font-bold my-4 md:my-0 text-left">
            Informations importantes :
          </p>
          <ul className="my-4 space-y-2">
            <li className="before:content-[''] before:block before:w-1 before:h-1 before:bg-slate-900 before:rounded-lg before:absolute before:top-0 before:left-0 before:translate-y-2 relative pl-4 text-left">
              Quel que soit le stage choisi, en cas de mauvaises conditions une
              journée non pratiquée est une journée non facturée.
            </li>
            <li className="before:content-[''] before:block before:w-1 before:h-1 before:bg-slate-900 before:rounded-lg before:absolute before:top-0 before:left-0 before:translate-y-2 relative pl-4 text-left">
              Réduction de 15€ par jour (soit 75€ pour les stages Initiation et
              Progression, 150€ pour le stage Autonomie) si vous venez avec
              votre propre matériel complet
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
