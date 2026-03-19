import { Button } from "@/components/ui/button";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

export async function generateMetadata() {
  return {
    title: `Stage de Parapente - Politique de confidentialité`,
    description: `Stage de Parapente - Politique de confidentialité`,
    alternates: {
      canonical: `https://www.serre-chevalier-parapente.fr/privacy`,
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
              POLITIQUE DE CONFIDENTIALITÉ
            </h1>
            <span className="text-center text-sm opacity-50 w-full block">
              Dernière mise à jour : 17/05/2025
            </span>
            <div>
              <h2>1. PRÉAMBULE</h2>
              <p>
                La présente politique de confidentialité a pour but d’informer
                les utilisateurs du site https://www.serre-chevalier-parapente.fr/ sur
                la collecte, l’utilisation et la protection de leurs données
                personnelles. Serre Chevalier Parapente s’engage à traiter les
                données personnelles conformément aux réglementations en
                vigueur, notamment le Règlement Général sur la Protection des
                Données (RGPD) et la loi Informatique et Libertés.
              </p>

              <h2>2. RESPONSABLE DU TRAITEMENT</h2>
              <p>Nom de la société : Serre Chevalier Parapente</p>
              <p>Forme juridique : Entreprise Individuelle</p>
              <p>Représentant légal : Pons Clément</p>
              <p>Siège social : 68 CHEM DE FORTVILLE 05100 BRIANCON</p>
              <p>Numéro SIRET : 82969102100036</p>
              <p>
                Numéro de TVA intracommunautaire : Non soumis (enseignement)
              </p>
              <p>Contact : clementpons5@gmail.com 06 45 91 35 95</p>

              <h2>3. DONNÉES PERSONNELLES COLLECTÉES</h2>
              <p>
                Lors de l’utilisation du site, différentes catégories de données
                personnelles peuvent être collectées :
              </p>
              <ul>
                <li>
                  Données fournies lors des réservations :
                  <ul>
                    <li>Nom</li>
                    <li>Prénom</li>
                    <li>Adresse e-mail</li>
                    <li>Numéro de téléphone</li>
                    <li>Poids</li>
                    <li>Taille</li>
                  </ul>
                </li>
                <li>Données collectées automatiquement : Aucunes</li>
              </ul>

              <h2>4. FINALITÉS DU TRAITEMENT DES DONNÉES</h2>
              <p>Les données personnelles collectées sont utilisées pour :</p>
              <ul>
                <li>
                  Gérer les réservations et paiements : Traitement de vos
                  réservations par l’administrateur.
                </li>
              </ul>

              <h2>5. BASE LÉGALE DU TRAITEMENT</h2>
              <p>
                Le traitement des données personnelles repose sur les bases
                légales suivantes :
              </p>
              <ul>
                <li>
                  Exécution d’un contrat : Gestion des réservations et paiements
                </li>
                <li>
                  Intérêt légitime : Amélioration du site via l’analyse
                  d’audience
                </li>
                <li>
                  Obligation légale : Conservation des factures et des
                  transactions financières
                </li>
              </ul>

              <h2>6. DURÉE DE CONSERVATION DES DONNÉES</h2>
              <p>Les données personnelles sont conservées pendant :</p>
              <ul>
                <li>
                  15 ans pour les données de réservation et de facturation
                  (conformément aux obligations légales et fiscales)
                </li>
                <li>
                  15 ans pour les données analytiques (selon les recommandations
                  de Google Analytics et Google Ads)
                </li>
                <li>5 ans pour les logs et journaux de connexion techniques</li>
              </ul>

              <h2>7. DESTINATAIRES DES DONNÉES</h2>
              <p>Les données collectées peuvent être partagées avec :</p>
              <ul>
                <li>Les prestataires techniques : Stripe</li>
                <li>Les plateformes de paiement : Stripe</li>
                <li>
                  Les autorités administratives et judiciaires : En cas
                  d’obligation légale
                </li>
              </ul>

              <h2>8. SÉCURITÉ DES DONNÉES</h2>
              <p>
                Serre Chevalier Parapente met en place des mesures de sécurité
                adaptées pour protéger les données personnelles contre tout
                accès, modification, divulgation ou destruction non autorisée.
                Ces mesures comprennent :
              </p>
              <ul>
                <li>Cryptage des transactions Stripe</li>
                <li>Sauvegardes régulières</li>
                <li>
                  Accès restreint aux données uniquement aux personnes
                  autorisées
                </li>
                <li>
                  Surveillance des systèmes et protection contre les
                  cyberattaque
                </li>
              </ul>

              <h2>9. DROITS DES UTILISATEURS</h2>
              <p>
                Conformément au RGPD, les utilisateurs disposent des droits
                suivants sur leurs données personnelles :
              </p>
              <ul>
                <li>
                  Droit d’accès : Demander une copie des données personnelles
                  détenues
                </li>
                <li>
                  Droit de rectification : Corriger des données inexactes ou
                  incomplètes
                </li>
                <li>
                  Droit à l’effacement : Demander la suppression des données
                  sous certaines conditions
                </li>
                <li>
                  Droit à la limitation du traitement : Restreindre
                  temporairement l’utilisation des données
                </li>
                <li>
                  Droit d’opposition : S’opposer à certains traitements de
                  données analytiques
                </li>
              </ul>
              <p>
                Pour exercer ces droits, l’utilisateur peut contacter clementpons5@gmail.com en précisant son identité et la nature de la demande.
              </p>

              <h2>10. COOKIES ET TRACEURS</h2>
              <p>
                Lors de la navigation sur le site, des cookies peuvent être déposés sur l’appareil de l’utilisateur. Ces cookies permettent de :
              </p>
              <ul>
                <li>
                  Mesurer l’audience et analyser la navigation (Google Analytics, Google Ads)
                </li>
                <li>
                  Garantir le bon fonctionnement du site (Cookies techniques nécessaires)
                </li>
              </ul>
              <p>
                L’utilisateur peut gérer ses préférences en matière de cookies via Politique de cookies.
              </p>

              <h2>
                11. MODIFICATION DE LA POLITIQUE DE CONFIDENTIALITÉ
              </h2>
              <p>
                Serre Chevalier Parapente se réserve le droit de modifier la présente politique à tout moment pour assurer sa conformité aux évolutions légales et aux bonnes pratiques. Les utilisateurs seront informés en cas de modifications majeures.
              </p>

              <h2>
                12. CONTACT
              </h2>
              <p>
                Pour toute question relative à cette politique de confidentialité ou pour exercer ses droits, l’utilisateur peut contacter :
              </p>
              <ul>
                <li>
                  Email : clementpons5@gmail.com
                </li>
                <li>
                  Adresse postale : 68 CHEM DE FORTVILLE 05100 BRIANCON
                </li>
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
          Pour toute question relative à la présente politique de confidentialité, vous pouvez contacter
          Serre Chevalier Parapente à l’adresse suivante :
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
