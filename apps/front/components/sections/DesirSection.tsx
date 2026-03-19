"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import {
  BikeIcon,
  HomeIcon,
  IceCreamBowlIcon,
  MountainSnowIcon,
  TrainFrontIcon,
  ChevronRightIcon,
  StarIcon,
  BusFrontIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import SliderPentesEcoles from "../ui-self/sliders/SliderPentesEcoles";
import SliderSitesGrandVols from "../ui-self/sliders/SliderSitesGrandVols";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from "../ui/dialog";

export default function DesirSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const autoSlideInterval = 2000; // Temps entre chaque passage automatique de slide en millisecondes

  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slideChanged(s) {
      setCurrentSlide(s.track.details.rel);
    },
  });

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mouseOverRef = useRef(false);

  useEffect(() => {
    const sliderInstance = slider.current;
    if (!sliderInstance) return;

    const clearNextTimeout = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    const nextTimeout = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (mouseOverRef.current) return;
      timeoutRef.current = setTimeout(() => {
        sliderInstance.next();
      }, autoSlideInterval);
    };

    const handleMouseOver = () => {
      mouseOverRef.current = true;
      clearNextTimeout();
    };

    const handleMouseOut = () => {
      mouseOverRef.current = false;
      nextTimeout();
    };

    sliderInstance.container.addEventListener("mouseover", handleMouseOver);
    sliderInstance.container.addEventListener("mouseout", handleMouseOut);

    nextTimeout();

    sliderInstance.on("dragStarted", clearNextTimeout);
    sliderInstance.on("animationEnded", nextTimeout);
    sliderInstance.on("updated", nextTimeout);

    return () => {
      sliderInstance.container.removeEventListener(
        "mouseover",
        handleMouseOver
      );
      sliderInstance.container.removeEventListener("mouseout", handleMouseOut);
    };
  }, [slider]);

  return (
    <section className="mx-4 my-24 lg:mx-36 xl:mx-48 lg:my-48">
      <h2 className="font-bold text-2xl text-slate-800">
        Évitez les pièges à touristes !
      </h2>
      <p className="text-slate-800 mt-1 lg:w-2/3 xl:w-1/2">
        Beaucoup d’écoles n’ont qu’un site de vol très vite saturé. La file
        d’attente à Annecy atteint régulièrement les 200 personnes, par exemple.
        Vous patientez des heures avant de voler, et ne progressez pas. Voici ce
        qui fait notre différence :
      </p>
      <div className="block w-full space-y-4 mt-8 md:flex md:space-y-0 md:gap-8 lg:max-h-[50vh]">
        <div className="w-full rounded-lg overflow-hidden h-[60vh] md:h-[40vh] lg:h-auto box-border self-stretch">
          <SliderPentesEcoles />
        </div>
        <div className="w-full rounded-lg overflow-hidden h-[60vh] md:h-[40vh] lg:h-auto box-border self-stretch">
          <SliderSitesGrandVols />
        </div>
      </div>
      <div className="block w-full space-y-4 mt-8 md:flex md:flex-row-reverse md:space-y-0 md:gap-8">
        <Dialog>
          <DialogTrigger asChild>
            <button
              className="flex w-full rounded-lg overflow-hidden h-[40vh] lg:w-[40%] box-border relative cursor-pointer"
              aria-haspopup="dialog"
              aria-expanded={false}
              aria-controls="radix-:R1gsv9tkq:">
              <Image
                src="/placeholder/bento_materiel.webp"
                width={1080}
                height={1920}
                alt="Image du matériel pour les stages de parapentes dans la vallée de Serre chevalier Briançon"
                className="block w-full h-full object-cover object-center"
              />
              <div className="absolute z-20 text-slate-50 left-0 top-0 p-4 xl:p-8 flex flex-col items-start justify-between h-full">
                <h3 className="text-lg font-bold lg:text-xl text-left">
                  Du matériel homologué, neuf et de qualité
                </h3>
                <div className="flex items-center gap-1">
                  <ChevronRightIcon size={16} className="text-slate-50" />
                  <p className="underline text-base text-slate-50">
                    Voir le matériel
                  </p>
                </div>
              </div>
              <div className="h-full w-full bg-gradient-to-br from-slate-900/80 to-slate-900/0 block absolute top-0 left-0 z-10"></div>
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] xl:max-w-[750px] 3xl:max-w-[1000px] 2xl:p-16">
            <DialogHeader>
              <DialogTitle className="text-slate-900 text-left xl:text-2xl 3xl:text-3xl">
                Du matériel homologué, neuf et de qualité
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className="text-sm xl:text-lg 3xl:text-xl text-slate-600">
              <p className="mt-2">
                -{" "}
                <span className="font-semibold">Voiles Davinci Classic 2</span>,
                une solide réputation d’ailes sécurisantes et performantes
              </p>
              <p className="mt-2">
                -{" "}
                <span className="font-semibold">Sellettes Duo Réversibles</span>
                , confortables et légères
              </p>
              <p className="mt-2">
                - <span className="font-semibold">Portique sellette</span> :
                pour apprendre les bons gestes de pilotage tout en restant au
                sol ; permet de régler la sellette à votre morphologie pour un
                confort optimal
              </p>
            </DialogDescription>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild className="cursor-pointer">
            <div className="w-full rounded-lg overflow-hidden h-auto md:h-[40vh] box-border border border-slate-900 flex flex-col lg:flex-row">
              <div className="w-full h-full md:h-1/3 lg:h-full">
                <Image
                  src={"/placeholder/serreche-parapente-bento-equipe.webp"}
                  width={1920}
                  height={1080}
                  alt="Photo de l'équipe de moniteurs de parapente de Serre Chevalier Briançon."
                  className="block w-full h-full object-cover object-center"
                />
              </div>
              <div className="w-full h-auto md:h-full text-slate-900 p-4 xl:p-8 lg:flex lg:flex-col lg:justify-between">
                <div>
                  <h3 className="text-lg font-bold lg:text-xl">
                    Notre équipe de professionnels rassurants et enthousiastes !
                  </h3>
                  <p className="my-2 mb-4">
                    Expérience, pédagogie et bonne ambiance
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <ChevronRightIcon size={16} className="text-slate-900" />
                  <p className="underline text-base">Nos points forts</p>
                </div>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] xl:max-w-[750px] 3xl:max-w-[1000px] 2xl:p-16">
            <DialogHeader>
              <DialogTitle className="text-slate-900 text-left xl:text-2xl 3xl:text-3xl">
                Nos points forts
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className="text-sm xl:text-lg 3xl:text-xl text-slate-600">
              <ul className="mt-2 pl-6">
                <li className="list-disc">
                  <span className="font-semibold">École certifiée FFVL</span> -
                  Fédération Française de Vol Libre
                </li>
                <li className="list-disc">
                  Clément Pons, moniteur principal, possède{" "}
                  <span className="font-semibold">
                    16 années d’expérience en parapente
                  </span>
                </li>
                <li className="list-disc">
                  <span className="font-semibold">Biplace pédagogique :</span>{" "}
                  décollez avec le moniteur pour tester directement ses conseils
                  en vol, et lui laisser les commandes en cas d’inquiétude !
                </li>
                <li className="list-disc">
                  <span className="font-semibold">
                    Sécurité, progression et proximité :
                  </span>{" "}
                  un moniteur encadre 6 élèves au maximum
                </li>
                <li className="list-disc">
                  <span className="font-semibold">Matériel vidéo</span> pour
                  filmer vos actions et débrief en fin de journée
                </li>
                <li className="list-disc">
                  <span className="font-semibold">
                    2 moniteurs certifiés pour les grands vols,
                  </span>{" "}
                  en liaison radio permanente avec vous : un au décollage et à
                  un l’atterrissage
                </li>
                <li className="list-disc">
                  <span className="font-semibold">
                    Pédagogie efficace et adaptative :
                  </span>{" "}
                  pas de blabla inutile, nous sommes à l’écoute des souhaits et
                  objectifs de chacun de vous
                </li>
                <li className="list-disc">
                  <span className="font-semibold">
                    Très affûtés en météorologie,
                  </span>{" "}
                  nous faisons le maximum pour aller chercher à tout moment les
                  meilleures conditions de vol (calmes et faciles)
                </li>
                <li className="list-disc">
                  <span className="font-semibold">
                    L’ambiance est toujours très bonne
                  </span>
                  , élèves et moniteurs mangent ensemble la plupart du temps.
                  C’est une aventure humaine qui se partage !
                </li>
              </ul>
            </DialogDescription>
          </DialogContent>
        </Dialog>
      </div>
      <div className="block w-full space-y-4 mt-8 md:flex md:space-y-0 md:space-x-4">
        <Dialog>
          <DialogTrigger asChild>
            <div className="w-full rounded-lg overflow-hidden h-auto lg:w-[40%] box-border relative border bg-slate-900">
              <div className="p-4 xl:p-8 flex flex-col justify-between h-full">
                <BusFrontIcon size={36} className="text-slate-50 w-8 h-8" />
                <div className="py-2 lg:py-0">
                  <h3 className="text-lg text-slate-50 font-bold lg:text-xl">
                    Navette incluse et local école en centre-ville de Briançon
                  </h3>
                  <p className="text-slate-50 mt-2">
                    Pas la peine de vous soucier des transports ! Je vous emmène
                    sur les sites du jour (pentes école et sites de vols) depuis
                    le local école
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <ChevronRightIcon size={16} className="text-slate-50" />
                  <p className="underline text-base text-slate-50 cursor-pointer">
                    Voir la navette
                  </p>
                </div>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] xl:max-w-[750px] 3xl:max-w-[1000px] 2xl:p-16">
            <DialogHeader>
              <DialogTitle className="text-slate-900 text-left xl:text-2xl 3xl:text-3xl">
                <p className="font-semibold">Notre navette privative</p>
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className="text-sm xl:text-lg 3xl:text-xl text-slate-600">
              <Image
                src="/placeholder/bento_navette.webp"
                alt={`Photo de la navette privative Serre chevalier parapente à Annecy`}
                width={1920}
                height={1080}
              />
              <p className="text-slate-900 mt-2">
                Pas la peine de vous soucier des transports ! Je vous emmène sur
                les sites du jour (pentes école et sites de vols) depuis le
                local école
              </p>
            </DialogDescription>
          </DialogContent>
        </Dialog>
        <div className="w-full rounded-lg overflow-hidden h-auto box-border border border-slate-900">
          <div className="p-4 pb-6 xl:p-8">
            <h3 className="text-lg font-bold text-slate-900 text-balance lg:text-xl">
              Les avantages du site de Serre-Chevalier
            </h3>
            <div className="space-y-4 xl:flex xl:space-y-0 xl:space-x-4 xl:items-start mt-8">
              <div className="space-y-4 xl:w-1/2">
                <div className="text-slate-900 flex gap-4 items-start">
                  <div className="w-1/6 flex justify-center items-center">
                    <TrainFrontIcon
                      size={36}
                      strokeWidth={1.5}
                      className="text-slate-900 w-[24px] h-[24px]"
                    />
                  </div>
                  <p className="w-5/6">
                    Gare en centre-ville de Briançon. Trains de nuit directs
                    depuis Paris
                  </p>
                </div>
                <div className="text-slate-900 flex gap-4 items-start">
                  <div className="w-1/6 flex justify-center items-center">
                    <HomeIcon
                      size={36}
                      strokeWidth={1.5}
                      className="text-slate-900 w-[24px] h-[24px]"
                    />
                  </div>
                  <p className="w-5/6">Nombreux Airbnb aux tarifs abordables</p>
                </div>
                <div className="text-slate-900 flex gap-4 items-start">
                  <div className="w-1/6 flex justify-center items-center">
                    <IceCreamBowlIcon
                      size={36}
                      strokeWidth={1.5}
                      className="text-slate-900 w-[24px] h-[24px]"
                    />
                  </div>
                  <p className="w-5/6">
                    Commodités à proximité immédiate du local école
                    (supermarchés, boulangeries, cafés, parkings, distributeurs,
                    etc.)
                  </p>
                </div>
              </div>
              <div className="space-y-4 xl:w-1/2">
                <div className="text-slate-900 flex gap-4 items-start">
                  <div className="w-1/6 flex justify-center items-center">
                    <BikeIcon
                      size={36}
                      strokeWidth={1.5}
                      className="text-slate-900 w-[24px] h-[24px]"
                    />
                  </div>
                  <p className="w-5/6">
                    Site multi-activités offrant des infrastructures de qualité
                    : randonnées, Grands Bains du Monêtier, ski, rafting,
                    canyoning, via ferrata, tyrolienne, saut à l&apos;élastique
                  </p>
                </div>
                <div className="text-slate-900 flex gap-4 items-start">
                  <div className="w-1/6 flex justify-center items-center">
                    <StarIcon
                      size={36}
                      strokeWidth={1.5}
                      className="text-slate-900 w-[24px] h-[24px]"
                    />
                  </div>
                  <p className="w-5/6">
                    Apprentissage du parapente fructueux et rentable même en
                    haute saison
                  </p>
                </div>
                <div className="text-slate-900 flex gap-4 items-start">
                  <div className="w-1/6 flex justify-center items-center">
                    <MountainSnowIcon
                      size={36}
                      strokeWidth={1.5}
                      className="text-slate-900 w-[24px] h-[24px]"
                    />
                  </div>
                  <p className="w-5/6">La vallée est magnifique !</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
