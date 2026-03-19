import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

export default function SliderTestimony({
  slides,
  autoPlayInterval = 6000,
  onSlideChange,
}) {
  const [activeSlide, setActiveSlide] = useState(0);
  const autoPlayRef = useRef(null);

  const handleSlideChange = (newIndex) => {
    setActiveSlide(newIndex);
    if (onSlideChange) {
      onSlideChange(newIndex);
    }
  };

  useEffect(() => {
    const resetAutoPlay = () => {
      clearInterval(autoPlayRef.current);
      startAutoPlay();
    };

    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(() => {
        handleSlideChange((prevSlide) => (prevSlide + 1) % slides.length);
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

  return (
    <div className="w-full h-full">
      <div
        data-carousel
        className="h-full w-full relative m-0 p-0 list-none rounded-lg overflow-hidden"
      >
        <div className="absolute top-4 px-6 w-full flex justify-between z-20">
          <div className="flex items-center gap-2">
            {slides.map((item, index) => (
              <div
                className={`w-[.4rem] h-[.4rem] rounded-full transition-all duration-500 ${
                  index === activeSlide ? "bg-slate-900" : "bg-slate-300"
                }`}
                key={item.id}
              ></div>
            ))}
          </div>
          <div className="flex">
            <button
              data-carousel-button="prev"
              className="cursor-pointer p-2"
              onClick={() =>
                handleSlideChange(
                  (activeSlide - 1 + slides.length) % slides.length
                )
              }
            >
              <ChevronLeftIcon size={24} className="text-slate-900 h-4" />
            </button>
            <button
              data-carousel-button="next"
              className="cursor-pointer p-2"
              onClick={() =>
                handleSlideChange((activeSlide + 1) % slides.length)
              }
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
              {...(index === activeSlide ? { "data-active": true } : {})}
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
