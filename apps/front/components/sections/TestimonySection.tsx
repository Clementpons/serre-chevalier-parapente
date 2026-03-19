"use client";
import React, { useRef } from "react";
import Image from "next/image";

/**
 * Related to the React Slick
 */
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

/**
 * Related to the React Icons
 */
import { FaQuoteLeft, FaQuoteRight } from "react-icons/fa";
import {
  MdOutlineArrowBackIos,
  MdOutlineArrowForwardIos,
} from "react-icons/md";
import { StarFilledIcon } from "@radix-ui/react-icons";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

const testimonials = [
  {
    name: "Paul C.",
    title: "Autonome en 10 jours, je recommande fortement !",
    content:
      "Stage autonomie - aucune expérience préalable : grâce à la pédagogie au top et l'équipe qui ne compte pas ses heures (c'est intense !) mon pote et moi avons bien atteint l'autonomie au bout des 10 jours. Avoir plusieurs sites de vol et pentes école à portée de main est un vrai plus pour la progression. Le sentiment de sécurité est omniprésent et rassurant.",
    type: "video",
    link_media: "/placeholder/testimonies/paul.webm",
    link_avis: "",
  },
  {
    name: "Clémentine",
    title: "Je recommande l'école Serre Chevalier Parapente !",
    content:
      "Une expérience hors du commun avec Didier et Clément de supers moniteurs. Des sensations incroyables !!! Je recommande :)",
    type: "image",
    link_media: "/placeholder/testimonies/clementine.png",
    link_avis: "https://maps.app.goo.gl/K5kZP49GNN3xp9Ue8",
  },
  {
    name: "Yohann Metral",
    title:
      "Une expérience de parapente inoubliable à l'école Serre Chevalier Parapente",
    content:
      "Avec deux amis, nous avons participé à un stage de perfectionnement à l’école Serre Chevalier Parapente, dirigée par Clément. Cette expérience exceptionnelle et l’encadrement impeccable méritent largement une note de 5 étoiles.",
    type: "image",
    link_media: "/placeholder/testimonies/yohann-metral.webp",
    link_avis: "https://maps.app.goo.gl/HbHTyH9Hzx9ZQMjL7",
  },
  {
    name: "Tarak Gara",
    title: "Une expérience que je recommande !",
    content:
      "Clement à été très professionnel et a l'écoute , il a pu nous faire découvrir cette superbe discipline. Je le recommande sans hésiter.",
    type: "image",
    link_media: "/placeholder/testimonies/tarak-gara.png",
    link_avis: "https://maps.app.goo.gl/1rDLPULL73XTYMyH6",
  },
];

export default function Testimonial() {
  const sliderRef = useRef<any>();
  /**
   * Settings Related to the React Slick
   */
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  return (
    <>
      <h2 className="text-center text-2xl font-bold sm:text-3xl pb-8 px-4 text-balance">
        Ils en parlent mieux que nous
      </h2>
      <section className="md:max-w-[80vw] mx-auto w-full rounded-xl relative overflow-hidden">
        {/* Main Section */}
        <Slider {...settings} ref={sliderRef}>
          {testimonials.map((single: any, index: any) => {
            return (
              <div key={index} className="">
                <section className="p-5 sm:p-12 md:flex items-center gap-5 md:gap-8 overflow-hidden w-full">
                  {/* Left Section */}
                  <div className="md:w-[40%] mb-8 md:m-0">
                    <div className="w-full h-[40vh]">
                      {single.type === "video" ? (
                        <video
                          width={1920}
                          height={1080}
                          preload="metadata"
                          autoPlay={false}
                          loop={true}
                          controls={true}
                          muted
                          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale rounded-lg">
                          <source src={single.link_media} type="video/webm" />
                          <Image
                            src="/placeholder/hero.webp"
                            alt="Vol en parapente au dessus de la Valée de Serre Chevalier Briançon"
                            width={1920}
                            height={1080}
                            className="absolute top-0 left-0 w-full h-full object-cover"
                          />
                        </video>
                      ) : (
                        <Image
                          src={single.link_media}
                          alt={`Avis de ${single.name} pour le stage de parapente à Serre Chevalier Briançon`}
                          width={1920}
                          height={1080}
                          className="w-full h-full object-cover dark:brightness-[0.2] dark:grayscale rounded-lg"
                        />
                      )}
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="space-y-3 md:w-1/2 px-6 md:px-0">
                    {/* Testimonial */}
                    <div className="flex items-center gap-2">
                      <StarFilledIcon
                        width={20}
                        height={20}
                        className="text-yellow-400"
                      />
                      <StarFilledIcon
                        width={20}
                        height={20}
                        className="text-yellow-400"
                      />
                      <StarFilledIcon
                        width={20}
                        height={20}
                        className="text-yellow-400"
                      />
                      <StarFilledIcon
                        width={20}
                        height={20}
                        className="text-yellow-400"
                      />
                      <StarFilledIcon
                        width={20}
                        height={20}
                        className="text-yellow-400"
                      />
                    </div>
                    <p className="font-bold w-3/4 text-xl">{single.title}</p>
                    <div className="text-blue-700">
                      <FaQuoteLeft />
                    </div>
                    <p className="leading-[30px]">{single.content}</p>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900">
                        {single.name}
                      </p>
                      <div className="text-blue-700">
                        <FaQuoteRight className="ml-auto" />
                      </div>
                    </div>
                    {single.link_avis ? (
                      <Link
                        href={single.link_avis}
                        target="_blank"
                        className="flex items-center hover:underline">
                        <p className="font-semibold text-slate-900 text-xs">
                          Voir l&apos;avis sur Google
                        </p>
                        <ExternalLink className="inline ml-2 w-3 text-slate-900" />
                      </Link>
                    ) : null}
                  </div>
                </section>
              </div>
            );
          })}
        </Slider>

        {/* Custom Buttons */}
        <button
          className="absolute top-[50%] left-[10px] z-10 text-2xl text-gray-600"
          onClick={() => sliderRef?.current?.slickPrev()}
          title="Précédent">
          <MdOutlineArrowBackIos />
        </button>
        <button
          className="absolute top-[50%] right-[10px] z-10 text-2xl text-gray-600"
          onClick={() => sliderRef?.current?.slickNext()}
          title="Suivant">
          <MdOutlineArrowForwardIos />
        </button>
      </section>
    </>
  );
}
