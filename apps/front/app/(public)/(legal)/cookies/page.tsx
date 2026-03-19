import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export async function generateMetadata() {
  return {
    title: `Stage de Parapente - Politique de cookies`,
    description: `Stage de Parapente - Politique de cookies`,
    alternates: {
      canonical: `https://www.serre-chevalier-parapente.fr/cookies`,
    },
  };
}

export default function LegalPage() {
  return (
    <>
      <section>
        <div className="h-[50vh]">
          <Image
            src="/placeholder/hero.webp"
            width={1920}
            height={1080}
            alt="Illustration d'un vol de parapente au dessus de la vallé de Serre chevelier Briançon"
            className="h-full w-full object-cover object-center"
          />
        </div>
        <div className="mx-4 lg:mx-64 mb-16 -translate-y-[20vh]">
          <div className="p-4 md:p-8 rounded-lg  bg-white shadow-lg max-w-[750px] mx-auto -mb-[20vh] prose">
            <Image
              src="/logo/logo-dark-nobg.webp"
              alt="Logo Serre Chevalier Parapente - Stage de Parapente"
              width={214}
              height={214}
              className="block w-24 h-24 mx-auto"
            />
            <h1 className="my-8 text-center text-balance">
              POLITIQUE DE COOKIES
            </h1>
            <span className="text-center text-sm opacity-50 w-full block">
              Dernière mise à jour : 17/05/2025
            </span>
            <div>
              <h2>1. PRÉAMBULE</h2>
              <p>
                La présente politique de cookies explique comment Serre
                Chevalier Parapente utilise des cookies et autres traçeurs sur
                le site https://www.serre-chevalier-parapente.fr/. En naviguant sur le
                site, l’utilisateur accepte l’utilisation des cookies
                conformément à cette politique, sauf s’il a modifié ses
                préférences dans les paramètres de son navigateur.
              </p>

              <h2>2. QU’EST-CE QU’UN COOKIE ?</h2>
              <p>
                Un cookie est un petit fichier texte stocké sur le terminal
                (ordinateur, smartphone, tablette) de l’utilisateur lorsqu’il
                visite un site web. Les cookies permettent notamment de
                reconnaître un utilisateur, d’améliorer son expérience de
                navigation et de collecter des statistiques anonymes sur
                l’utilisation du site.
              </p>

              <h2>3. TYPES DE COOKIES UTILISÉS</h2>
              <p>
                Sur le site https://www.serre-chevalier-parapente.fr/, différents types
                de cookies peuvent être utilisés :
              </p>
              <h3>3.1 Cookies nécessaires au fonctionnement du site</h3>
              <p>
                Ces cookies sont essentiels pour garantir le bon fonctionnement du site et permettre l’accès aux fonctionnalités principales. Ils ne peuvent pas être désactivés.
              </p>
              <h3>3.2 Cookies analytiques et de performance</h3>
              <p>
                Ces cookies permettent de mesurer l’audience et d’analyser la navigation des utilisateurs afin d’améliorer l’expérience sur le site. Ils sont généralement placés par des outils tiers.
              </p>
              <h3>3.3 Cookies de personnalisation</h3>
              <p>
                Si le site propose des options de personnalisation, ces cookies permettent d’adapter le contenu et l’affichage aux préférences de l’utilisateur.
              </p>
              <h3>3.4 Cookies tiers (Stripe, autres outils intégrés)</h3>
              <p>
                Certains services tiers utilisés sur le site peuvent déposer leurs propres cookies pour assurer leur bon fonctionnement. Il s’agit notamment de :
              </p>
              <ul>
                <li>
                  Stripe : Utilisé pour la gestion des paiements et la prévention de la fraude.
                </li>
              </ul>

              <h2>4. GESTION DES COOKIES</h2>
              <p>L’utilisateur peut gérer ses préférences de cookies de plusieurs manières :</p>
              <ul>
                <li>
                  Via les paramètres du navigateur : Il peut configurer son navigateur (Chrome, Firefox, Safari, Edge, etc.) pour bloquer ou supprimer certains cookies.
                </li>
                <li>
                  Via le bandeau de consentement affiché lors de la première visite : Un bandeau de gestion des cookies permet à l’utilisateur d’accepter ou de refuser certains types de cookies.
                </li>
              </ul>

              <h2>5. DURÉE DE CONSERVATION DES COOKIES</h2>
              <p>
                La durée de stockage des cookies varie selon leur nature :
              </p>
              <ul>
                <li>
                  Cookies de session : Supprimés à la fermeture du navigateur.
                </li>
                <li>
                  Cookies persistants : Stockés pour une durée maximale de 5 ans selon les réglementations en vigueur.
                </li>
              </ul>

              <h2>12. CONTACT</h2>
              <p>
                Pour toute question relative à cette politique de
                confidentialité ou pour exercer ses droits, l’utilisateur peut
                contacter :
              </p>
              <ul>
                <li>Email : clementpons5@gmail.com</li>
                <li>Adresse postale : 68 CHEM DE FORTVILLE 05100 BRIANCON</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-4 my-24 lg:mx-36 xl:mx-48 lg:my-48" id="contact">
        <Image
          src="/logo/logo-dark-nobg.webp"
          alt="Logo Serre Chevalier Parapente"
          width={214}
          height={214}
          className="block w-24 h-24 mx-auto"
        />
        <p className="font-bold text-2xl text-slate-900 text-center mt-8">
          Pour toute question relative à la présente politique de
          cookies, vous pouvez contacter Serre Chevalier Parapente à
          l’adresse suivante :
        </p>
        <div className="md:flex md:items-center md:gap-8 mt-8 md:justify-center space-y-4 md:space-y-0">
          <Link
            href={"tel:+330645913595"}
            title="Contatc par téléphone"
            className="block"
          >
            <Button
              variant={"default"}
              size={"lg"}
              className="w-full lg:w-auto"
            >
              Contact par téléphone
            </Button>
          </Link>
          <Link
            href={"mailto:clementpons5@gmail.com"}
            title="Contacter Serre Chevalier Parapente"
            className="block"
          >
            <Button
              variant={"outline"}
              size={"lg"}
              className="w-full lg:w-auto"
            >
              Contact par mail
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
