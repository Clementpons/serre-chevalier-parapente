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
import { set } from "zod";

export default function SliderInterest() {
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
      image: "/placeholder/section-1_1.webp",
    },
    {
      id: 2,
      image: "/placeholder/section-1_2.webp",
    },
    {
      id: 3,
      image: "/placeholder/section-1_3.webp",
    },
  ];

  return (
    <div className="space-y-3 w-full h-full">
      <div
        ref={sliderRef}
        className="keen-slider h-full w-full overflow-hidden relative">
        {testimony.map((item, index) => (
          <div key={item.id} className="keen-slider__slide relative h-full">
            <Image
              src={item.image}
              alt={`Photo d'un vol en parapente à Serre Chevalier`}
              width={1920}
              height={1080}
              className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
            <div className="h-full w-full bg-gradient-to-t from-slate-900/50 to-slate-900/0 block absolute top-0 left-0"></div>
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
