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
    title: `Stage Parapente Progression (5j) – Serre Chevalier / Briançon`,
    description: `Perfectionnez votre pilotage en parapente avec notre stage progression à Serre Chevalier. 5 jours pour voler plus librement.`,
    alternates: {
      canonical: `https://www.serre-chevalier-parapente.fr/nos-stages/initiation`,
    },
  };
}

export default function NosStagesPage() {
  return (
    <>
      {/* CTA de réservation */}
      <CTANosStages type="PROGRESSION" />
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
              Stage de Parapente Progression à Serre Chevalier – Gagnez en
              autonomie
            </h1>
            <div className="flex flex-wrap lg:flex-nowrap justify-center lg:justify-normal gap-4 lg:gap-2 items-center mt-4">
              <p className="text-slate-700 bg-slate-200 border border-slate-500 rounded-full py-1 px-4 inline-flex items-center">
                <LucideCalendar className="size-4 mr-2" />5 jours
              </p>
              <p className="text-slate-700 bg-slate-200 border border-slate-500 rounded-full py-1 px-4 inline-flex items-center">
                <LucideClock8 className="size-4 mr-2" />
                8h - 16h
              </p>
              <StagePriceBadge stageType="PROGRESSION" />
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
            <p className="text-balance text-center text-sm lg:text-normal">À partir de 12 ans</p>
          </div>
          <div className="inline-flex lg:flex items-center gap-2 justify-center lg:justify-start bg-slate-100 hover:bg-slate-200 hover:cursor-pointer transition rounded-lg p-3 lg:p-4">
            <LucideDumbbell className="text-slate-900 size-4 lg:size-6" />
            <p className="text-balance text-center text-sm lg:text-normal">Jusqu&apos;à 105kg</p>
          </div>
          <div className="inline-flex lg:flex items-center gap-2 justify-center lg:justify-start bg-slate-100 hover:bg-slate-200 hover:cursor-pointer transition rounded-lg p-3 lg:p-4">
            <LucideClock8 className="text-slate-900 size-4 lg:size-6" />
            <p className="text-balance text-center text-sm lg:text-normal">
              5 jours : du Dimanche au Jeudi
            </p>
          </div>
          <div className="inline-flex lg:flex items-center gap-2 justify-center lg:justify-start bg-slate-100 hover:bg-slate-200 hover:cursor-pointer transition rounded-lg p-3 lg:p-4">
            <LucideCloudRainWind className="text-slate-900 size-4 lg:size-6" />
            <p className="text-balance text-center text-sm lg:text-normal">
              Extension / Report en cas de mauvais temps
            </p>
          </div>
        </div>
        <h2 className="font-bold text-2xl text-slate-800">
          A qui s’adresse ce stage progression ?
        </h2>
        <p className="text-slate-800 mt-4">
          Le <strong>stage progression de Serre Chevalier Parapente</strong>{" "}
          s’adresse aux pilotes ayant déjà effectué un{" "}
          <strong>stage initiation</strong> ou ayant acquis une première
          expérience en vol. Il est idéal pour ceux qui souhaitent{" "}
          <span className="font-bold">gagner en autonomie</span>, perfectionner
          leur pilotage et commencer à exploiter les ascendances pour prolonger
          leur temps de vol. Ce stage s’adresse aussi bien aux élèves en quête
          de confiance qu’aux futurs pilotes cherchant à préparer leur brevet
          initial.
        </p>
      </section>
      {/* Quel est l’objectif du stage progression ? */}
      <section className="mx-4 mt-16 lg:mx-36 xl:mx-48 lg:mt-24">
        <h2 className="font-bold text-2xl text-slate-800">
          Quel est l’objectif du stage progression ?
        </h2>
        <p className="text-slate-800 mt-4">
          L’objectif principal de ce stage est de vous{" "}
          <strong>faire progresser vers l’autonomie en vol</strong>, en vous
          permettant de maîtriser les différentes phases du vol : décollage,
          gestion de trajectoire, pilotage actif et atterrissage précis. Vous
          apprendrez également à <strong>lire l’aérologie</strong> et à
          exploiter les conditions thermiques pour{" "}
          <strong>gagner en hauteur et en durée de vol</strong>, tout en
          assurant votre sécurité.
        </p>
      </section>
      {/* Quel est le programme du stage progression ? */}
      <section className="mx-4 mt-16 lg:mx-36 xl:mx-48 lg:mt-24">
        <h2 className="font-bold text-2xl text-slate-800">
          Quel est le programme du stage progression ?
        </h2>
        <p className="text-slate-800 mt-4">
          Le programme consiste à améliorer la technique de décollage dans un
          premier temps en pente école afin de concentrer le reste du stage sur
          l’atterrissage et la gestion du plan de vol. La matiné est dédié à la
          pratique et l&apos;après midi aux apports théorique (Débrifing vidéo,
          cours théorique et notion de base, Seance portique pour travailler la
          gestuelle en vol et corriger les postures). Le RDV du matin et a 8h au
          local et nous revenon a 12h pour prendre une pause pour manger, la
          séance théorique est de 14h a 16h.
        </p>
        <p className="text-slate-800 mt-4">
          Le stage se déroule sur{" "}
          <strong>
            5 jours de pratique répartis sur 7 jours de disponibilité
          </strong>
          , pour optimiser les meilleures conditions météo.
        </p>
        <ul className="mt-4">
          <li className="list-disc list-inside">
            <span className="font-bold">Jour 1 & 2 : </span>Analyse des
            conditions météo et exercices de gonflage au sol pour perfectionner
            la gestion du décollage.
          </li>
          <li className="list-disc list-inside">
            <span className="font-bold">Jour 3, 4 & 5 : </span>Enchaînement de
            vols guidés par radio, avec un travail spécifique sur les
            trajectoires, les approches et gestion des mouvements de tangage et
            de roulis.
          </li>
          <li className="list-disc list-inside">
            <span className="font-bold">
              Débriefing quotidien en après- midi :{" "}
            </span>
            pour analyser vidéo de vos décollage et faire les apport théorique.
          </li>
        </ul>
      </section>
      {/* Quels sont le pré-requis pour le stage initiation ? */}
      <section className="mx-4 mt-16 lg:mx-36 xl:mx-48 lg:mt-24">
        <h2 className="font-bold text-2xl text-slate-800">
          Quels sont le pré-requis pour le stage progression ?
        </h2>
        <p className="text-slate-800 mt-4">
          Pour accéder au stage progression, il est nécessaire d’avoir déjà
          réalisé un <strong>stage initiation</strong> ou d’avoir une expérience
          équivalente en vol. Vous devez également être capable de décoller et
          d’atterrir en autonomie sous la supervision d’un moniteur. Une bonne
          condition physique et une envie de progresser sont également
          essentielles.
        </p>
      </section>
      {/* Où a lieu le stage d’initiation ? */}
      <section className="mx-4 mt-16 lg:mx-36 xl:mx-48 lg:mt-24">
        <h2 className="font-bold text-2xl text-slate-800">
          Où a lieu le stage de progression ?
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
      {/* Quel est le déroulement d’un stage progression chez Serre Chevalier Parapente ? */}
      <section className="mx-4 mt-16 lg:mx-36 xl:mx-48 lg:mt-24">
        <h2 className="font-bold text-2xl text-slate-800">
          Quel est le déroulement d’un stage progression chez Serre Chevalier
          Parapente ?
        </h2>
        <p className="text-slate-800 mt-4">
          Le <strong>Stage Progression</strong> chez{" "}
          <strong>Serre Chevalier Parapente</strong> est conçu pour
          <strong>
            vous faire passer du statut de débutant à celui de pilote en devenir
          </strong>
          , capable de gérer vos vols de manière plus autonome et de commencer à
          exploiter les ascendances pour prolonger vos vols.
        </p>
        <p className="text-slate-800 mt-4">
          Fort de notre{" "}
          <strong>
            expérience pédagogique et de notre passion pour l&apos;enseignement
          </strong>
          , nous avons élaboré un{" "}
          <strong>cheminement progressif et personnalisé</strong>, basé sur{" "}
          <strong>l&apos;écoute de chaque stagiaire</strong> et sur{" "}
          <strong>
            un accompagnement adapté à votre rythme d&apos;apprentissage
          </strong>
          . Nous nous inspirons également de méthodes issues d&apos;autres
          sports aériens et de montagne pour vous aider à{" "}
          <strong>gagner en confiance et en maîtrise technique</strong>.
        </p>
        <p className="text-slate-800 mt-4">
          Dès le premier jour, nous faisons un{" "}
          <strong>
            bilan de votre expérience acquise lors du stage initiation
          </strong>{" "}
          ou lors de vos premiers vols, afin d&apos;identifier vos points forts
          et les axes à améliorer. L&apos;objectif est de{" "}
          <strong>
            vous amener progressivement à voler avec plus d&apos;aisance
          </strong>
          , tout en prenant des décisions par vous-même.
        </p>
        <p className="text-slate-800 mt-4">
          Le déroulement du stage suit une progression étape par étape :
        </p>
        <ul className="mt-4">
          <li className="list-disc list-inside">
            Améliorer votre gestuelle au sol pour des décollages plus fluides.
          </li>
          <li className="list-disc list-inside">
            Affiner votre pilotage en l&apos;air : gestion de la trajectoire,
            maîtrise des virages et optimisation de votre plan de vol.
          </li>
          <li className="list-disc list-inside">
            Comprendre et exploiter les ascendances pour allonger vos vols.
          </li>
          <li className="list-disc list-inside">
            Apprendre à analyser les conditions aérologiques et à prendre des
            décisions en fonction de votre niveau de compétence.
          </li>
          <li className="list-disc list-inside">
            Gérer vos émotions et votre mental pour voler en confiance.
          </li>
        </ul>
        <p className="text-slate-800 mt-4">
          Grâce à une <strong>progression adaptée et encadrée par radio</strong>
          , nous vous responsabilisons progressivement sur votre{" "}
          <strong>prise de décision</strong> et votre
          <strong>gestion de la sécurité en vol</strong>, afin que vous puissiez{" "}
          <strong>
            gagner en autonomie tout en prenant un maximum de plaisir
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
      {/*  Pourquoi faire votre Stage Progression chez Serre Chevalier Parapente ?   */}
      <section className="mx-4 mt-16 lg:mx-36 xl:mx-48 lg:mt-24">
        <h2 className="font-bold text-2xl text-slate-800">
          Pourquoi faire votre Stage Progression chez Serre Chevalier Parapente
          ?
        </h2>
        <p className="text-slate-800 mt-4">
          Faire votre{" "}
          <strong>Stage Progression chez Serre Chevalier Parapente</strong>,
          c’est choisir une <strong>école passionnée</strong> et{" "}
          <strong>
            engagée dans votre progression vers l’autonomie en vol
          </strong>
          . Située au cœur du <strong>Briançonnais</strong>, notre école
          bénéficie d’un <strong>terrain de jeu exceptionnel</strong>, entre une
          grande variété de pente école et de site de vol qui est un outil
          pédagogique exceptionnel pour Serre Chevalier Parapente. aucunement
          besoin de faire des kilometre pour trouver un nouveau site et
          travailler l&apos;adaptation du stagiaire. Different site offre des
          pentes douces pour affiner votre technique au sol et sites de grands
          vols parfaits pour exploiter les thermiques et allonger vos vols.
        </p>
        <p className="text-slate-800 mt-2">
          Notre <strong>approche pédagogique est 100% personnalisée</strong>,
          adaptée à votre niveau et à vos objectifs. Grâce à l’encadrement
          bienveillant et à l’expérience de nos moniteurs diplômés d’État, vous
          évoluez en toute
          <strong>sécurité</strong>, avec des conseils précis pour perfectionner
          votre pilotage et commencer à lire l’aérologie.
        </p>
        <p className="text-slate-800 mt-2">
          Chez Serre Chevalier Parapente, nous mettons un point d’honneur à
          créer une <strong>ambiance conviviale et humaine</strong>, où l’on
          apprend sérieusement sans jamais oublier le plaisir de voler.
          L’objectif de ce stage ? <strong>Vous rendre autonome</strong>,
          confiant et prêt à profiter pleinement de chaque vol libre, en
          montagne ou ailleurs.
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
      {/*  Est-ce que la pédagogie et la sécurité est importante pour Serre Chevalier Parapente, dans le cadre d’une stage Progression ?  */}
      <section className="mx-4 my-16 lg:mx-36 xl:mx-48 lg:my-24">
        <h2 className="font-bold text-2xl text-slate-800">
          Est-ce que la pédagogie et la sécurité est importante pour Serre
          Chevalier Parapente, dans le cadre d’une stage Progression ?
        </h2>
        <p className="text-slate-800 mt-4">
          Chez <strong>Serre Chevalier Parapente</strong>, la{" "}
          <strong>sécurité</strong> et la <strong>pédagogie</strong> sont
          essentielles pour permettre à chaque élève d’atteindre une{" "}
          <strong>autonomie réelle</strong> en vol.
        </p>
        <p className="text-slate-800 mt-2">
          Notre approche repose sur une <strong>progression sécurisée</strong>,
          où nous
          <strong>
            responsabilisons progressivement le stagiaire sur sa propre sécurité
          </strong>
          . L’objectif est que vous appreniez à{" "}
          <strong>analyser l’aérologie</strong>, à{" "}
          <strong>prendre des décisions en vol</strong> et à{" "}
          <strong>identifier vos propres limites</strong>, pour devenir un
          pilote capable d’évoluer en toute autonomie et en toute sécurité.
        </p>
        <p className="text-slate-800 mt-2">
          Grâce à un <strong>encadrement radio constant</strong>, des exercices
          de pilotage actif et des débriefings détaillés après chaque vol, nous
          vous aidons à
          <strong>
            développer une véritable conscience de votre champ de compétence
          </strong>
          . Petit à petit, vous apprenez à{" "}
          <strong>anticiper les situations de vol</strong>, à gérer votre
          trajectoire et à lire l’environnement aérien, tout en étant guidé par
          nos moniteurs expérimentés.
        </p>
        <p className="text-slate-800 mt-2">
          Notre mission :{" "}
          <strong>
            vous donner toutes les clés pour voler de manière autonome et
            responsable
          </strong>
          , avec une vraie compréhension de votre sécurité et du milieu dans
          lequel vous évoluez.
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
