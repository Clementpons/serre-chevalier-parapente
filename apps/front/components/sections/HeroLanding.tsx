import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function HeroLanding() {
  return (
    <div className="bg-slate-900 h-[100svh] overflow-hidden relative flex items-end pb-24 md:pb-16 px-6 md:px-12 lg:px-16">
      <Image
        src="/fond-de-site.jpg"
        alt="Vol en parapente au dessus de la Valée de Serre Chevalier Briançon"
        width={1920}
        height={1080}
        className="absolute top-0 left-0 w-full h-full object-cover"
      />

      {/* <video
        width={1920}
        height={1080}
        preload="metadata"
        autoPlay={true}
        loop={true}
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover">
        <source src="/placeholder/home-video.webm" type="video/webm" />
        <Image
          src="/placeholder/hero.webp"
          alt="Vol en parapente au dessus de la Valée de Serre Chevalier Briançon"
          width={1920}
          height={1080}
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
      </video> */}

      <Image
        src="/logo/serreche.webp"
        alt="Logo de la Vallée de Serre Chevalier Briançon"
        width={676}
        height={572}
        className="absolute bottom-0 right-1/2 md:right-24 translate-x-1/2 md:translate-x-0 w-1/4 sm:w-1/6 lg:w-1/12 object-contain"
      />
      <div className="relative z-20 text-center md:text-left w-full">
        <h1 className="z-10 text-slate-50 font-semibold text-lg md:text-2xl lg:text-3xl">
          Voler seul au dessus des montagnes,{" "}
          <span className="block">
            Un rêve d’aventurier devenu si accessible
          </span>
        </h1>
        <div className="items-center mt-4 justify-center space-y-6 md:justify-start md:flex md:gap-6 md:space-y-0">
          <Link href="#pricing" className="inline-block">
            <Button variant={"defaultWhite"} size={"lg"}>
              <ChevronRight className="w-4 h-4 mr-2" />
              J&apos;apprends à voler
            </Button>
          </Link>
          <div className="items-center md:flex md:gap-4">
            <Image
              src={"/logo/logoffvl.webp"}
              alt="École de parapente certifié FFVL à Serre Chevalier Briançon"
              width={40}
              height={40}
              className="mx-auto"
            />
            <p className="text-slate-50 text-sm md:text-base mt-2 md:mt-0">
              École certifiée
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
