"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useKeenSlider } from "keen-slider/react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

export default function SliderPentesEcoles() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentSlideInPopup, setCurrentSlideInPopup] = useState(0);
  const autoSlideInterval = 6000; // Temps entre chaque passage automatique de slide en millisecondes

  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
    loop: true,
    slideChanged(s) {
      setCurrentSlide(s.track.details.rel);
      setCurrentSlideInPopup(s.track.details.rel);
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

  const nextSlideInPopup = (currentSlideInPopup: number) => {
    if (currentSlideInPopup === testimony.length - 1) {
      setCurrentSlideInPopup(0);
    } else {
      setCurrentSlideInPopup(currentSlideInPopup + 1);
    }
  };

  const previousSlideInPopup = (currentSlideInPopup: number) => {
    if (currentSlideInPopup === 0) {
      setCurrentSlideInPopup(testimony.length - 1);
    } else {
      setCurrentSlideInPopup(currentSlideInPopup - 1);
    }
  };

  const testimony = [
    {
      id: 1,
      image: "/placeholder/bento_pentes-ecoles-fontchirstiane.webp",
      title: "Fontchristiane",
      description:
        "Cette large pente à proximité immédiate de l’école offre un dénivelé de 60 mètres permettant des sensations proches des grands vols en toute sécurité",
    },
    {
      id: 2,
      image: "/placeholder/bento_pentes-ecoles-tronchets.webp",
      title: "Plateau des Tronchets",
      description:
        "Située juste au dessus du décollage du Granon, elle est idéale pour tester ses acquis et se rassurer avant ses premiers grands vols si nécessaire",
    },
    {
      id: 3,
      image: "/placeholder/bento_pentes-ecoles-plainalp.webp",
      title: "Bergerie de Plainalp",
      description:
        "Un endroit magnifique praticable sereinement par la grande majorité des vents",
    },
  ];

  return (
    <div className="space-y-3 w-full h-full">
      <div
        ref={sliderRef}
        className="keen-slider h-full w-full overflow-hidden relative">
        <div className="absolute top-0 left-0 p-4 xl:p-8 z-20 text-slate-50 bg-gradient-to-b from-slate-900/70 to-slate-900/0 w-full lg:from-slate-900/50">
          <h3 className="font-bold text-lg lg:text-xl">
            Les 3 meilleures pentes école pour vite progresser
          </h3>
          <p className="text-sm mt-2 lg:text-base">
            Elles font notre renommée pour aller chercher les conditions
            optimales.
          </p>
        </div>
        {testimony.map((item, index) => (
          <div key={item.id} className="keen-slider__slide relative h-full">
            <Image
              src={item.image}
              alt={`PHoto d'un vol de parapente au dessus de la vallée de Serre Chevalier Briançon`}
              width={1920}
              height={1080}
              className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
            <div className="absolute bottom-0 left-0 z-20 p-4 xl:p-8 mb-6">
              <div className="flex items-center gap-2 relative z-30">
                <p className="text-slate-50 font-semibold">{item.title}</p>
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      className="flex items-center gap-1"
                      aria-haspopup="dialog"
                      aria-expanded={currentSlideInPopup === index}
                      aria-controls={`dialog-${index}`}
                      onClick={() => setCurrentSlideInPopup(index)}>
                      <ChevronRightIcon size={16} className="text-slate-50" />
                      <p className="underline text-sm text-slate-50 cursor-pointer">
                        Voir la pente école
                      </p>
                    </button>
                  </DialogTrigger>
                  <DialogContent
                    id={`dialog-${index}`}
                    className="sm:max-w-[425px] xl:max-w-[750px] 3xl:max-w-[1000px] 2xl:p-16">
                    <DialogHeader>
                      <DialogTitle className="text-slate-900 text-left xl:text-2xl 3xl:text-3xl">
                        <p className="font-semibold">
                          {testimony[currentSlideInPopup].title}
                        </p>
                      </DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="text-sm xl:text-lg 3xl:text-xl text-slate-600">
                      <Image
                        src={testimony[currentSlideInPopup].image}
                        alt={`Slide ${index + 1}`}
                        width={1920}
                        height={1080}
                        className=""
                      />
                      <p className="text-slate-900 mt-2">
                        {testimony[currentSlideInPopup].description}
                      </p>
                      <div className="flex items-center justify-right mt-12 gap-2 w-full">
                        <Button
                          variant={"ghost"}
                          className="flex items-center gap-2 text-slate-900"
                          onClick={() => {
                            previousSlideInPopup(currentSlideInPopup);
                          }}>
                          <ChevronLeftIcon size={16} />
                        </Button>
                        <Button
                          variant={"ghost"}
                          className="flex items-center gap-2 text-slate-900"
                          onClick={() => {
                            nextSlideInPopup(currentSlideInPopup);
                          }}>
                          <ChevronRightIcon size={16} />
                        </Button>
                      </div>
                    </DialogDescription>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <div className="h-full w-full bg-gradient-to-tr from-slate-900/80 to-slate-900/0 block absolute top-0 left-0"></div>
          </div>
        ))}
        <div className="flex items-center justify-between absolute w-full left-0 bottom-0 p-4 xl:p-8 pt-0 xl:pt-0">
          <div className="flex space-x-2">
            {testimony.map((_, index) => (
              <div
                key={index}
                className={`w-[.4rem] h-[.4rem] rounded-full transition-all duration-500 ${
                  currentSlide === index ? "bg-slate-50" : "bg-slate-500"
                }`}
              />
            ))}
          </div>
          <div className="flex">
            <ChevronLeftIcon
              size={24}
              onClick={() => slider.current?.prev()}
              className="text-slate-50 cursor-pointer h-4"
            />
            <ChevronRightIcon
              size={24}
              onClick={() => slider.current?.next()}
              className="text-slate-50 cursor-pointer h-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
