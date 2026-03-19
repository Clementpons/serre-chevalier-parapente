import BlogRelativeArticles from "@/components/blog/blog-relative-article";
import TeamSection from "@/components/sections/TeamSection";
import Testimonial from "@/components/sections/TestimonySection";
import SliderPentesEcoles from "@/components/ui-self/sliders/SliderPentesEcoles";
import SliderSitesGrandVols from "@/components/ui-self/sliders/SliderSitesGrandVols";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChevronRightIcon,
  LucideCalendar,
  LucideClock8,
  LucideCloudRainWind,
  LucideDumbbell,
  LucideMedal,
  LucideUsersRound,
} from "lucide-react";
import Image from "next/image";
import CTANosStages from "../cta";
import { StagePriceBadge } from "@/components/price/StagePriceBadge";

export async function generateMetadata() {
  return {
    title: `Stage Parapente Autonomie (10j) – Serre Chevalier / Briançon`,
    description: `Formez-vous à voler seul en toutes conditions avec notre stage autonomie. 10 jours pour atteindre le niveau vert FFVL à Serre Chevalier.`,
    alternates: {
      canonical: `https://www.serre-chevalier-parapente.fr/nos-stages/autonomie`,
    },
  };
}

export default function NosStagesPage() {
  return (
    <>
      {/* CTA de réservation */}
      <CTANosStages type="AUTONOMIE" />
      {/* Hero Header with H1 */}
      <section>
        <div className="bg-slate-900 h-[85svh] overflow-hidden relative flex items-end pb-24 md:pb-16 px-4 lg:px-36 xl:px-48">
          <Image
            src="/placeholder/hero.webp"
            alt="Vol en parapente au dessus de la Valée de Serre Chevalier Briançon"
            width={1920}
            height={1080}
            className="absolute top-0 left-0 w-full h-full object-cover"
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
              Stage de Parapente Autonomie à Serre Chevalier – Devenez pilote
              confirmé
            </h1>
            <div className="flex flex-wrap lg:flex-nowrap justify-center lg:justify-normal gap-4 lg:gap-2 items-center mt-4">
              <p className="text-slate-700 bg-slate-200 border border-slate-500 rounded-full py-1 px-4 inline-flex items-center">
                <LucideCalendar className="size-4 mr-2" />
                10 jours
              </p>
              <p className="text-slate-700 bg-slate-200 border border-slate-500 rounded-full py-1 px-4 inline-flex items-center">
                <LucideClock8 className="size-4 mr-2" />
                8h - 16h
              </p>
              <StagePriceBadge stageType="AUTONOMIE" />
            </div>
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
      {/*  Section infos  */}
      <section className="mx-4 lg:mx-36 xl:mx-48 mt-8 lg:mt-16">
        <div className="flex flex-col lg:flex-row mb-8 gap-4 lg:gap-8">
          <div className="inline-flex lg:flex items-center gap-2 justify-center lg:justify-start bg-slate-100 hover:bg-slate-200 hover:cursor-pointer transition rounded-lg p-3 lg:p-4">
            <LucideUsersRound className="text-slate-900 size-4 lg:size-6" />
            <p className="text-balance text-center text-sm lg:text-normal">
              À partir de 12 ans
            </p>
          </div>
          <div className="inline-flex lg:flex items-center gap-2 justify-center lg:justify-start bg-slate-100 hover:bg-slate-200 hover:cursor-pointer transition rounded-lg p-3 lg:p-4">
            <LucideDumbbell className="text-slate-900 size-4 lg:size-6" />
            <p className="text-balance text-center text-sm lg:text-normal">
              Jusqu&apos;à 105kg
            </p>
          </div>
          <div className="inline-flex lg:flex items-center gap-2 justify-center lg:justify-start bg-slate-100 hover:bg-slate-200 hover:cursor-pointer transition rounded-lg p-3 lg:p-4">
            <LucideClock8 className="text-slate-900 size-4 lg:size-6" />
            <p className="text-balance text-center text-sm lg:text-normal">
              10 jours
            </p>
          </div>
          <div className="inline-flex lg:flex items-center gap-2 justify-center lg:justify-start bg-slate-100 hover:bg-slate-200 hover:cursor-pointer transition rounded-lg p-3 lg:p-4">
            <LucideCloudRainWind className="text-slate-900 size-4 lg:size-6" />
            <p className="text-balance text-center text-sm lg:text-normal">
              Extension / Report en cas de mauvais temps
            </p>
          </div>
          <div className="inline-flex lg:flex items-center gap-2 justify-center lg:justify-start bg-slate-100 hover:bg-slate-200 hover:cursor-pointer transition rounded-lg p-3 lg:p-4">
            <LucideMedal className="text-slate-900 size-4 lg:size-6" />
            <p className="text-balance text-center text-sm lg:text-normal">
              Certificat en fin de stage
            </p>
          </div>
        </div>
        <h2 className="font-bold text-2xl text-slate-800">
          A qui s’adresse ce stage autonomie ?
        </h2>
        <p className="text-slate-800 mt-4">
          Le <strong>Stage Autonomie</strong> de{" "}
          <strong>Serre Chevalier Parapente</strong> s’adresse à{" "}
          <strong>
            ceux qui souhaitent progresser rapidement vers l’autonomie complète
            en parapente
          </strong>
          . Conçu pour les débutants motivés ou les pilotes ayant déjà une
          petite expérience en vol, ce stage intensif permet d&apos;
          <strong>
            enchaîner directement le stage Initiation et le stage Progression
          </strong>
          , pour
          <strong>atteindre un véritable niveau de pilote autonome</strong> en
          seulement 10 jours de pratique.
        </p>
      </section>
      {/* Quel est l’objectif du stage autonomie ? */}
      <section className="mx-4 mt-16 lg:mx-36 xl:mx-48 lg:mt-24">
        <h2 className="font-bold text-2xl text-slate-800">
          Quel est l’objectif du stage autonomie ?
        </h2>
        <p className="text-slate-800 mt-4">
          L’objectif est clair :{" "}
          <strong>vous rendre capable de voler en autonomie sur un site</strong>
          , en maîtrisant toutes les étapes d’un vol, de l’analyse des
          conditions météo au décollage, en passant par la gestion de
          trajectoire et l&apos;atterrissage. À la fin de ce stage, vous aurez
          acquis les{" "}
          <strong>
            compétences de base sur la technique, la compréhension de
            l’aérologie et la capacité de prise de décision pour voler sans
            assistance radio
          </strong>
          .
        </p>
      </section>
      {/* Quel est le programme du stage autonomie ? */}
      <section className="mx-4 mt-16 lg:mx-36 xl:mx-48 lg:mt-24">
        <h2 className="font-bold text-2xl text-slate-800">
          Quel est le programme du stage autonomie ?
        </h2>
        <p className="text-slate-800 mt-4">
          Ce stage intensif se déroule sur 10 jours de pratique répartis sur 14
          jours de disponibilité, pour s’adapter aux meilleures conditions
          météo.
        </p>
        <ul className="mt-4">
          <li className="list-disc list-inside">
            <span className="font-bold">Jour 1 & 2 : </span>Travail au sol en
            pente école pour apprendre à maîtriser la voile, comprendre la
            gestion du vent et les techniques de gonflage.
          </li>
          <li className="list-disc list-inside">
            <span className="font-bold">Jour 3 : </span>Premiers petits vols sur
            des pentes douces pour expérimenter les sensations de décollage et
            d&apos;atterrissage.
          </li>
          <li className="list-disc list-inside">
            <span className="font-bold">Jour 4 & 5 : </span>Grands vols encadrés
            par radio depuis des sites adaptés, avec un accompagnement au décollage et à l&apos;atterissage pour
            affiner votre pilotage en l&apos;air et découvrir les premières
            notions de trajectoire et d&apos;aérologie.
          </li>
          <li className="list-disc list-inside">
            <span className="font-bold">Jour 6 & 7 : </span>Analyse des
            conditions météo et exercices de gonflage au sol pour perfectionner
            la gestion du décollage.
          </li>
          <li className="list-disc list-inside">
            <span className="font-bold">Jour 8, 9 & 10 : </span>Enchaînement de
            vols guidés par radio, avec un travail spécifique sur les
            trajectoires, les approches et gestion des mouvements de tangage et
            de roulis.
          </li>
        </ul>
        <p className="text-slate-800 mt-4">
          L&apos;objectif est de vous amener à réaliser vos premiers vols en
          toute autonomie, tout en assurant un cadre sécurisant et une
          progression adaptée à chacun.
        </p>
      </section>
      {/* Quels sont le pré-requis pour le stage autonomie ?  */}
      <section className="mx-4 mt-16 lg:mx-36 xl:mx-48 lg:mt-24">
        <h2 className="font-bold text-2xl text-slate-800">
          Quels sont le pré-requis pour le stage autonomie ?
        </h2>
        <p className="text-slate-800 mt-4">
          Aucun prérequis technique n’est nécessaire, ce stage s&apos;adresse
          aux <strong>débutants motivés</strong> ou aux pilotes ayant déjà
          réalisé quelques vols mais souhaitant atteindre rapidement
          l’autonomie. Une bonne condition physique et une forte envie de
          progresser sont cependant recommandées.
        </p>
      </section>
      {/* Où a lieu le stage d’autonomie ? */}
      <section className="mx-4 mt-16 lg:mx-36 xl:mx-48 lg:mt-24">
        <h2 className="font-bold text-2xl text-slate-800">
          Où a lieu le stage d’autonomie ?
        </h2>
        <p className="text-slate-800 mt-4">
          Le <strong>stage progression</strong> de{" "}
          <strong>Serre Chevalier Parapente</strong> se déroule dans un cadre
          exceptionnel, au cœur des <strong>Hautes-Alpes</strong>, à{" "}
          <strong>Briançon</strong>, dans la magnifique vallée de{" "}
          <strong>Serre Chevalier</strong> au porte des écrins. L&apos;école est
          idéalement située pour accéder à des pentes douces et sécurisées,
          parfaites pour l&apos;apprentissage du décollage et des premiers vols.
          Nous utilisons notamment des{" "}
          <strong>pentes écoles situées à Briançon</strong> même, au{" "}
          <strong>col du Granon</strong>, <strong>col du Lautaret</strong> et{" "}
          <strong>col du Galibier</strong> offrant des conditions idéales pour
          progresser en toute sécurité. Les grands vols se déroulent ensuite sur
          des sites emblématiques comme le <strong>col du Granon</strong> ou
          encore le <strong>col du Prorel</strong>, offrant des panoramas à
          couper le souffle.
        </p>
      </section>
      {/* Quel est le déroulement d’un stage autonomie chez Serre Chevalier Parapente ? */}
      <section className="mx-4 mt-16 lg:mx-36 xl:mx-48 lg:mt-24">
        <h2 className="font-bold text-2xl text-slate-800">
          Quel est le déroulement d’un stage autonomie chez Serre Chevalier
          Parapente ?
        </h2>
        <p className="text-slate-800 mt-4">
          Le <strong>Stage Autonomie</strong> chez{" "}
          <strong>Serre Chevalier Parapente</strong> est{" "}
          <strong>
            le chemin le plus direct pour devenir un pilote autonome
          </strong>
          , capable de voler en sécurité sans assistance radio. En combinant le{" "}
          <strong>Stage Initiation</strong> et le
          <strong>Stage Progression</strong> sur{" "}
          <strong>
            10 jours de pratique répartis sur 14 jours de disponibilité
          </strong>
          , ce stage intensif vous permet d&apos;
          <strong>
            acquérir rapidement toutes les compétences techniques et mentales
            nécessaires pour voler librement
          </strong>
          .
        </p>
        <p className="text-slate-800 mt-4">
          Notre{" "}
          <strong>
            cheminement pédagogique est basé sur une progression étape par étape
          </strong>
          , où nous vous{" "}
          <strong>
            responsabilisons progressivement sur votre propre sécurité
          </strong>
          , afin que vous développiez une{" "}
          <strong>véritable autonomie de décision</strong> et une{" "}
          <strong>conscience de votre champ de compétence</strong>.
        </p>
        <p className="text-slate-800 mt-4">
          Le stage commence par une{" "}
          <strong>prise de contact personnalisée</strong>, où nous apprenons à
          connaître vos expériences et votre motivation à atteindre
          l&apos;autonomie en parapente. Dès le premier jour, nous vous
          accueillons autour d’un café pour{" "}
          <strong>
            vous présenter l&apos;équipe, le programme et effectuer la prise de
            licence FFVL
          </strong>{" "}
          (obligatoire pour pratiquer le parapente).
        </p>
        <p className="text-slate-800 mt-4">
          Ensuite, nous avançons à travers un{" "}
          <strong>programme structuré et progressif</strong>:
        </p>
        <ul className="mt-4">
          <li className="list-disc list-inside">
            <strong>Maîtriser parfaitement le matériel</strong> et les
            techniques de décollage au sol.
          </li>
          <li className="list-disc list-inside">
            <strong>Réaliser ses premiers vols avec assistance radio</strong>{" "}
            pour acquérir les bases du pilotage.
          </li>
          <li className="list-disc list-inside">
            <strong>Perfectionner son pilotage en l&apos;air</strong> :
            trajectoire, gestion des virages et gestion du plan de vol.
          </li>
          <li className="list-disc list-inside">
            <strong>
              Apprendre à lire l&apos;aérologie et à exploiter les ascendances
            </strong>{" "}
            pour allonger ses vols.
          </li>
          <li className="list-disc list-inside">
            <strong>
              Prendre progressivement ses propres décisions en vol
            </strong>
            , avec moins d&apos;assistance radio.
          </li>
          <li className="list-disc list-inside">
            <strong>Gérer son mental et ses émotions</strong> pour voler
            sereinement et en sécurité.
          </li>
        </ul>
        <p className="text-slate-800 mt-4">
          Au fil des jours, nous{" "}
          <strong>
            réduisons l’assistance radio pour vous amener à voler de manière
            totalement autonome
          </strong>
          , tout en restant à vos côtés pour assurer votre sécurité et répondre
          à vos questions. L&apos;objectif final est que vous puissiez{" "}
          <strong>
            réaliser des vols sereins et maîtrisés, en toute liberté, sur des
            sites variés
          </strong>
          .
        </p>
      </section>
      {/* Quels sont les engagements de l’école ? */}
      <section className="mx-4 mt-16 lg:mx-36 xl:mx-48 lg:mt-24">
        <h2 className="font-bold text-2xl text-slate-800">
          Quels sont les engagements de l’école ?
        </h2>
        <p className="text-slate-800 mt-4">
          Chez <strong>Serre Chevalier Parapente</strong>, notre engagement est
          simple :{" "}
          <span className="font-bold">
            vous accompagner vers l’autonomie en vol, en toute sécurité et avec
            un maximum de plaisir
          </span>
          .
        </p>
        <ul className="mt-4">
          <li className="list-disc list-inside">
            <span className="font-bold">La sécurité avant tout :</span> Nous
            assurons un encadrement personnalisé avec des moniteurs diplômés
            d’État durant votre décollage et votre atterissage, une analyse météo rigoureuse et du matériel récent et
            contrôlé. Chaque vol est guidé par radio pour vous permettre de
            progresser sereinement.
          </li>
          <li className="list-disc list-inside">
            <span className="font-bold">Un enseignement sur-mesure :</span> Nous
            adaptons notre pédagogie à votre niveau et à vos objectifs. Que vous
            souhaitiez gagner en confiance, perfectionner votre technique ou
            préparer votre brevet initial, nous vous apportons les clés pour
            évoluer à votre rythme.
          </li>
          <li className="list-disc list-inside">
            <span className="font-bold">
              Un cadre exceptionnel pour progresser :
            </span>{" "}
            Grâce à la diversité de nos sites de vol dans la vallée de Serre
            Chevalier, nous vous offrons des conditions idéales pour explorer le
            vol thermique et la gestion de l&apos;altitude.
          </li>
          <li className="list-disc list-inside">
            <span className="font-bold">Un suivi humain et bienveillant :</span>{" "}
            Nous créons une ambiance conviviale et motivante pour que chaque
            élève se sente en confiance et prenne du plaisir à progresser.
          </li>
        </ul>
        <p className="text-slate-800 mt-4">
          Notre mission :{" "}
          <span className="font-bold">
            vous transmettre notre passion pour le parapente tout en vous
            rendant autonome et confiant dans votre pratique.
          </span>
        </p>
      </section>
      {/* NOS MONITEURS */}
      <TeamSection title="Nos Moniteurs" />
      {/* Pourquoi faire votre Stage Autonomie chez Serre Chevalier Parapente ?   */}
      <section className="mx-4 mt-16 lg:mx-36 xl:mx-48 lg:mt-24">
        <h2 className="font-bold text-2xl text-slate-800">
          Pourquoi faire votre Stage Autonomie chez Serre Chevalier Parapente ?
        </h2>
        <p className="text-slate-800 mt-4">
          Choisir le{" "}
          <strong>Stage Autonomie chez Serre Chevalier Parapente</strong>,
          c&apos;est{" "}
          <strong>
            faire le choix d&apos;une progression accélérée pour atteindre
            l&apos;autonomie en parapente en seulement 10 jours de pratique
          </strong>
          . En combinant directement le <strong>Stage Initiation</strong> et le{" "}
          <strong>Stage Progression</strong>, ce format intensif vous permet
          d&apos;acquérir{" "}
          <strong>
            toutes les compétences techniques et mentales nécessaires pour voler
            en toute sécurité, sans assistance radio
          </strong>
          .
        </p>
        <p className="text-slate-800 mt-4">
          Dans un <strong>cadre exceptionnel au cœur des Hautes-Alpes</strong>,
          vous bénéficierez d’un{" "}
          <strong>encadrement personnalisé par des moniteurs passionnés</strong>
          , sur des sites de vol variés, allant des pentes douces pour
          l&apos;apprentissage au sol aux grands vols sur des sites thermiques
          comme le Prorel ou le Col du Granon. Nous mettons un point
          d&apos;honneur à vous{" "}
          <strong>
            responsabiliser progressivement sur votre propre sécurité
          </strong>
          , afin que vous développiez une réelle{" "}
          <strong>conscience de votre champ de compétence</strong>, essentielle
          pour voler en autonomie.
        </p>
        <p className="text-slate-800 mt-4">
          Chez Serre Chevalier Parapente, nous vous offrons{" "}
          <strong>
            une expérience unique, alliant pédagogie, sécurité et plaisir
          </strong>
          , pour vous permettre de vivre pleinement votre passion du vol libre,
          tout en atteignant rapidement votre objectif d’autonomie.
        </p>
        <div className="block w-full space-y-4 mt-8 md:flex md:space-y-0 md:gap-8 lg:max-h-[50vh]">
          <div className="w-full rounded-lg overflow-hidden h-[60vh] md:h-[40vh] lg:h-auto box-border self-stretch">
            <SliderPentesEcoles />
          </div>
          <div className="w-full rounded-lg overflow-hidden h-[60vh] md:h-[40vh] lg:h-auto box-border self-stretch">
            <SliderSitesGrandVols />
          </div>
        </div>
      </section>
      {/*  Est-ce que la pédagogie et la sécurité est importante pour Serre Chevalier Parapente, dans le cadre d’une stage d’Autonomie ?   */}
      <section className="mx-4 my-16 lg:mx-36 xl:mx-48 lg:my-24">
        <h2 className="font-bold text-2xl text-slate-800">
          Est-ce que la pédagogie et la sécurité est importante pour Serre
          Chevalier Parapente, dans le cadre d’une stage d’Autonomie ?
        </h2>
        <p className="text-slate-800 mt-4">
          Chez <strong>Serre Chevalier Parapente</strong>, la{" "}
          <strong>sécurité</strong> et la <strong>pédagogie</strong> sont au
          cœur de notre <strong>Stage Autonomie</strong>, car{" "}
          <strong>
            devenir un pilote autonome ne se résume pas à enchaîner des vols.
          </strong>
        </p>
        <p className="text-slate-800 mt-4">
          Nous avons développé une{" "}
          <strong>pédagogie progressive et bienveillante</strong>, qui vous
          permet d&apos;<strong>évoluer à votre rythme</strong>, tout en vous
          responsabilisant progressivement sur votre{" "}
          <strong>prise de décision en vol</strong> et votre{" "}
          <strong>gestion de la sécurité</strong>. L’objectif est de{" "}
          <strong>vous amener à une autonomie réelle</strong>, où vous serez
          capable d&apos;identifier vos propres compétences et limites,
          d&apos;analyser les conditions aérologiques et de gérer votre vol en
          toute sérénité.
        </p>
        <p className="text-slate-800 mt-4">
          Pour garantir cette progression en toute sécurité, nous utilisons un{" "}
          <strong>matériel récent et contrôlé</strong>, sélectionnons des{" "}
          <strong>sites de vol adaptés</strong> à votre niveau et aux conditions
          météo, et assurons un <strong>suivi radio constant</strong> tout au
          long du stage. Au fil des vols, nous vous{" "}
          <strong>donnons de plus en plus de liberté</strong>, jusqu’à vous
          laisser prendre seul les décisions essentielles pour que vous puissiez
          voler en toute confiance, même sans encadrement.
        </p>
        <div className="block w-full space-y-4 mt-8 md:flex md:flex-row-reverse md:space-y-0 md:gap-8">
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="flex w-full rounded-lg overflow-hidden h-[40vh] lg:w-[40%] box-border relative cursor-pointer"
                aria-haspopup="dialog"
                aria-expanded={false}
                aria-controls="radix-:R1gsv9tkq:"
              >
                <Image
                  src="/placeholder/bento_materiel.webp"
                  width={1080}
                  height={1920}
                  alt="Image du matériel pour les stages de parapentes dans la vallée de Serre chevalier Briançon"
                  className="block w-full h-full object-cover object-center"
                />
                <div className="absolute z-20 text-slate-50 left-0 top-0 p-4 xl:p-8 flex flex-col items-start justify-between h-full">
                  <h3 className="text-lg font-bold lg:text-xl text-left">
                    Du matériel homologué, neuf et de qualité
                  </h3>
                  <div className="flex items-center gap-1">
                    <ChevronRightIcon size={16} className="text-slate-50" />
                    <p className="underline text-base text-slate-50">
                      Voir le matériel
                    </p>
                  </div>
                </div>
                <div className="h-full w-full bg-gradient-to-br from-slate-900/80 to-slate-900/0 block absolute top-0 left-0 z-10"></div>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] xl:max-w-[750px] 3xl:max-w-[1000px] 2xl:p-16">
              <DialogHeader>
                <DialogTitle className="text-slate-900 text-left xl:text-2xl 3xl:text-3xl">
                  Du matériel homologué, neuf et de qualité
                </DialogTitle>
              </DialogHeader>
              <DialogDescription className="text-sm xl:text-lg 3xl:text-xl text-slate-600">
                <p className="mt-2">
                  -{" "}
                  <span className="font-semibold">
                    Voiles Davinci Classic 2
                  </span>
                  , une solide réputation d’ailes sécurisantes et performantes
                </p>
                <p className="mt-2">
                  -{" "}
                  <span className="font-semibold">
                    Sellettes Duo Réversibles
                  </span>
                  , confortables et légères
                </p>
                <p className="mt-2">
                  - <span className="font-semibold">Portique sellette</span> :
                  pour apprendre les bons gestes de pilotage tout en restant au
                  sol ; permet de régler la sellette à votre morphologie pour un
                  confort optimal
                </p>
              </DialogDescription>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild className="cursor-pointer">
              <div className="w-full rounded-lg overflow-hidden h-auto md:h-[40vh] box-border border border-slate-900 flex flex-col lg:flex-row">
                <div className="w-full h-full md:h-1/3 lg:h-full">
                  <Image
                    src={"/placeholder/serreche-parapente-bento-equipe.webp"}
                    width={1920}
                    height={1080}
                    alt="Photo de l'équipe de moniteurs de parapente de Serre Chevalier Briançon."
                    className="block w-full h-full object-cover object-center"
                  />
                </div>
                <div className="w-full h-auto md:h-full text-slate-900 p-4 xl:p-8 lg:flex lg:flex-col lg:justify-between">
                  <div>
                    <h3 className="text-lg font-bold lg:text-xl">
                      Notre équipe de professionnels rassurants et enthousiastes
                      !
                    </h3>
                    <p className="my-2 mb-4">
                      Expérience, pédagogie et bonne ambiance
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChevronRightIcon size={16} className="text-slate-900" />
                    <p className="underline text-base">Nos points forts</p>
                  </div>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] xl:max-w-[750px] 3xl:max-w-[1000px] 2xl:p-16">
              <DialogHeader>
                <DialogTitle className="text-slate-900 text-left xl:text-2xl 3xl:text-3xl">
                  Nos points forts
                </DialogTitle>
              </DialogHeader>
              <DialogDescription className="text-sm xl:text-lg 3xl:text-xl text-slate-600">
                <ul className="mt-2 pl-6">
                  <li className="list-disc">
                    <span className="font-semibold">École certifiée FFVL</span>{" "}
                    - Fédération Française de Vol Libre
                  </li>
                  <li className="list-disc">
                    Clément Pons, moniteur principal, possède{" "}
                    <span className="font-semibold">
                      16 années d’expérience en parapente
                    </span>
                  </li>
                  <li className="list-disc">
                    <span className="font-semibold">Biplace pédagogique :</span>{" "}
                    décollez avec le moniteur pour tester directement ses
                    conseils en vol, et lui laisser les commandes en cas
                    d’inquiétude !
                  </li>
                  <li className="list-disc">
                    <span className="font-semibold">
                      Sécurité, progression et proximité :
                    </span>{" "}
                    un moniteur encadre 6 élèves au maximum
                  </li>
                  <li className="list-disc">
                    <span className="font-semibold">Matériel vidéo</span> pour
                    filmer vos actions et débrief en fin de journée
                  </li>
                  <li className="list-disc">
                    <span className="font-semibold">
                      2 moniteurs certifiés pour les grands vols,
                    </span>{" "}
                    en liaison radio permanente avec vous : un au décollage et à
                    un l’atterrissage
                  </li>
                  <li className="list-disc">
                    <span className="font-semibold">
                      Pédagogie efficace et adaptative :
                    </span>{" "}
                    pas de blabla inutile, nous sommes à l’écoute des souhaits
                    et objectifs de chacun de vous
                  </li>
                  <li className="list-disc">
                    <span className="font-semibold">
                      Très affûtés en météorologie,
                    </span>{" "}
                    nous faisons le maximum pour aller chercher à tout moment
                    les meilleures conditions de vol (calmes et faciles)
                  </li>
                  <li className="list-disc">
                    <span className="font-semibold">
                      L’ambiance est toujours très bonne
                    </span>
                    , élèves et moniteurs mangent ensemble la plupart du temps.
                    C’est une aventure humaine qui se partage !
                  </li>
                </ul>
              </DialogDescription>
            </DialogContent>
          </Dialog>
        </div>
      </section>
      {/* TESTIMONY */}
      <Testimonial />
      {/* BLOG */}
      <section className="mx-4 my-16 lg:mx-36 xl:mx-48 lg:my-24">
        <p className="mb-8 font-bold text-2xl relative before:content-[''] before:block before:w-1 pl-4 before:h-full before:bg-blue-600 before:absolute before:left-0 before:top-0">
          Nos derniers articles
        </p>
        <BlogRelativeArticles slugToExclude={""} />
      </section>
    </>
  );
}
