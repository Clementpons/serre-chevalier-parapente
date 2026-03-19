"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

export default function ContactSection() {
  return (
    <section className="mx-4 my-24 lg:mx-36 xl:mx-48 lg:my-48" id="contact">
      <Image
        src="/logo/logo-dark-nobg.webp"
        alt="Logo Serre Chevalier Parapente"
        width={214}
        height={214}
        className="block w-24 h-24 mx-auto"
      />
      <p className="font-bold text-2xl text-slate-900 text-center mt-8">
        Vous avez trouvé l’école qui vous correspond, il est temps de voler !
      </p>
      <div className="md:flex md:items-center md:gap-8 mt-8 md:justify-center space-y-4 md:space-y-0">
        <Link
          href={"/"}
          title="Je réserve ma place"
          className="block">
          <Button variant={"default"} size={"lg"} className="w-full lg:w-auto">
            Je réserve ma place
          </Button>
        </Link>
        <Link
          href={"mailto:clementpons5@gmail.com"}
          title="Contacter Serre Chevalier Parapente"
          className="block">
          <Button variant={"outline"} size={"lg"} className="w-full lg:w-auto">
            J&apos;ai une question
          </Button>
        </Link>
      </div>
    </section>
  );
}
