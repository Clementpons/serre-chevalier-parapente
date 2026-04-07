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
  LucideUsersRound,
} from "lucide-react";
import Image from "next/image";
import { StagePriceBadge } from "@/components/price/StagePriceBadge";
import StageCalendarWidget from "@/components/stages/StageCalendarWidget";

export async function generateMetadata() {
  return {
    title: `Stage Parapente Initiation (5j) – Serre Chevalier en sécurité`,
    description: `Apprenez à voler avec notre stage initiation parapente à Serre Chevalier. 5 jours pour découvrir les bases et voler en autonomie.`,
    alternates: {
      canonical: `https://www.serre-chevalier-parapente.fr/nos-stages/initiation`,
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
              Stage de Parapente Initiation à Serre Chevalier - Débutez en toute
              sécurité
            </h1>
            <div className="flex flex-wrap lg:flex-nowrap justify-center lg:justify-normal gap-4 lg:gap-2 items-center mt-4">
              <p className="text-slate-700 bg-slate-200 border border-slate-500 rounded-full py-1 px-4 inline-flex items-center">
                <LucideCalendar className="size-4 mr-2" />5 jours
              </p>
              <p className="text-slate-700 bg-slate-200 border border-slate-500 rounded-full py-1 px-4 inline-flex items-center">
                <LucideClock8 className="size-4 mr-2" />
                8h - 16h
              </p>
              <StagePriceBadge stageType="INITIATION" />
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

      {/* ── Mobile calendar (between hero and content, hidden on desktop) ── */}
      <div className="block lg:hidden px-4 mt-8">
        <StageCalendarWidget stageType="INITIATION" />
      </div>

      {/* ── Two-column layout: content left / calendar sticky right ── */}
      {/* The parent div is the sticky boundary — sticky stops when this div ends (before TeamSection) */}
      <div className="px-4 lg:px-8 xl:px-48 mt-8 lg:mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-32">

          {/* Left column: page content */}
          <div className="min-w-0">

            {/* Blocs infos */}
            <div className="flex flex-col lg:flex-row mb-8 gap-4 lg:gap-8 flex-wrap">
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
            <p className="text-slate-800 mt-4">
              Le <strong>stage initiation de Serre Chevalier Parapente</strong>{" "}
              s&apos;adresse à toute personne souhaitant découvrir le parapente et
              vivre ses premiers vols en douceur. Que vous soyez un amateur de
              sensations fortes, un amoureux de la nature ou simplement curieux de
              ressentir la liberté du vol libre, ce stage est fait pour vous. Aucun
              niveau sportif particulier n&apos;est requis, il suffit d&apos;être en
              bonne condition physique et d&apos;avoir l&apos;envie de
              s&apos;envoler.
            </p>

            {/* Quel est l'objectif du stage initiation ? */}
            <section className="mt-12 lg:mt-16">
              <h2 className="font-bold text-2xl text-slate-800">
                Quel est l'objectif du stage initiation ?
              </h2>
              <p className="text-slate-800 mt-4">
                L&apos;objectif du stage initiation est simple : vous permettre de
                réaliser <strong>vos premiers décollages en solo</strong>, tout en
                découvrant les bases du pilotage et de la gestion de votre voile. À
                travers une progression encadrée et sécurisée, vous gagnerez en
                confiance et en autonomie pour commencer à goûter aux plaisirs du vol
                libre.
              </p>
            </section>

            {/* Quel est le programme du stage initiation ? */}
            <section className="mt-12 lg:mt-16">
              <h2 className="font-bold text-2xl text-slate-800">
                Quel est le programme du stage initiation ?
              </h2>
              <p className="text-slate-800 mt-4">
                Le stage se déroule sur{" "}
                <strong>
                  5 jours de pratique répartis sur 7 jours de disponibilité
                </strong>
                , pour s&apos;adapter aux meilleures conditions météo, permettant à
                chaque élève de prendre confiance et de progresser à son rythme.
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
                  par radio depuis des sites adaptés, avec un accompagnement au
                  décollage et à l&apos;atterissage pour affiner votre pilotage en
                  l&apos;air et découvrir les premières notions de trajectoire et
                  d&apos;aérologie.
                </li>
              </ul>
              <p className="text-slate-800 mt-4">
                L&apos;objectif est de vous amener à réaliser vos premiers vols en
                toute autonomie, tout en assurant un cadre sécurisant et une
                progression adaptée à chacun.
              </p>
            </section>

            {/* Quels sont le pré-requis pour le stage initiation ? */}
            <section className="mt-12 lg:mt-16">
              <h2 className="font-bold text-2xl text-slate-800">
                Quels sont le pré-requis pour le stage initiation ?
              </h2>
              <p className="text-slate-800 mt-4">
                Aucun prérequis technique n&apos;est nécessaire pour participer au
                stage initiation. Il suffit d&apos;être en bonne condition physique,
                de peser entre 40 et 105 kg, et d&apos;avoir l&apos;envie
                d&apos;apprendre. L&apos;esprit d&apos;aventure et la motivation sont
                vos meilleurs alliés pour profiter pleinement de cette première
                expérience de vol libre.
              </p>
            </section>

            {/* Où a lieu le stage d'initiation ? */}
            <section className="mt-12 lg:mt-16">
              <h2 className="font-bold text-2xl text-slate-800">
                Où a lieu le stage d'initiation ?
              </h2>
              <p className="text-slate-800 mt-4">
                Le <strong>stage initiation</strong> de{" "}
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
                encore le <strong>Puy Chalvin</strong>, offrant des panoramas à
                couper le souffle.
              </p>
            </section>

            {/* Quel est le déroulement d'un stage initiation chez Serre Chevalier Parapente ? */}
            <section className="mt-12 lg:mt-16">
              <h2 className="font-bold text-2xl text-slate-800">
                Quel est le déroulement d'un stage initiation chez Serre Chevalier
                Parapente ?
              </h2>
              <p className="text-slate-800 mt-4">
                Le <span className="font-bold">cheminement pédagogique</span> chez{" "}
                <strong>Serre Chevalier Parapente</strong> repose sur{" "}
                <span className="font-bold">
                  l&apos;expérience collective de notre équipe de moniteurs passionnés
                </span>
                , enrichie par des années de pratique et d&apos;enseignement. Chaque
                stagiaire étant unique, nous adaptons notre approche en fonction de{" "}
                <span className="font-bold">
                  votre profil, de vos expériences passées, qu&apos;elles soient
                  aériennes ou issues d&apos;autres sports
                </span>
                , et surtout, de votre démarche personnelle qui vous amène à découvrir
                le parapente.
              </p>
              <p className="text-slate-800 mt-4">
                Nous puisons notre inspiration dans des méthodes pédagogiques simples
                et efficaces, issues de notre pratique du parapente, mais aussi
                d&apos;autres disciplines comme l&apos;<strong>alpinisme</strong> ou
                la <strong>plongée</strong>, afin de{" "}
                <span className="font-bold">
                  rester connectés aux émotions que procure la découverte d&apos;un
                  nouveau sport et d&apos;un nouveau milieu
                </span>
                .
              </p>
              <p className="text-slate-800 mt-4">
                Le stage commence dès le{" "}
                <span className="font-bold">
                  premier contact par téléphone ou message
                </span>
                , où nous apprenons à{" "}
                <span className="font-bold">
                  mieux vous connaître et comprendre votre motivation à voler
                </span>
                . Le jour J, nous prenons le temps de{" "}
                <span className="font-bold">vous accueillir autour d'un café</span>,
                de{" "}
                <span className="font-bold">
                  vous accompagner dans la prise de licence FFVL
                </span>{" "}
                (obligatoire pour pratiquer le parapente), et de{" "}
                <span className="font-bold">
                  vous présenter l&apos;équipe et le programme du stage
                </span>
                .
              </p>
              <p className="text-slate-800 mt-4">
                L'objectif final de ce stage est de{" "}
                <span className="font-bold">
                  réaliser votre premier grand vol solo avec assistance radio
                </span>
                , mais nous avançons pas à pas, à travers une série de{" "}
                <span className="font-bold">petits objectifs concrets</span>, pour que
                vous ressentiez du plaisir et de la satisfaction dès la première
                journée :
              </p>
              <ul className="mt-4">
                <li className="list-disc list-inside">
                  Manipuler le matériel au sol et s&apos;équiper correctement.
                </li>
                <li className="list-disc list-inside">
                  Comprendre comment faire voler un parapente et gérer sa voile au
                  sol.
                </li>
                <li className="list-disc list-inside">
                  Apprendre à décoller, à piloter et à tourner en parapente.
                </li>
                <li className="list-disc list-inside">
                  Savoir analyser le vent et gérer son mental pour progresser
                  sereinement.
                </li>
              </ul>
              <p className="text-slate-800 mt-4">
                Chaque étape est pensée pour{" "}
                <span className="font-bold">renforcer votre confiance</span>, tout en
                vous permettant de{" "}
                <span className="font-bold">
                  prendre du plaisir et d&apos;évoluer à votre rythme
                </span>{" "}
                dans un cadre bienveillant et sécurisé.
              </p>
            </section>

            {/* Quels sont les engagements de l'école ? */}
            <section className="mt-12 lg:mt-16 pb-8 lg:pb-16">
              <h2 className="font-bold text-2xl text-slate-800">
                Quels sont les engagements de l'école ?
              </h2>
              <p className="text-slate-800 mt-4">
                Chez <strong>Serre Chevalier Parapente</strong>, notre engagement est
                simple :{" "}
                <span className="font-bold">
                  vous offrir la meilleure expérience d'apprentissage du vol libre, en
                  alliant sécurité, pédagogie et plaisir
                </span>
                .
              </p>
              <ul className="mt-4">
                <li className="list-disc list-inside">
                  <span className="font-bold">La sécurité avant tout :</span> Nous
                  mettons à disposition un matériel récent et contrôlé, et nous
                  choisissons des sites de vol adaptés aux conditions aérologiques du
                  jour. Chaque élève est encadré par un moniteur diplômé d&apos;État durant son décollage et son atterissage,
                  et en communication radio permanente pour garantir des vols en toute
                  sérénité.
                </li>
                <li className="list-disc list-inside">
                  <span className="font-bold">Un enseignement personnalisé :</span>{" "}
                  Nous adaptons notre pédagogie à votre niveau et à votre progression.
                  Nous prenons le temps de vous accompagner, de corriger vos gestes et
                  de vous donner les clés pour comprendre l&apos;aérologie et
                  maîtriser votre voile.
                </li>
                <li className="list-disc list-inside">
                  <span className="font-bold">Un cadre convivial et humain :</span>{" "}
                  Apprendre à voler, c&apos;est aussi partager une aventure humaine.
                  Nous créons une ambiance chaleureuse et bienveillante pour que
                  chaque élève puisse progresser à son rythme et prendre un maximum de
                  plaisir en l&apos;air.
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

          </div>{/* end left column */}

          {/* Right column: sticky calendar — stops sticking when parent div ends (before TeamSection) */}
          <div className="hidden lg:block">
            <div className="sticky top-[10vh]">
              <StageCalendarWidget stageType="INITIATION" />
            </div>
          </div>

        </div>
      </div>{/* end two-column wrapper / sticky boundary */}

      {/* NOS MONITEURS — full width, outside the two-column layout */}
      <TeamSection title="Nos Moniteurs" />

      {/*  Pourquoi faire votre stage initiation chez Serre Chevalier Parapente ?  */}
      <section className="mx-4 mt-16 lg:mx-36 xl:mx-48 lg:mt-24">
        <h2 className="font-bold text-2xl text-slate-800">
          Pourquoi faire votre Stage Initiation chez Serre Chevalier Parapente ?
        </h2>
        <p className="text-slate-800 mt-4">
          Choisir <strong>Serre Chevalier Parapente</strong> pour votre{" "}
          <strong>Stage Initiation</strong>, c'est vivre une première expérience
          de vol libre dans un cadre exceptionnel, au cœur de paysage magnifique
          avec la vue sur le dôme des écrins. Avec notre approche basée sur{" "}
          <span className="font-bold">la sécurité</span>,{" "}
          <span className="font-bold">la pédagogie</span> et{" "}
          <span className="font-bold">le plaisir</span>, nous vous garantissons
          une progression en douceur et des sensations inoubliables dès vos
          premiers décollages. On organise nos stages avec un maximum de 6
          stagiaires par moniteur pour garantir un stage qualitatif et
          personnalisé.
        </p>
        <p className="text-slate-800 mt-2">
          Notre équipe de moniteurs diplômés d&apos;État vous accompagne à
          chaque étape, depuis la maîtrise de la voile au sol jusqu&apos;à vos
          premiers grands vols, encadrés par radio. Grâce à des{" "}
          <span className="font-bold">
            sites de pratique variés et sécurisés
          </span>
          , comme nos pentes écoles à Villard Saint Pancrace et nos grands vols
          au Puy Chalvin ou au Col du Granon, vous évoluez dans des conditions
          idéales pour apprendre et prendre confiance. La météo du site garantit
          un maximum de chance de réaliser le stage, avec 300 jours de soleil
          par an Briançon fait partie des villes les plus ensoleillées de
          France.
        </p>
        <p className="text-slate-800 mt-2">
          Enfin, faire votre stage chez nous, c&apos;est rejoindre une école à
          taille humaine, passionnée et bienveillante, où l&apos;on prend le
          temps de vous transmettre les bases du parapente tout en vous faisant
          vivre une aventure unique et accessible à tous.
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

      {/*  Est-ce que la pédagogie et la sécurité sont importantes ? */}
      <section className="mx-4 my-16 lg:mx-36 xl:mx-48 lg:my-24">
        <h2 className="font-bold text-2xl text-slate-800">
          Est-ce que la pédagogie et la sécurité sont importantes pour Serre
          Chevalier Parapente, dans le cadre d'un stage initiation ?
        </h2>
        <p className="text-slate-800 mt-4">
          Absolument. Chez <strong>Serre Chevalier Parapente</strong>,{" "}
          <span className="font-bold">la sécurité</span> et{" "}
          <span className="font-bold">la pédagogie</span> sont les fondations de
          notre <strong>Stage Initiation</strong>. Nous savons qu&apos;apprendre
          à voler pour la première fois est une expérience à la fois excitante
          et impressionnante. C&apos;est pourquoi nous mettons en place{" "}
          <span className="font-bold">
            un accompagnement progressif et rassurant
          </span>
          , pour que chaque élève puisse découvrir le parapente en toute
          confiance.
        </p>
        <p className="text-slate-800 mt-2">
          Dès les premiers exercices au sol en pente école, nos moniteurs
          diplômés vous apprennent à maîtriser votre voile et à comprendre
          l'aérologie, tout en vous guidant à chaque étape. Lors des premiers
          petits vols et des grands vols encadrés par radio, nous assurons une
          <span className="font-bold">
            surveillance permanente pour garantir votre sécurité
          </span>
          , tout en vous laissant la liberté de ressentir vos premières
          sensations de vol libre.
        </p>
        <p className="text-slate-800 mt-2">
          Notre pédagogie repose sur l'écoute, l'adaptation au rythme de chacun
          et la transmission de l'essentiel pour voler en toute sérénité.
          L'objectif est de vous permettre de prendre du plaisir dès vos
          premiers décollages, tout en posant des bases solides pour votre
          progression future.
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
                  , une solide réputation d'ailes sécurisantes et performantes
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
                      16 années d'expérience en parapente
                    </span>
                  </li>
                  <li className="list-disc">
                    <span className="font-semibold">Biplace pédagogique :</span>{" "}
                    décollez avec le moniteur pour tester directement ses
                    conseils en vol, et lui laisser les commandes en cas
                    d'inquiétude !
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
                    un l'atterrissage
                  </li>
                  <li className="list-disc">
                    <span className="font-semibold">
                      Pédagogie efficace et adaptative :
                    </span>{" "}
                    pas de blabla inutile, nous sommes à l'écoute des souhaits
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
                      L'ambiance est toujours très bonne
                    </span>
                    , élèves et moniteurs mangent ensemble la plupart du temps.
                    C'est une aventure humaine qui se partage !
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
