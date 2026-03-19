import Image from "next/image";
import React from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";

export default function SliderAuthPage() {
  const [sliderRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
    },
    [
      (slider) => {
        let timeout: ReturnType<typeof setTimeout>;
        let mouseOver = false;
        function clearNextTimeout() {
          clearTimeout(timeout);
        }
        function nextTimeout() {
          clearTimeout(timeout);
          if (mouseOver) return;
          timeout = setTimeout(() => {
            slider.next();
          }, 6000);
        }
        slider.on("created", () => {
          slider.container.addEventListener("mouseover", () => {
            mouseOver = true;
            clearNextTimeout();
          });
          slider.container.addEventListener("mouseout", () => {
            mouseOver = false;
            nextTimeout();
          });
          nextTimeout();
        });
        slider.on("dragStarted", clearNextTimeout);
        slider.on("animationEnded", nextTimeout);
        slider.on("updated", nextTimeout);
      },
    ]
  );
  const testimony = [
    {
      id: 1,
      description:
        '"Expérience inoubliable de parapente à Serre-Chevalier avec Clément. Moniteur expert, paysages époustouflants. Je recommande vivement!"',
      name: "Marc, 32 ans, Paris",
      image: "/placeholder/serreche-parapente-wallpaper1.jpg",
    },
    {
      id: 2,
      description:
        '"Fantastique stage de parapente avec Clément! Vues à couper le souffle. Merci!"',
      name: "Sophie, 28 ans, Lyon",
      image: "/placeholder/serreche-parapente-wallpaper2.jpg",
    },
    {
      id: 3,
      description:
        '"Inoubliable expérience de parapente. Clément est un pro. À refaire!"',
      name: "Pierre, 30 ans, Toulouse",
      image: "/placeholder/serreche-parapente-wallpaper3.jpg",
    },
  ];

  return (
    <div
      ref={sliderRef}
      className="keen-slider h-full w-full rounded-lg overflow-hidden">
      {testimony.map((item) => (
        <div key={item.id} className="keen-slider__slide relative h-full">
          <div className="absolute bottom-10 left-10 z-20">
            <p className="text-slate-50 text-xl pr-10">{item.description}</p>
            <p className="text-slate-50 pr-10 mt-2">{item.name}</p>
          </div>
          <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-t from-slate-950/60 z-10"></div>
          <Image
            src={item.image}
            alt=""
            width="1920"
            height="1080"
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      ))}
    </div>
  );
}
