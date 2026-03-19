"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

export default function Slider({ slides, autoPlayInterval = 6000 }) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const buttons = document.querySelectorAll("[data-carousel-button]");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        console.log("test");
        const offset = button.dataset.carouselButton === "next" ? 1 : -1;
        const slidesContainer = button
          .closest("[data-carousel]")
          ?.querySelector("[data-slides]");

        if (slidesContainer) {
          const activeSlide = slidesContainer.querySelector("[data-active]");
          let newIndex =
            [...slidesContainer.children].indexOf(activeSlide) + offset;
          if (newIndex < 0) {
            newIndex = slidesContainer.children.length - 1;
          }
          if (newIndex >= slidesContainer.children.length) {
            newIndex = 0;
          }

          slidesContainer.children[newIndex].setAttribute(
            "data-active",
            "true"
          );
          setActiveSlide(newIndex);
          activeSlide.removeAttribute("data-active");
        }
        resetAutoPlay();
      });
    });

    const resetAutoPlay = () => {
      clearInterval(autoPlayRef.current);
      startAutoPlay();
    };

    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(() => {
        setActiveSlide((prevSlide) => {
          const newIndex = (prevSlide + 1) % slides.length;
          return newIndex;
        });
      }, autoPlayInterval);
    };

    startAutoPlay();

    return () => clearInterval(autoPlayRef.current);
  }, [autoPlayInterval, slides.length]);

  useEffect(() => {
    const slidesContainer = document.querySelector("[data-slides]");
    if (slidesContainer) {
      const activeSlideElement = slidesContainer.children[activeSlide];
      [...slidesContainer.children].forEach((slide) => {
        slide.removeAttribute("data-active");
      });
      activeSlideElement.setAttribute("data-active", "true");
    }
  }, [activeSlide]);

  const autoPlayRef = useRef(null);

  return (
    <div className="w-full h-full">
      <div
        data-carousel
        className={`h-full w-full relative m-0 p-0 list-none rounded-lg overflow-hidden`}
      >
        <div className="absolute top-4 px-6 w-full flex justify-between z-20">
          <div className="flex items-center gap-2">
            {slides.map((item) => (
              <div
                className={`w-[.4rem] h-[.4rem] rounded-full transition-all duration-500 ${
                  item.id - 1 === activeSlide ? "bg-slate-900" : "bg-slate-300"
                }`}
                key={item.id}
              ></div>
            ))}
          </div>
          <div className="flex">
            <button
              data-carousel-button="next"
              className="cursor-pointer p-2"
            >
              <ChevronLeftIcon size={24} className="text-slate-900 h-4" />
            </button>
            <button
              data-carousel-button="prev"
              className="cursor-pointer p-2"
            >
              <ChevronRightIcon size={24} className="text-slate-900 h-4" />
            </button>
          </div>
        </div>
        <ul data-slides>
          {slides.map((item, index) => (
            <li
              className="slide"
              key={item.id}
              {...(index === 0 ? { "data-active": true } : {})}
            >
              <Image
                src={item.image}
                alt={`serreche-parapente-wallpaper${item.id}`}
                width={1920}
                height={1080}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
