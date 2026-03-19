"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { MailIcon, PhoneCallIcon } from "lucide-react";

export default function ProblemSection() {
  return (
    <section className="mx-4 my-24 lg:mx-36 xl:mx-48 lg:my-48" id="contact">
      <Image
        src="/logo/logo-dark-nobg.webp"
        alt="Logo Serre chevalier Parapente"
        width={214}
        height={214}
        className="block w-24 h-24 mx-auto"
      />
      <p className="font-bold text-2xl text-slate-900 text-center mt-8">
        Vous rencontrez un problème lors de la réservation ?
      </p>
      <p className="text-slate-900 text-center mt-2 md:max-w-[400px] mx-auto">
        Contactez nous sans plus attendre par mail ou téléphone, on
        s&apos;occupera de vous aider !
      </p>
      <div className="md:flex md:items-center md:gap-8 mt-8 md:justify-center space-y-4 md:space-y-0">
        <Link
          href={"mailto:clementpons5@gmail.com"}
          title="Contacter Serre Chevalier Parapente par mail"
          className="block">
          <Button variant={"default"} size={"lg"} className="w-full lg:w-auto">
            <MailIcon size={16} className="mr-2" />
            Je vous contacte par mail
          </Button>
        </Link>
        <Link
          href={"tel:0645913595"}
          title="Contacter Serre Chevalier Parapente par téléphone"
          className="block">
          <Button variant={"outline"} size={"lg"} className="w-full lg:w-auto">
            <PhoneCallIcon size={16} className="mr-2" />
            Appelez-nous !
          </Button>
        </Link>
      </div>
    </section>
  );
}
