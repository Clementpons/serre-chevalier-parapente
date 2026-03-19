import BlogRelativeArticles from "@/components/blog/blog-relative-article";
import TeamSection from "@/components/sections/TeamSection";
import Testimonial from "@/components/sections/TestimonySection";
import SliderPentesEcoles from "@/components/ui-self/sliders/SliderPentesEcoles";
import SliderSitesGrandVols from "@/components/ui-self/sliders/SliderSitesGrandVols";
import { Button } from "@/components/ui/button";
import { ReserveButton } from "@/components/booking/ReserveButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  BikeIcon,
  BusFrontIcon,
  ChevronRightIcon,
  HomeIcon,
  IceCreamBowlIcon,
  MountainSnowIcon,
  StarIcon,
  TrainFrontIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { MinPriceDisplay } from "@/components/price/MinPriceDisplay";

export async function generateMetadata() {
  return {
    title: `Stages de Parapente à Serre Chevalier - Tous niveaux`,
    description: `Découvrez nos stages de parapente à Serre Chevalier : initiation, progression ou autonomie. Formations en solo de 5 à 10 jours avec moniteurs diplômés.`,
    alternates: {
      canonical: `https://www.serre-chevalier-parapente.fr/nos-stages`,
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
            src="/placeholder/hero-stages.webp"
            alt="Vol en parapente au dessus de la Valée de Serre Chevalier Briançon"
            width={1920}
            height={1080}
            className="absolute top-0 left-0 w-full h-full object-cover opacity-30"
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
              Nos Stages de Parapente à Serre Chevalier : Initiation,
              Progression, Autonomie
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
      {/* LES TROIS STAGES */}
      <section className="mx-4 my-24 lg:mx-36 xl:mx-48 lg:my-48 mt-8 lg:mt-16 lg:flex lg:gap-12 lg:items-center">
        <Link
          href="/nos-stages/initiation"
          className="inline-block lg:w-1/2 h-[40vh] xl:h-[50vh] rounded-lg overflow-hidden"
        >
          <Image
            src="/stages/stage-initiation.JPG"
            alt={`Photo d&apos;un vol en parapente à Serre Chevalier`}
            width={1920}
            height={1080}
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </Link>
        <div className="mt-8 lg:w-1/2 lg:mt-0">
          <div className="flex flex-col items-start">
            <Link
              href="/nos-stages/initiation"
              className="inline-block hover:underline"
            >
              <h2 className="font-bold text-2xl text-slate-800">
                Stage Initiation Parapente
              </h2>
            </Link>
            <p className="text-slate-500 text-sm bg-slate-200 border border-slate-500 rounded-full inline-block py-1 px-4 mt-4">
              5 jours de stage
            </p>
          </div>
          <p className="text-slate-800 mt-4">
            Envie de goûter aux joies du vol libre et de découvrir des
            sensations inédites ? Le stage initiation est fait pour vous !
            Destiné aux débutants curieux et passionnés de nature, ce stage vous
            permettra de réaliser vos premiers décollages en douceur, encadré
            par des moniteurs expérimentés et passionnés. Objectif ultime :
            faire votre premier vol solo en toute sécurité. De la pente école
            aux premiers grands vols, chaque instant est une montée en
            adrénaline et en liberté. Une aventure inoubliable au cœur des
            majestueuses montagnes du Briançonnais et du parc des Ecrins.
          </p>
          <div className="mt-4">
            <MinPriceDisplay type="STAGE" subType="INITIATION" />
          </div>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <Link href="/nos-stages/initiation" className="inline-block">
              <Button variant="default" size={"lg"} className="gap-2">
                <ChevronRightIcon size={16} />
                Plus d&apos;informations
              </Button>
            </Link>
            <ReserveButton
              type="stage"
              stageType="INITIATION"
              className="gap-2"
            />
          </div>
        </div>
      </section>
      <section className="mx-4 my-24 lg:mx-36 xl:mx-48 lg:my-48 lg:flex lg:flex-row-reverse lg:gap-12 lg:items-center">
        <Link
          href="/nos-stages/progression"
          className="inline-block lg:w-1/2 h-[40vh] xl:h-[50vh] rounded-lg overflow-hidden"
        >
          <Image
            src="/stages/stage-progression.JPG"
            alt={`Photo d&apos;un vol en parapente à Serre Chevalier`}
            width={1920}
            height={1080}
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </Link>
        <div className="mt-8 lg:w-1/2 lg:mt-0">
          <div className="flex flex-col items-start">
            <Link
              href="/nos-stages/progression"
              className="inline-block hover:underline"
            >
              <h2 className="font-bold text-2xl text-slate-800">
                Stage Progression Parapente
              </h2>
            </Link>
            <p className="text-slate-500 text-sm bg-slate-200 border border-slate-500 rounded-full inline-block py-1 px-4 mt-4">
              5 jours de stage
            </p>
          </div>
          <p className="text-slate-800 mt-4">
            Vous avez déjà goûté aux plaisirs du vol et souhaitez aller plus
            loin ? Le stage progression est la clé pour affiner vos techniques
            de pilotage et gagner en autonomie. Conçu pour ceux qui veulent
            maîtriser le décollage et l&apos;atterrissage avec précision, ce
            stage vous offre une immersion totale dans le ciel alpin. Le saint
            Graal ? Commencer à voler en solo, avec une confiance grandissante
            et des sensations de liberté absolue.
          </p>
          <div className="mt-4">
            <MinPriceDisplay type="STAGE" subType="PROGRESSION" />
          </div>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <Link href="/nos-stages/progression" className="inline-block">
              <Button variant="default" size={"lg"} className="gap-2">
                <ChevronRightIcon size={16} />
                Plus d&apos;informations
              </Button>
            </Link>
            <ReserveButton
              type="stage"
              stageType="PROGRESSION"
              className="gap-2"
            />
          </div>
        </div>
      </section>
      <section className="mx-4 my-24 lg:mx-36 xl:mx-48 lg:my-48 lg:flex lg:gap-12 lg:items-center">
        <Link
          href="/nos-stages/autonomie"
          className="inline-block lg:w-1/2 h-[40vh] xl:h-[50vh] rounded-lg overflow-hidden"
        >
          <Image
            src="/stages/stage-autonomie.JPG"
            alt={`Photo d&apos;un vol en parapente à Serre Chevalier`}
            width={1920}
            height={1080}
            className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </Link>
        <div className="mt-8 lg:w-1/2 lg:mt-0">
          <div className="flex flex-col items-start">
            <Link
              href="/nos-stages/autonomie"
              className="inline-block hover:underline"
            >
              <h2 className="font-bold text-2xl text-slate-800">
                Stage Autonomie Parapente
              </h2>
            </Link>
            <p className="text-slate-500 text-sm bg-slate-200 border border-slate-500 rounded-full inline-block py-1 px-4 mt-4">
              10 jours de stage
            </p>
          </div>
          <p className="text-slate-800 mt-4">
            Le combo parfait pour devenir un vrai pilote de parapente !
            Enchaînez le stage initiation et le stage progression pour acquérir
            une maîtrise complète et voler en autonomie totale. Ce stage est
            idéal pour les passionnés qui rêvent de tracer leur propre chemin
            dans le ciel et d&apos;explorer les sommets en toute liberté. Une
            aventure intense et complète pour toucher du doigt l&apos;essence
            même du vol libre dans le décor grandiose des Hautes-Alpes.
          </p>
          <div className="mt-4">
            <MinPriceDisplay type="STAGE" subType="AUTONOMIE" />
          </div>
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <Link href="/nos-stages/autonomie" className="inline-block">
              <Button variant="default" size={"lg"} className="gap-2">
                <ChevronRightIcon size={16} />
                Plus d&apos;informations
              </Button>
            </Link>
            <ReserveButton
              type="stage"
              stageType="AUTONOMIE"
              className="gap-2"
            />
          </div>
        </div>
      </section>
      {/* NAVETTE + AVANTAGES */}
      <section className="mx-4 my-24 lg:mx-36 xl:mx-48 lg:my-48">
        <div className="block w-full space-y-4 mt-8 md:flex md:space-y-0 md:space-x-4">
          <Dialog>
            <DialogTrigger asChild>
              <div className="w-full rounded-lg overflow-hidden h-auto lg:w-[40%] box-border relative border bg-slate-900">
                <div className="p-4 xl:p-8 flex flex-col justify-between h-full">
                  <BusFrontIcon size={36} className="text-slate-50 w-8 h-8" />
                  <div className="py-2 lg:py-0">
                    <h3 className="text-lg text-slate-50 font-bold lg:text-xl">
                      Navette incluse et local école en centre-ville de Briançon
                    </h3>
                    <p className="text-slate-50 mt-2">
                      Pas la peine de vous soucier des transports ! Je vous
                      emmène sur les sites du jour (pentes école et sites de
                      vols) depuis le local école
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChevronRightIcon size={16} className="text-slate-50" />
                    <p className="underline text-base text-slate-50 cursor-pointer">
                      Voir la navette
                    </p>
                  </div>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] xl:max-w-[750px] 3xl:max-w-[1000px] 2xl:p-16">
              <DialogHeader>
                <DialogTitle className="text-slate-900 text-left xl:text-2xl 3xl:text-3xl">
                  <p className="font-semibold">Notre navette privative</p>
                </DialogTitle>
              </DialogHeader>
              <DialogDescription className="text-sm xl:text-lg 3xl:text-xl text-slate-600">
                <Image
                  src="/placeholder/bento_navette.webp"
                  alt={`Photo de la navette privative Serre chevalier parapente à Annecy`}
                  width={1920}
                  height={1080}
                />
                <p className="text-slate-900 mt-2">
                  Pas la peine de vous soucier des transports ! Je vous emmène
                  sur les sites du jour (pentes école et sites de vols) depuis
                  le local école
                </p>
              </DialogDescription>
            </DialogContent>
          </Dialog>
          <div className="w-full rounded-lg overflow-hidden h-auto box-border border border-slate-900">
            <div className="p-4 pb-6 xl:p-8">
              <h3 className="text-lg font-bold text-slate-900 text-balance lg:text-xl">
                Les avantages du site de Serre-Chevalier
              </h3>
              <div className="space-y-4 xl:flex xl:space-y-0 xl:space-x-4 xl:items-start mt-8">
                <div className="space-y-4 xl:w-1/2">
                  <div className="text-slate-900 flex gap-4 items-start">
                    <div className="w-1/6 flex justify-center items-center">
                      <TrainFrontIcon
                        size={36}
                        strokeWidth={1.5}
                        className="text-slate-900 w-[24px] h-[24px]"
                      />
                    </div>
                    <p className="w-5/6">
                      Gare en centre-ville de Briançon. Trains de nuit directs
                      depuis Paris
                    </p>
                  </div>
                  <div className="text-slate-900 flex gap-4 items-start">
                    <div className="w-1/6 flex justify-center items-center">
                      <HomeIcon
                        size={36}
                        strokeWidth={1.5}
                        className="text-slate-900 w-[24px] h-[24px]"
                      />
                    </div>
                    <p className="w-5/6">
                      Nombreux Airbnb aux tarifs abordables
                    </p>
                  </div>
                  <div className="text-slate-900 flex gap-4 items-start">
                    <div className="w-1/6 flex justify-center items-center">
                      <IceCreamBowlIcon
                        size={36}
                        strokeWidth={1.5}
                        className="text-slate-900 w-[24px] h-[24px]"
                      />
                    </div>
                    <p className="w-5/6">
                      Commodités à proximité immédiate du local école
                      (supermarchés, boulangeries, cafés, parkings,
                      distributeurs, etc.)
                    </p>
                  </div>
                </div>
                <div className="space-y-4 xl:w-1/2">
                  <div className="text-slate-900 flex gap-4 items-start">
                    <div className="w-1/6 flex justify-center items-center">
                      <BikeIcon
                        size={36}
                        strokeWidth={1.5}
                        className="text-slate-900 w-[24px] h-[24px]"
                      />
                    </div>
                    <p className="w-5/6">
                      Site multi-activités offrant des infrastructures de
                      qualité : randonnées, Grands Bains du Monêtier, ski,
                      rafting, canyoning, via ferrata, tyrolienne, saut à
                      l&apos;élastique
                    </p>
                  </div>
                  <div className="text-slate-900 flex gap-4 items-start">
                    <div className="w-1/6 flex justify-center items-center">
                      <StarIcon
                        size={36}
                        strokeWidth={1.5}
                        className="text-slate-900 w-[24px] h-[24px]"
                      />
                    </div>
                    <p className="w-5/6">
                      Apprentissage du parapente fructueux et rentable même en
                      haute saison
                    </p>
                  </div>
                  <div className="text-slate-900 flex gap-4 items-start">
                    <div className="w-1/6 flex justify-center items-center">
                      <MountainSnowIcon
                        size={36}
                        strokeWidth={1.5}
                        className="text-slate-900 w-[24px] h-[24px]"
                      />
                    </div>
                    <p className="w-5/6">La vallée est magnifique !</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* NOS MONITEURS */}
      <TeamSection title="Nos Moniteurs" />
      {/*  Pourquoi faire vos stages chez Serre Chevalier Parapente ?  */}
      <section className="mx-4 my-24 lg:mx-36 xl:mx-48 lg:my-48">
        <h2 className="font-bold text-2xl text-slate-800">
          Pourquoi faire vos stages chez Serre Chevalier Parapente ?
        </h2>
        <p className="text-slate-800 mt-4">
          Chez <strong>Serre Chevalier Parapente</strong>, vous ne vous
          contentez pas d&apos;apprendre à voler, vous vivez une véritable
          aventure humaine et aérienne au cœur des majestueuses montagnes du
          Briançonnais. Notre équipe de moniteurs passionnés et expérimentés
          vous accompagne à chaque étape de votre progression, avec pédagogie et
          bienveillance. Que vous soyez débutant ou en quête d&apos;autonomie,
          nous adaptons notre enseignement à votre rythme pour garantir une
          évolution en toute sécurité et dans la bonne humeur.
        </p>
        <p className="text-slate-800 mt-2">
          Notre terrain de jeu, niché au cœur des Hautes-Alpes, offre des
          conditions de vol exceptionnelles et des paysages à couper le souffle.
          Voler au-dessus des vallées de Serre Chevalier, c&apos;est une
          expérience unique qui allie sensations fortes et connexion avec la
          nature. De plus, nous proposons une progression encadrée et
          personnalisée, avec des groupes réduits pour maximiser votre
          apprentissage et votre plaisir en vol. De plus, Serre Chevalier offre
          une multitude de sites de vol à proximité directe.
        </p>
        <p className="text-slate-800 mt-2">
          Enfin, choisir Serre Chevalier Parapente, c&apos;est intégrer une
          communauté de passionnés, partager des moments inoubliables et
          repartir avec des souvenirs gravés à jamais. Que vous optiez pour le
          stage Initiation, Progression ou Autonomie, nous mettons tout en œuvre
          pour que vous puissiez réaliser vos rêves de vol libre et devenir un
          pilote épanoui et confiant.
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
      {/* Est-ce que la pédagogie et la sécurité sont importantes pour Serre Chevalier Parapente ? */}
      <section className="mx-4 my-24 lg:mx-36 xl:mx-48 lg:my-48">
        <h2 className="font-bold text-2xl text-slate-800">
          Est-ce que la pédagogie et la sécurité sont importantes pour Serre
          Chevalier Parapente ?
        </h2>
        <p className="text-slate-800 mt-4">
          Chez <strong>Serre Chevalier Parapente</strong>, la pédagogie et la
          sécurité sont au cœur de notre enseignement. Nous avons à cœur de
          transmettre notre passion pour le vol libre tout en assurant une
          progression encadrée et sécurisée. Chaque élève est unique, c&apos;est
          pourquoi nous adaptons notre approche en fonction de votre niveau, de
          vos objectifs et de votre rythme d&apos;apprentissage. Grâce à une
          méthode d&apos;enseignement progressive et bienveillante, vous évoluez
          sereinement, en gagnant en confiance et en autonomie à chaque vol.
        </p>
        <p className="text-slate-800 mt-2">
          La sécurité est notre priorité absolue. Nos moniteurs diplômés
          d&apos;État sont présents à chaque étape pour vous guider et vous
          corriger, tout en assurant un cadre rassurant pour vos premiers
          décollages et vos premiers vols thermiques. Nous utilisons du matériel
          récent et régulièrement vérifié, et nous vous formons à la gestion des
          conditions aérologiques spécifiques à la région de Serre Chevalier.
          Tout est mis en œuvre pour que vous puissiez profiter pleinement de
          l&apos;expérience, en toute sérénité.
        </p>
        <p className="text-slate-800 mt-2">
          En choisissant Serre Chevalier Parapente, vous bénéficiez d&apos;une
          formation de qualité, alliant technique, plaisir et sécurité. Notre
          objectif est simple : vous permettre de voler en toute liberté, tout
          en vous offrant les clés pour devenir un pilote autonome et
          responsable.
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
      <section className="mx-4 my-24 lg:mx-36 xl:mx-48 lg:my-48">
        <p className="mb-8 font-bold text-2xl relative before:content-[''] before:block before:w-1 pl-4 before:h-full before:bg-blue-600 before:absolute before:left-0 before:top-0">
          Nos derniers articles
        </p>
        <BlogRelativeArticles slugToExclude={""} />
      </section>
    </>
  );
}
