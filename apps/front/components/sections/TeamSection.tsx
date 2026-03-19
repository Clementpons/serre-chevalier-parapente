"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TeamSection({
  title,
  centerTitle,
  addBlueLine,
  paragraph1,
  paragraph2,
}: {
  title: string;
  centerTitle?: boolean;
  addBlueLine?: boolean;
  paragraph1?: string;
  paragraph2?: string;
}) {
  return (
    <section className="mx-4 my-24 lg:mx-36 xl:mx-48 lg:my-48" id="team">
      <div className={cn(centerTitle && "flex flex-col items-center")}>
        <h2
          className={cn(
            "font-bold text-2xl text-slate-800",
            !centerTitle && addBlueLine && "border-l-4 border-blue-500 pl-4",
            centerTitle && "text-center"
          )}
        >
          {title}
        </h2>
        {centerTitle && addBlueLine && (
          <div className="mt-2 h-1 w-12 bg-blue-500 rounded" />
        )}
        {paragraph1 && <p className="text-slate-800 mt-4">{paragraph1}</p>}
        {paragraph2 && <p className="text-slate-800 mt-4">{paragraph2}</p>}
      </div>
      <div className="space-y-8 lg:space-y-0 md:grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-3 xl:gap-16 gap-8 pt-12 md:pt-24">
        <div>
          <div className="items-center">
            <Image
              src="/team/clement.webp"
              alt="Photo de Clément, moniteur de parapente à Serre Chevalier"
              width={214}
              height={214}
              className="block w-36 h-36 rounded-lg mb-4"
            />
            <div>
              <p className="font-bold text-slate-900 text-xl">Clément Pons</p>
              <p>
                Fondateur de l &apos;école - Moniteur - 16 ans d&apos;expérience
              </p>
            </div>
          </div>
          <p className="mt-4">
            Originaire de Briançon, il arpente ces montagnes depuis l’enfance !
            Calme et réfléchi, Clément adore partager la magie du vol en toute
            sécurité avec sa grande pédagogie.
          </p>
          <Dialog>
            <DialogTrigger asChild className="cursor-pointer mt-2">
              <Button variant={"ghost"}>
                <ChevronRightIcon size={16} className="mr-2" />
                Diplôme DEJEPS
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] xl:max-w-[750px] 3xl:max-w-[1000px] 2xl:p-16">
              <DialogHeader>
                <p className="text-slate-900 text-xl font-bold text-left">
                  Clément Pons
                </p>
              </DialogHeader>
              <DialogDescription className="text-sm xl:text-lg 3xl:text-xl text-slate-600">
                <Image
                  src={"/team/diplomes/dejeps-clem.webp"}
                  width={2337}
                  height={1656}
                  alt="Diplôme DEJEPS de Clément moniteur de parapente à Serre Chevalier"
                  className="w-full max-w-[600px]"
                />
                <p className="mt-2">
                  Diplôme d&apos;État de la Jeunesse, de l&apos;Éducation
                </p>
              </DialogDescription>
            </DialogContent>
          </Dialog>
        </div>
        <div>
          <div className="items-center">
            <Image
              src="/team/didier.webp"
              alt="Photo de Didier, moniteur de parapente à Serre Chevalier"
              width={214}
              height={214}
              className="block w-36 h-36 rounded-lg mb-4"
            />
            <div>
              <p className="font-bold text-slate-900 text-xl">Didier Ageron</p>
              <p>Moniteur - Championnat du monde 1998 de Parapente</p>
            </div>
          </div>
          <p className="mt-4">
            Vénérable aventurier des montagnes, des mers et des airs, Didier
            vous guidera dans votre progression avec toute son expertise, sa
            passion, et sa gentillesse !
          </p>
          <Dialog>
            <DialogTrigger asChild className="cursor-pointer mt-2">
              <Button variant={"ghost"}>
                <ChevronRightIcon size={16} className="mr-2" />
                Carte professionelle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] xl:max-w-[750px] 3xl:max-w-[1000px] 2xl:p-16">
              <DialogHeader>
                <p className="text-slate-900 text-xl font-bold text-left">
                  Didier Ageron
                </p>
              </DialogHeader>
              <DialogDescription className="text-sm xl:text-lg 3xl:text-xl text-slate-600">
                <Image
                  src={"/team/diplomes/cartepro-didier.webp"}
                  width={1728}
                  height={1080}
                  alt="Carte professionelle de Didier moniteur de parapente à Serre Chevalier"
                  className="w-full max-w-[400px]"
                />
                <p className="mt-2">
                  Carte professionelle de moniteur de Parapente
                </p>
              </DialogDescription>
            </DialogContent>
          </Dialog>
        </div>
        <div>
          <div className="items-center">
            <Image
              src="/team/romain.webp"
              alt="Photo de Armand, moniteur de parapente à Serre Chevalier"
              width={214}
              height={214}
              className="block w-36 h-36 rounded-lg mb-4"
            />
            <div>
              <p className="font-bold text-slate-900 text-xl">Romain Bernard</p>
              <p>Moniteur - Compétiteur de haut vol</p>
            </div>
          </div>
          <p className="mt-4">
            Passionné de grandes compétitions internationales, pour Romain le
            vol est une seconde nature ! De l&apos;avion au planeur, de
            l&apos;ULM au parapente, ses dix années d&apos;expérience sont ici
            dédiées à votre plaisir et votre sécurité !
          </p>
          <Dialog>
            <DialogTrigger asChild className="cursor-pointer mt-2">
              <Button variant={"ghost"}>
                <ChevronRightIcon size={16} className="mr-2" />
                Carte professionelle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] xl:max-w-[750px] 3xl:max-w-[1000px] 2xl:p-16">
              <DialogHeader>
                <p className="text-slate-900 text-xl font-bold text-left">
                  Romain Bernard
                </p>
              </DialogHeader>
              <DialogDescription className="text-sm xl:text-lg 3xl:text-xl text-slate-600">
                <Image
                  src={"/team/diplomes/cartepro-romain.webp"}
                  width={2337}
                  height={1656}
                  alt="Diplôme DEJEPS de Clément moniteur de parapente à Serre Chevalier"
                  className="w-full max-w-[600px]"
                />
                <p className="mt-2">
                  Carte professionelle de moniteur de Parapente
                </p>
              </DialogDescription>
            </DialogContent>
          </Dialog>
        </div>
        <div>
          <div className="items-center">
            <Image
              src="/team/manon.webp"
              alt="Photo de Armand, moniteur de parapente à Serre Chevalier"
              width={214}
              height={214}
              className="block w-36 h-36 rounded-lg mb-4"
            />
            <div>
              <p className="font-bold text-slate-900 text-xl">Manon Schwertz</p>
              <p>Pilote émérite de navette et secrétaire de l’école</p>
            </div>
          </div>
          <p className="mt-4">
            Grande passionnée de montagne et toujours disponible pour les
            stagiaires ! Manon forge son expérience dans le milieu du parapente
            avec pour objectif de devenir monitrice.
          </p>
          {/* <Dialog>
            <DialogTrigger asChild className="cursor-pointer mt-2">
              <Button variant={"ghost"}>
                <ChevronRightIcon size={16} className="mr-2" />
                Attestation EPMSP
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] xl:max-w-[750px] 3xl:max-w-[1000px] 2xl:p-16">
              <DialogHeader>
                <p className="text-slate-900 text-xl font-bold text-left">
                  Armand Pratter
                </p>
              </DialogHeader>
              <DialogDescription className="text-sm xl:text-lg 3xl:text-xl text-slate-600">
                <Image
                  src={"/team/diplomes/epmsp-armand.webp"}
                  width={2337}
                  height={1656}
                  alt="Diplôme DEJEPS de Clément moniteur de parapente à Serre Chevalier"
                  className="w-full max-w-[600px]"
                />
                <p className="mt-2">
                  Attestation d'Épreuve de Mise en Situation Professionnelle
                </p>
              </DialogDescription>
            </DialogContent>
          </Dialog> */}
        </div>
        <div>
          <div className="items-center">
            <Image
              src="/team/armand.webp"
              alt="Photo de Armand, moniteur de parapente à Serre Chevalier"
              width={214}
              height={214}
              className="block w-36 h-36 rounded-lg mb-4"
            />
            <div>
              <p className="font-bold text-slate-900 text-xl">Armand Pratter</p>
              <p>Élève Moniteur</p>
            </div>
          </div>
          <p className="mt-4">
            Adepte surmotivé de parapente et de sports de montagne, comptez sur
            Armand pour vous partager ses astuces d’apprentissage et les
            ressentis concrets sur le terrain !
          </p>
          <Dialog>
            <DialogTrigger asChild className="cursor-pointer mt-2">
              <Button variant={"ghost"}>
                <ChevronRightIcon size={16} className="mr-2" />
                Attestation EPMSP
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] xl:max-w-[750px] 3xl:max-w-[1000px] 2xl:p-16">
              <DialogHeader>
                <p className="text-slate-900 text-xl font-bold text-left">
                  Armand Pratter
                </p>
              </DialogHeader>
              <DialogDescription className="text-sm xl:text-lg 3xl:text-xl text-slate-600">
                <Image
                  src={"/team/diplomes/epmsp-armand.webp"}
                  width={2337}
                  height={1656}
                  alt="Diplôme DEJEPS de Clément moniteur de parapente à Serre Chevalier"
                  className="w-full max-w-[600px]"
                />
                <p className="mt-2">
                  Attestation d&apos;Épreuve de Mise en Situation
                  Professionnelle
                </p>
              </DialogDescription>
            </DialogContent>
          </Dialog>
        </div>
        <div>
          <div className="items-center">
            <div className="block w-36 h-36 rounded-lg mb-4 overflow-hidden">

            <Image
              src="/team/benoit.jpeg"
              alt="Photo de Benoît, moniteur de parapente à Serre Chevalier"
              width={214}
              height={214}
              className="object-cover object-center -translate-y-8"
            />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xl">Benoît Puech</p>
              <p>Élève Moniteur</p>
            </div>
          </div>
          <p className="mt-4">
            Élève moniteur passionné de vol et de sensations fortes, ancien
            militaire reconverti dans la poésie du ciel, il met son expérience
            et son énergie au service de vos plus beaux moments en parapente.
          </p>
          {/* <Dialog>
            <DialogTrigger asChild className="cursor-pointer mt-2">
              <Button variant={"ghost"}>
                <ChevronRightIcon size={16} className="mr-2" />
                Attestation EPMSP
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] xl:max-w-[750px] 3xl:max-w-[1000px] 2xl:p-16">
              <DialogHeader>
                <p className="text-slate-900 text-xl font-bold text-left">
                  Armand Pratter
                </p>
              </DialogHeader>
              <DialogDescription className="text-sm xl:text-lg 3xl:text-xl text-slate-600">
                <Image
                  src={"/team/diplomes/epmsp-armand.webp"}
                  width={2337}
                  height={1656}
                  alt="Diplôme DEJEPS de Clément moniteur de parapente à Serre Chevalier"
                  className="w-full max-w-[600px]"
                />
                <p className="mt-2">
                  Attestation d&apos;Épreuve de Mise en Situation
                  Professionnelle
                </p>
              </DialogDescription>
            </DialogContent>
          </Dialog> */}
        </div>
        <div>
          <div className="items-center">
            <div className="block w-36 h-36 rounded-lg mb-4 overflow-hidden">

            <Image
              src="/team/vincent.jpeg"
              alt="Photo de Benoît, moniteur de parapente à Serre Chevalier"
              width={214}
              height={214}
              className="object-cover object-center -translate-y-8"
            />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xl">Vincent Giorgetti</p>
              <p>Moniteur</p>
            </div>
          </div>
          <p className="mt-4">
            Passionné par le parapente et les sports de montagne depuis plus de 10 ans, je me découvre une véritable passion pour l&apos;enseignement. Apprendre aux élèves à voler, quelle activité incroyable. Des premiers vols aux premiers thermiques, j&apos;aime suivre la progression de chacun et ma pédagogie est adaptée à chaque personnalité et sensibilité, en français et en anglais.
Pour moi le vol plaisir passe avant tout par la sécurité.
          </p>
          {/* <Dialog>
            <DialogTrigger asChild className="cursor-pointer mt-2">
              <Button variant={"ghost"}>
                <ChevronRightIcon size={16} className="mr-2" />
                Attestation EPMSP
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] xl:max-w-[750px] 3xl:max-w-[1000px] 2xl:p-16">
              <DialogHeader>
                <p className="text-slate-900 text-xl font-bold text-left">
                  Armand Pratter
                </p>
              </DialogHeader>
              <DialogDescription className="text-sm xl:text-lg 3xl:text-xl text-slate-600">
                <Image
                  src={"/team/diplomes/epmsp-armand.webp"}
                  width={2337}
                  height={1656}
                  alt="Diplôme DEJEPS de Clément moniteur de parapente à Serre Chevalier"
                  className="w-full max-w-[600px]"
                />
                <p className="mt-2">
                  Attestation d&apos;Épreuve de Mise en Situation
                  Professionnelle
                </p>
              </DialogDescription>
            </DialogContent>
          </Dialog> */}
        </div>
      </div>
    </section>
  );
}
