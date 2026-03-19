import BlogRelativeArticles from "@/components/blog/blog-relative-article";
import FAQBiPlacesSection from "@/components/sections/FAQ_BiPlaces_Section";
import TeamSection from "@/components/sections/TeamSection";
import Testimonial from "@/components/sections/TestimonySection";
import TimelineSection from "@/components/sections/TimelineSection";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronRightIcon,
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReserveButton } from "@/components/booking/ReserveButton";
import { MinPriceDisplay } from "@/components/price/MinPriceDisplay";
import { VideoOptionPriceText } from "@/components/price/VideoOptionPriceText";

export async function generateMetadata() {
  return {
    title: `Baptême de Parapente à Serre Chevalier - Volez en Biplace dans les Alpes`,
    description: `Découvrez nos baptêmes de parapente biplace à Serre Chevalier : vol aventure, durée, longue durée. Expérience inoubliable avec moniteurs diplômés d'État.`,
    alternates: {
      canonical: `https://www.serre-chevalier-parapente.fr/bi-places`,
    },
  };
}

export default function NosStagesPage() {
  return (
    <>
      {/* Hero Header with H1 */}
      <section>
        <div className="bg-slate-900 h-[85svh] overflow-hidden relative flex items-end pb-24 md:pb-16 px-4 lg:px-36 xl:px-48">
          <Image
            src="/baptemes/photo-illustration-bapteme-bi_places.png"
            alt="Vol en parapente au dessus de la Valée de Serre Chevalier Briançon"
            width={1920}
            height={1080}
            className="absolute top-0 left-0 w-full h-full object-cover opacity-50"
          />
          <Image
            src="/logo/serreche.webp"
            alt="Logo de la Vallée de Serre Chevalier Briançon"
            width={676}
            height={572}
            className="absolute bottom-0 right-1/2 md:right-24 translate-x-1/2 md:translate-x-0 w-1/4 sm:w-1/6 lg:w-1/12 object-contain"
          />
          <div className="relative z-20 text-center md:text-left w-full">
            <h1 className="z-10 text-slate-50 font-semibold md:w-1/2 xl:w-2/3 text-xl md:text-3xl lg:text-4xl xl:text-5xl">
              Baptême de Parapente à Serre Chevalier - Volez en Biplace dans les
              Alpes
            </h1>
            <div className="items-center mt-8 justify-center space-y-6 md:justify-start md:flex md:gap-6 md:space-y-0">
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
      </section>
      {/* SECTION PRES */}
      <section className="mx-4 my-24 lg:mx-36 xl:mx-48 lg:my-48 mt-8 lg:mt-16 lg:flex lg:gap-12 lg:items-center">
        <div className="inline-block lg:w-1/2 h-[40vh] xl:h-[50vh] rounded-lg overflow-hidden">
          <Image
            src="/placeholder/bento_sites-vols-granon.webp"
            alt={`Photo d&apos;un vol en parapente à Serre Chevalier`}
            width={1920}
            height={1080}
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
        <div className="mt-8 lg:w-1/2 lg:mt-0">
          <div className="flex flex-col items-start">
            <h2 className="font-bold text-2xl text-slate-800">
              Vivez un vol en parapente dans un cadre exceptionnel
            </h2>
          </div>
          <p className="text-slate-800 mt-4">
            Offrez-vous une parenthèse hors du temps avec un baptême de
            parapente biplace à Serre-Chevalier, guidé par un moniteur diplômé
            d'État. Du vol découverte au vol de durée, chaque envol est pensé
            pour vous faire vivre des sensations inoubliables, en toute
            sécurité.
          </p>
          <p className="text-slate-800 mt-4">
            Dans le décor grandiose du Briançonnais, survolant les vallées du
            Galibier jusqu'aux portes du Parc national des Écrins, laissez-vous
            porter par l'air pur des Alpes. Ici, pas de foule au décollage ni de
            surfréquentation : vous profitez pleinement de votre vol, à votre
            rythme.
          </p>
          <p className="text-slate-800 mt-4">
            Adultes, enfants, aventuriers ou contemplatifs : nos baptêmes
            s'adaptent à toutes les envies. Que ce soit pour vous ou à offrir,
            c'est une expérience vibrante, accessible et profondément humaine.
          </p>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <Link href="#formules" className="inline-block">
              <Button variant="default" size={"lg"} className="gap-2">
                <ChevronRightIcon size={16} />
                Découvrir les formules
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* SECTION FORMULES */}
      <h2
        className={cn(
          "relative",
          "text-center max-w-3/4 font-bold text-4xl text-slate-800",
          "after:content-[''] after:block after:w-16 after:h-1 after:bg-blue-600 after:mx-auto after:mt-4",
        )}
      >
        Nos formules de baptêmes parapente biplace
        <div
          className="absolute w-1 h-1 top-[-200%] left-0"
          id="formules"
        ></div>
      </h2>
      <section className="mx-4 my-24 lg:mx-36 xl:mx-48 lg:my-48 lg:flex lg:flex-row-reverse lg:gap-12 lg:items-center">
        <Link
          href="/reserver/bapteme?category=AVENTURE"
          className="inline-block lg:w-1/2 h-[40vh] xl:h-[50vh] rounded-lg overflow-hidden"
        >
          <Image
            src="/baptemes/bapteme-biplace-aventure.png"
            alt={`Photo d&apos;un vol en parapente à Serre Chevalier`}
            width={1920}
            height={1080}
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </Link>
        <div className="mt-8 lg:w-1/2 lg:mt-0">
          <div className="flex flex-col items-start">
            <Link
              href="/reserver/bapteme?category=AVENTURE"
              className="inline-block hover:underline"
            >
              <h3 className="font-bold text-2xl text-slate-800">
                Baptême Parapente "Aventure"
              </h3>
            </Link>
            <p
              className={cn(
                "text-lg text-slate-800 relative mt-2",
                "after:content-[''] after:absolute after:left-0 after:top-0 after:block after:w-1 after:h-full after:bg-blue-600 pl-4",
              )}
            >
              Vivez votre baptême aérien : liberté, frissons et vue imprenable.
            </p>
          </div>
          <p className="text-slate-800 mt-4">
            Découvrez les premières sensations du vol en parapente durant une
            quinzaine de minutes. Le style du vol est adapté aux envies du
            passager, allant de la balade aérienne au vol acrobatique. Il est
            même possible de prendre les commandes une partie du vol si les
            conditions le permettent.
          </p>
          <div className="flex flex-wrap gap-2">
            <p className="text-slate-500 text-sm bg-slate-200 border border-slate-500 rounded-full inline-block py-1 px-4 mt-4">
              12 à 80 ans
            </p>
            <p className="text-slate-500 text-sm bg-slate-200 border border-slate-500 rounded-full inline-block py-1 px-4 mt-4">
              35 à 95 kg
            </p>
            <p className="text-slate-500 text-sm bg-slate-200 border border-slate-500 rounded-full inline-block py-1 px-4 mt-4">
              15 minutes de vol
            </p>
            <p className="text-slate-500 text-sm bg-slate-200 border border-slate-500 rounded-full inline-block py-1 px-4 mt-4">
              1h20 d'activité à prévoir
            </p>
          </div>
          <div className="mt-4">
            <MinPriceDisplay type="BAPTEME" subType="AVENTURE" />
          </div>
          <VideoOptionPriceText />
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <ReserveButton
              type="bapteme"
              baptemeCategory="AVENTURE"
              className="gap-2"
            />
          </div>
        </div>
      </section>
      <section className="mx-4 my-24 lg:mx-36 xl:mx-48 lg:my-48 lg:flex lg:gap-12 lg:items-center">
        <Link
          href="/reserver/bapteme?category=DUREE"
          className="inline-block lg:w-1/2 h-[40vh] xl:h-[50vh] rounded-lg overflow-hidden"
        >
          <Image
            src="/baptemes/bapteme-biplace-duree.png"
            alt={`Photo d&apos;un vol en parapente à Serre Chevalier`}
            width={1920}
            height={1080}
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </Link>
        <div className="mt-8 lg:w-1/2 lg:mt-0">
          <div className="flex flex-col items-start">
            <Link
              href="/reserver/bapteme?category=DUREE"
              className="inline-block hover:underline"
            >
              <h3 className="font-bold text-2xl text-slate-800">
                Baptême Parapente "Durée"
              </h3>
            </Link>
            <p
              className={cn(
                "text-lg text-slate-800 relative mt-2",
                "after:content-[''] after:absolute after:left-0 after:top-0 after:block after:w-1 after:h-full after:bg-blue-600 pl-4",
              )}
            >
              Plus long, plus haut, plus fort. Adrénaline garantie
            </p>
          </div>
          <p className="text-slate-800 mt-4">
            Pour les personnes au cœur bien accroché ou ayant déjà réalisé un
            vol en parapente. Un vol d'une trentaine de minutes en se laissant
            porter par les vents ascendants pour découvrir la vallée et voir les
            sommets environnants.
          </p>
          <div className="flex flex-wrap gap-2">
            <p className="text-slate-500 text-sm bg-slate-200 border border-slate-500 rounded-full inline-block py-1 px-4 mt-4">
              12 ans et +
            </p>
            <p className="text-slate-500 text-sm bg-slate-200 border border-slate-500 rounded-full inline-block py-1 px-4 mt-4">
              50 à 95 kg
            </p>
            <p className="text-slate-500 text-sm bg-slate-200 border border-slate-500 rounded-full inline-block py-1 px-4 mt-4">
              30 minutes de vol
            </p>
            <p className="text-slate-500 text-sm bg-slate-200 border border-slate-500 rounded-full inline-block py-1 px-4 mt-4">
              Pour un public à l'aise en l'air / fan d'adrénaline
            </p>
          </div>
          <div className="mt-4">
            <MinPriceDisplay type="BAPTEME" subType="DUREE" />
          </div>
          <VideoOptionPriceText />
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <ReserveButton
              type="bapteme"
              baptemeCategory="DUREE"
              className="gap-2"
            />
          </div>
        </div>
      </section>
      <section className="mx-4 my-24 lg:mx-36 xl:mx-48 lg:my-48 lg:flex lg:flex-row-reverse lg:gap-12 lg:items-center">
        <Link
          href="/reserver/bapteme?category=LONGUE_DUREE"
          className="inline-block lg:w-1/2 h-[40vh] xl:h-[50vh] rounded-lg overflow-hidden"
        >
          <Image
            src="/placeholder/section-1_3.webp"
            alt={`Photo d&apos;un vol en parapente à Serre Chevalier`}
            width={1920}
            height={1080}
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </Link>
        <div className="mt-8 lg:w-1/2 lg:mt-0">
          <div className="flex flex-col items-start">
            <Link
              href="/reserver/bapteme?category=LONGUE_DUREE"
              className="inline-block hover:underline"
            >
              <h3 className="font-bold text-2xl text-slate-800">
                Baptême Parapente "Longue Durée"
              </h3>
            </Link>
            <p
              className={cn(
                "text-lg text-slate-800 relative mt-2",
                "after:content-[''] after:absolute after:left-0 after:top-0 after:block after:w-1 after:h-full after:bg-blue-600 pl-4",
              )}
            >
              Plus on reste dans le ciel, plus le plaisir grandit.
            </p>
          </div>
          <p className="text-slate-800 mt-4">
            Pour ceux qui veulent prolonger le plaisir et s'offrir un moment
            suspendu dans les airs. Environ 45 minutes de vol pour explorer plus
            loin, flirter avec les sommets et profiter pleinement des courants
            ascendants. Sensations et panoramas garantis, le tout à votre
            rythme.
          </p>
          <div className="flex flex-wrap gap-2">
            <p className="text-slate-500 text-sm bg-slate-200 border border-slate-500 rounded-full inline-block py-1 px-4 mt-4">
              Adulte 12 et +
            </p>
            <p className="text-slate-500 text-sm bg-slate-200 border border-slate-500 rounded-full inline-block py-1 px-4 mt-4">
              50 à 95 kg
            </p>
            <p className="text-slate-500 text-sm bg-slate-200 border border-slate-500 rounded-full inline-block py-1 px-4 mt-4">
              45 minutes de vol
            </p>
          </div>
          <div className="mt-4">
            <MinPriceDisplay type="BAPTEME" subType="LONGUE_DUREE" />
          </div>
          <VideoOptionPriceText />
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <ReserveButton
              type="bapteme"
              baptemeCategory="LONGUE_DUREE"
              className="gap-2"
            />
          </div>
        </div>
      </section>
      <section className="mx-4 my-24 lg:mx-36 xl:mx-48 lg:my-48 lg:flex lg:gap-12 lg:items-center">
        <Link
          href="/reserver/bapteme?category=ENFANT"
          className="inline-block lg:w-1/2 h-[40vh] xl:h-[50vh] rounded-lg overflow-hidden"
        >
          <Image
            src="/baptemes/bapteme-biplace-ptit-loup.png"
            alt={`Photo d&apos;un vol en parapente à Serre Chevalier`}
            width={1920}
            height={1080}
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </Link>
        <div className="mt-8 lg:w-1/2 lg:mt-0">
          <div className="flex flex-col items-start">
            <Link
              href="/reserver/bapteme?category=ENFANT"
              className="inline-block hover:underline"
            >
              <h3 className="font-bold text-2xl text-slate-800">
                Baptême Parapente "Enfant"
              </h3>
            </Link>
            <p
              className={cn(
                "text-lg text-slate-800 relative mt-2",
                "after:content-[''] after:absolute after:left-0 after:top-0 after:block after:w-1 after:h-full after:bg-blue-600 pl-4",
              )}
            >
              Pour les p'tits loups dans l'aventure et la montagne
            </p>
          </div>
          <p className="text-slate-800 mt-4">
            Un vol ludique en air calme, au petit matin, d'une dizaine de
            minutes. Parfaitement adapté aux enfants, leur permettant de
            s'immerger dans le monde aérien. Selon leur confiance, ils peuvent
            prendre les commandes durant une partie du vol.
          </p>
          <div className="flex flex-wrap gap-2">
            <p className="text-slate-500 text-sm bg-slate-200 border border-slate-500 rounded-full inline-block py-1 px-4 mt-4">
              6 à 12 ans
            </p>
            <p className="text-slate-500 text-sm bg-slate-200 border border-slate-500 rounded-full inline-block py-1 px-4 mt-4">
              20 à 55 kg
            </p>
            <p className="text-slate-500 text-sm bg-slate-200 border border-slate-500 rounded-full inline-block py-1 px-4 mt-4">
              10 minutes de vol
            </p>
          </div>
          <div className="mt-4">
            <MinPriceDisplay type="BAPTEME" subType="ENFANT" />
          </div>
          <VideoOptionPriceText />
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <ReserveButton
              type="bapteme"
              baptemeCategory="ENFANT"
              className="gap-2"
            />
          </div>
        </div>
      </section>
      <section className="mx-4 my-24 lg:mx-36 xl:mx-48 lg:my-48 lg:flex lg:flex-row-reverse lg:gap-12 lg:items-center">
        <Link
          href="/reserver/bapteme?category=HIVER"
          className="inline-block lg:w-1/2 h-[40vh] xl:h-[50vh] rounded-lg overflow-hidden"
        >
          <Image
            src="/baptemes/bapteme-biplace-hiver.JPG"
            alt={`Photo d&apos;un vol en parapente à Serre Chevalier`}
            width={1920}
            height={1080}
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </Link>
        <div className="mt-8 lg:w-1/2 lg:mt-0">
          <div className="flex flex-col items-start">
            <Link
              href="/reserver/bapteme?category=HIVER"
              className="inline-block hover:underline"
            >
              <h3 className="font-bold text-2xl text-slate-800">
                Baptême Parapente "Hiver"
              </h3>
            </Link>
            <p
              className={cn(
                "text-lg text-slate-800 relative mt-2",
                "after:content-[''] after:absolute after:left-0 after:top-0 after:block after:w-1 after:h-full after:bg-blue-600 pl-4",
              )}
            >
              Les sommets enneigés à perte de vue, en toute liberté.
            </p>
          </div>
          <p className="text-slate-800 mt-4">
            Un vol en parapente pour découvrir le domaine skiable vu du ciel.
            Avec plus de 1000m de dénivelé vous aurez tout le loisir d'admirer
            les sommets enneigés.
          </p>
          <div className="flex flex-wrap gap-2">
            <p className="text-slate-500 text-sm bg-slate-200 border border-slate-500 rounded-full inline-block py-1 px-4 mt-4">
              12 ans et +
            </p>
            <p className="text-slate-500 text-sm bg-slate-200 border border-slate-500 rounded-full inline-block py-1 px-4 mt-4">
              25 à 95 kg
            </p>
            <p className="text-slate-500 text-sm bg-slate-200 border border-slate-500 rounded-full inline-block py-1 px-4 mt-4">
              Durée : Le temps d'un dénivelé de 1000m
            </p>
          </div>
          <div className="mt-4">
            <MinPriceDisplay type="BAPTEME" subType="HIVER" />
          </div>
          <VideoOptionPriceText />
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <ReserveButton
              type="bapteme"
              baptemeCategory="HIVER"
              className="gap-2"
            />
          </div>
        </div>
      </section>
      {/* SECTION BON D'ACHATS */}
      <h2
        className={cn(
          "text-center max-w-3/4 font-bold text-4xl text-slate-800",
          "after:content-[''] after:block after:w-16 after:h-1 after:bg-blue-600 after:mx-auto after:mt-4",
        )}
      >
        Offrez un bon cadeau, faites rêver un proche
      </h2>
      <section className="mx-4 my-24 lg:mx-36 xl:mx-48 lg:my-48 lg:flex lg:gap-12 lg:items-center">
        <Link
          href="#"
          className="inline-block lg:w-1/2 h-[40vh] xl:h-[50vh] rounded-lg overflow-hidden"
        >
          <Image
            src="/baptemes/bapteme-placeholder.png"
            alt={`Photo d&apos;un vol en parapente à Serre Chevalier`}
            width={1920}
            height={1080}
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </Link>
        <div className="mt-8 lg:w-1/2 lg:mt-0">
          <h3 className="font-bold text-2xl text-slate-800">
            Offrir un Baptême en Parapente, c'est offrir un souvenir
            inoubliable.
          </h3>
          <p className="text-slate-800 mt-4">
            Anniversaire, Noël, mariage, EVG / EVJF, ou le pur plaisir d'offrir…
            quelle que soit l'occasion, offrir un baptême parapente biplace à
            Serre-Chevalier, c'est offrir un moment d'exception, suspendu entre
            ciel et montagnes. Une expérience forte en émotions, qui reste
            gravée à vie.
          </p>
          <h3 className="font-bold text-2xl text-slate-800 mt-6">
            Comment ça fonctionne ?
          </h3>
          <p className="text-slate-800 mt-4">
            Vous choisissez le vol que vous souhaitez offrir (aventure, durée ou
            hiver) et validez votre achat en ligne en réglant la prestation.
            Vous recevez ensuite un lien ou un code de réservation à transmettre
            au bénéficiaire, qui pourra réserver librement le créneau de son
            choix parmi les disponibilités proposées.
          </p>
          <div className="flex flex-wrap gap-2">
            <p className="text-slate-500 text-sm bg-slate-200 border border-slate-500 rounded-full inline-block py-1 px-4 mt-4">
              Bon valable 12 mois à compter de la date d'achat
            </p>
            <p className="text-slate-500 text-sm bg-slate-200 border border-slate-500 rounded-full inline-block py-1 px-4 mt-4">
              Non remboursable, non annulable
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <Link href="/reserver/bon-cadeau" className="inline-block">
              <Button variant="default" size={"lg"} className="gap-2">
                <ChevronRightIcon size={16} />
                J'offre un bon cadeau baptême
              </Button>
            </Link>
          </div>
        </div>
      </section>
      {/* SECTION DÉROULEMENT */}
      <h2
        className={cn(
          "text-center max-w-3/4 font-bold text-4xl text-slate-800",
          "after:content-[''] after:block after:w-16 after:h-1 after:bg-blue-600 after:mx-auto after:mt-4",
        )}
      >
        Comment se déroule votre baptême bi-place en parapente ?
      </h2>
      <TimelineSection />
      {/* SECTION POURQUOI NOUS ? */}
      <h2
        className={cn(
          "text-center max-w-3/4 font-bold text-4xl text-slate-800",
          "after:content-[''] after:block after:w-16 after:h-1 after:bg-blue-600 after:mx-auto after:mt-4",
        )}
      >
        Pourquoi choisir Serre Chevalier Parapente pour un baptême bi-place ?
      </h2>
      <section className="mx-4 my-24 lg:mx-36 xl:mx-48 lg:my-48 lg:flex lg:flex-row-reverse lg:gap-12 lg:items-center">
        <div className="inline-block lg:w-1/2 h-[40vh] xl:h-[50vh] rounded-lg overflow-hidden">
          <Image
            src="/baptemes/bapteme-placeholder.png"
            alt={`Photo d&apos;un vol en parapente à Serre Chevalier`}
            width={1920}
            height={1080}
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
        <div className="mt-8 lg:w-1/2 lg:mt-0">
          <p className="text-slate-800 mt-4">
            Faire un vol biplace avec Serre Chevalier Parapente, c’est choisir
            bien plus qu’un simple baptême en parapente. C’est voler en toute
            confiance avec des moniteurs diplômés, sérieux et engagés sur la
            sécurité, tout en profitant d’une ambiance détendue, souriante et
            bienveillante.
          </p>
          <p className="text-slate-800 mt-4">
            Chaque vol est adapté aux envies, au niveau et aux éventuelles
            appréhensions du passager. Que vous recherchiez des sensations
            fortes ou un moment tout en douceur, nous prenons le temps de vous
            écouter pour que l’expérience soit aussi agréable que mémorable.
          </p>
          <p className="text-slate-800 mt-4">
            Notre objectif : vous faire vivre un moment exceptionnel, dans les
            meilleures conditions possibles, en toute sérénité.
          </p>
        </div>
      </section>
      <TeamSection
        title="Une équipe de moniteurs bi-place diplômés et passionnés"
        paragraph1="Chez Serre Chevalier Parapente, le vol biplace est bien plus qu’une prestation : c’est un moment de partage. Nos moniteurs ne sont pas seulement diplômés et expérimentés, ce sont surtout des passionnés qui aiment transmettre leur amour du vol et de la montagne."
        paragraph2="À chaque décollage, ils embarquent avec vous leur enthousiasme, leur savoir-faire et leur plaisir d’échanger. Vous volez avec des pros... qui restent profondément humains."
        addBlueLine
      />
      <section className="mx-4 my-24 lg:mx-36 xl:mx-48 lg:my-48 lg:flex lg:gap-12 lg:items-center">
        <div className="inline-block lg:w-1/2 h-[40vh] xl:h-[50vh] rounded-lg overflow-hidden">
          <Image
            src="/placeholder/section-1_3.webp"
            alt={`Photo d&apos;un vol en parapente à Serre Chevalier`}
            width={1920}
            height={1080}
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
        <div className="mt-8 lg:w-1/2 lg:mt-0">
          <h3 className="font-bold text-2xl text-slate-800">
            Une expérience en toute sécurité
          </h3>
          <p className="text-slate-800 mt-4">
            Être moniteur de parapente ne s’improvise pas. Avant même d’accéder
            à la formation, il faut justifier d’un haut niveau technique,
            souvent acquis en compétition. Ensuite, un concours rigoureux
            sélectionne les meilleurs profils, sur leurs compétences pratiques,
            théoriques et leur capacité à évaluer le risque.
          </p>
          <p className="text-slate-800 mt-4">
            Le parapente est un sport aérien, et comme dans l’aviation, la
            sécurité repose sur{" "}
            <span className="font-bold">
              la rigueur, l’anticipation et la prise de décision
            </span>
            . Ce cadre strict fait que, malgré son image parfois
            impressionnante, le parapente est l’une des pratiques les plus
            sûres… lorsqu’elle est encadrée par des professionnels qualifiés.
          </p>
          <p className="text-slate-800 mt-4">
            Chez Serre Chevalier Parapente, tous les moniteurs sont certifiés
            FFVL, formés à{" "}
            <span className="font-bold">
              évaluer précisément les conditions de vol
            </span>{" "}
            et à{" "}
            <span className="font-bold">annuler un vol au moindre doute</span>.
            Car pour nous, il n’y a pas de compromis sur la sécurité. Jamais.
          </p>
        </div>
      </section>
      <section className="mx-4 my-24 lg:mx-36 xl:mx-48 lg:my-48 lg:flex lg:flex-row-reverse lg:gap-12 lg:items-center">
        <div className="inline-block lg:w-1/2 h-[40vh] xl:h-[50vh] rounded-lg overflow-hidden">
          <Image
            src="/placeholder/bento_sites-vols-puychalvin.webp"
            alt={`Photo d&apos;un vol en parapente à Serre Chevalier`}
            width={1920}
            height={1080}
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
        <div className="mt-8 lg:w-1/2 lg:mt-0">
          <h3 className="font-bold text-2xl text-slate-800">
            Un cadre exceptionnel dans les Alpes du Sud
          </h3>
          <p className="text-slate-800 mt-4">
            Serre Chevalier Parapente vous emmène survoler l’un des plus beaux
            territoires de vol de France : les Alpes du Sud. Ici, pas de foule
            au décollage, pas de surfréquentation : juste le plaisir de voler
            dans un environnement grandiose et respecté, aux premières loges des
            plus beaux reliefs alpins.
          </p>
          <p className="text-slate-800 mt-4">
            Glaciers, forêts, alpages et sommets de plus de 4000 mètres défilent
            sous vos pieds. Vous survolez les cols mythiques du Tour de France,
            le Galibier, l’Izoard ou le Granon. Profitez selon la saison de
            ciels limpides, de neiges étincelantes ou des couleurs flamboyantes
            de l’automne.
          </p>
          <p className="text-slate-800 mt-4">
            Ici, chaque vol devient un moment suspendu dans un paysage qui parle
            autant aux yeux qu’au cœur.
          </p>
        </div>
      </section>
      <FAQBiPlacesSection />
      <section className="mx-4 my-24 lg:mx-36 xl:mx-48 lg:my-48">
        <Testimonial />
      </section>
      {/* SECTION LOCALISATION & CONTACTS */}
      <h2
        className={cn(
          "text-center max-w-3/4 font-bold text-4xl text-slate-800",
          "after:content-[''] after:block after:w-16 after:h-1 after:bg-blue-600 after:mx-auto after:mt-4",
        )}
      >
        Localisation & Contacts
      </h2>
      <section className="mx-4 my-24 lg:mx-36 xl:mx-48 lg:my-48 lg:flex lg:gap-12 lg:items-center">
        <div className="lg:w-1/2">
          <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
            <h3 className="font-bold text-2xl text-slate-800 mb-6">
              Nos coordonnées
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPinIcon className="w-5 h-5 text-slate-900 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-slate-800">Adresse</p>
                  <p className="text-slate-600">
                    7 Avenue René Froger
                    <br />
                    05100 Briançon
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ClockIcon className="w-5 h-5 text-slate-900 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-slate-800">Horaires</p>
                  <p className="text-slate-600">7J/7 de 8h à 18h</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <PhoneIcon className="w-5 h-5 text-slate-900 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-slate-800">Téléphone</p>
                  <a
                    href="tel:0645913595"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    06 45 91 35 95
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 lg:w-1/2 lg:mt-0">
          <div className="h-[40vh] xl:h-[50vh] rounded-lg overflow-hidden border border-slate-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2876.8!2d6.6407!3d44.8978!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12cd1c8b8b8b8b8b%3A0x8b8b8b8b8b8b8b8b!2s7%20Avenue%20Ren%C3%A9%20Froger%2C%2005100%20Brian%C3%A7on!5e0!3m2!1sfr!2sfr!4v1234567890123"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localisation Serre Chevalier Parapente - 7 Avenue René Froger, 05100 Briançon"
            ></iframe>
          </div>
          <p className="text-sm text-slate-600 mt-2 text-center">
            Briançon - Porte d'entrée du Parc National des Écrins
          </p>
        </div>
      </section>
      <section className="mx-4 my-24 lg:mx-36 xl:mx-48 lg:my-48">
        <p className="mb-8 font-bold text-2xl relative before:content-[''] before:block before:w-1 pl-4 before:h-full before:bg-blue-600 before:absolute before:left-0 before:top-0">
          Nos derniers articles
        </p>
        <BlogRelativeArticles slugToExclude={""} />
      </section>
    </>
  );
}
