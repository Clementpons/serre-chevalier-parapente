import { Button } from "@/components/ui/button";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

export async function generateMetadata() {
  return {
    title: `Stage de Parapente - Mentions légales`,
    description: `Stage de Parapente - Mentions légales`,
    alternates: {
      canonical: `https://www.serre-chevalier-parapente.fr/legal`,
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
            alt="Illustration d&apos;un vol de parapente au dessus de la vallé de Serre chevelier Briançon"
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
            <h1 className="my-8 text-center text-balance">MENTIONS LÉGALES</h1>
            <span className="text-center text-sm opacity-50 w-full block">
              Dernière mise à jour : 17/05/2025
            </span>
            <div>
              <h2>1. ÉDITEUR DU SITE</h2>
              <p>
                Le présent site web https://www.serre-chevalier-parapente.fr/ est édité
                par :
              </p>
              <ul>
                <li>Nom de la société : Serre Chevalier Parapente</li>
                <li>Forme juridique : Entreprise Individuelle</li>
                <li>Capital social : NA</li>
                <li>Siège social : 68 CHEM DE FORTVILLE 05100 BRIANCON</li>
                <li>Numéro SIRET : 82969102100036</li>
                <li>Numéro d&apos;école EFVL : 0190F</li>
                <li>
                  Numéro de TVA intracommunautaire : Non assujettie, prestation
                  pédagogique.
                </li>
                <li>Représentant légal : Pons Clément</li>
                <li>Contact : clementpons5@gmail.com 06 45 91 35 95</li>
              </ul>

              <h2>2. HÉBERGEUR DU SITE</h2>
              <p>Nom de l&apos;hébergeur : Vercel</p>
              <p>Site web : https://www.vercel.com</p>

              <h2>3. PROPRIÉTÉ INTELLECTUELLE</h2>
              <p>
                L’ensemble des éléments présents sur le site
                (stage-de-parapente.fr), notamment les textes, images,
                graphismes, logos, vidéos, architecture, bases de données et
                codes sources, est protégé par le droit de la propriété
                intellectuelle. Toute reproduction, représentation,
                modification, publication, adaptation de tout ou partie des
                éléments du site, quel que soit le moyen ou le procédé utilisé,
                est interdite sans l’autorisation écrite préalable de Serre
                Chevalier Parapente.
              </p>

              <h2>4. RESPONSABILITÉS</h2>
              <p>
                L’éditeur du site s’efforce de fournir des informations aussi
                précises que possible. Toutefois, il ne saurait être tenu
                responsable des omissions, des inexactitudes et des carences
                dans la mise à jour du site.
              </p>
              <p>
                L’utilisateur du site reconnaît disposer des compétences et
                moyens nécessaires pour accéder et utiliser le site. Il
                reconnaît également utiliser ces informations sous sa seule
                responsabilité.
              </p>

              <h2>5. LIENS HYPERTEXTES</h2>
              <p>
                Le site peut contenir des liens hypertextes vers d’autres sites.
                Cependant, Serre Chevalier Parapente n’a pas la possibilité de
                vérifier le contenu de ces sites et n’assumera en conséquence
                aucune responsabilité de ce fait.
              </p>

              <h2>6. COOKIES</h2>
              <p>
                Lors de la consultation du site, des cookies peuvent être
                installés sur l’appareil de l’utilisateur à des fins de
                statistiques et d’amélioration de l’expérience utilisateur. Pour
                en savoir plus, consultez notre Politique de Cookies.
              </p>

              <h2>7. DONNÉES PERSONNELLES</h2>
              <p>
                Les informations recueillies via le site font l’objet d’un
                traitement informatique destiné à la finalité du traitement :
                gestion des commandes, amélioration du service, etc. Pour en
                savoir plus sur la collecte et le traitement des données
                personnelles, consultez notre Politique de Confidentialité.
              </p>

              <h2>8. DROIT APPLICABLE ET JURIDICTION COMPÉTENTE</h2>
              <p>
                Tout litige en relation avec l’utilisation du site est soumis au
                droit français. En cas de litige et à défaut de résolution
                amiable, les tribunaux de Gap seront seuls compétents.
              </p>

              <h2>9. INFORMATIONS SPÉCIFIQUES AUX ACTIVITÉS DE PARAPENTE</h2>
              <h3>Aptitude physique et contre-indications médicales</h3>
              <p>
                Toute contre-indication médicale, qu’elle soit temporaire ou
                partielle, peut faire l’objet d’une demande de dérogation. En
                cas de doute ou d’avis médical négatif, le licencié ou son
                médecin peut contacter les médecins fédéraux nationaux à
                l’adresse suivante :
              </p>
              <ul>
                <li>Parapente : medecinfederalparapente@ffvl.fr</li>
                <li>Delta : medecinfederaldelta@ffvl.fr</li>
                <li>Kite : medecinfederalkite@ffvl.fr</li>
              </ul>
              <p>
                Après examen du dossier et, si nécessaire, un contrôle médical,
                un certificat dérogatoire pourra être délivré. En cas de refus,
                le candidat a la possibilité de saisir la commission de recours,
                composée du médecin fédéral instructeur du dossier, d’un second
                médecin fédéral désigné et d’un médecin choisi par le candidat
                (à ses frais). En l’absence de consensus majoritaire, l’avis
                négatif sera confirmé.
              </p>
              <h3>Conditions météorologiques</h3>
              <p>
                Le professionnel s’engage à ne pas pratiquer le vol biplace ni à
                encadrer des pratiquants dans des conditions aérologiques ou
                topographiques susceptibles de compromettre la sécurité des
                participants en raison d’une prise de risque excessive.
              </p>
              <h3>Assurances</h3>
              <p>
                Les stagiaires sont vivement encouragés à souscrire à l’option
                individuelle accident de la FFVL, la licence de base obligatoire
                pour la pratique du parapente ne couvrant que la responsabilité
                civile (RC) volant.
              </p>
              <h3>Matériel requis</h3>
              <p>
                Chaque participant doit porter une tenue adaptée permettant de
                courir sur terrain varié. Il est également recommandé d’apporter
                des protections solaires et de quoi s’hydrater tout au long de
                la journée.
              </p>
              <h3>Protection des mineurs</h3>
              <p>
                La participation des mineurs est soumise à l’autorisation écrite
                des deux représentants légaux. L’âge minimum requis pour la
                pratique du parapente est fixé à 12 ans.
              </p>
              <h3>Encadrement et qualifications des moniteurs</h3>
              <p>
                Les professionnels encadrant l’activité de parapente répondent
                aux exigences réglementaires françaises en matière d’encadrement
                sportif, notamment en ce qui concerne
              </p>
              <ul>
                <li>
                  Les diplômes et cartes professionnelles obligatoires, déclarés
                  auprès des autorités compétentes.
                </li>
                <li>
                  L’affichage réglementaire des informations légales relatives à
                  l’enseignement et la pratique du parapente.
                </li>
                <li>
                  Le contrôle d’honorabilité imposé par le ministère des Sports.
                </li>
                <li>
                  L’obligation de signalement des comportements inappropriés
                  (racisme, homophobie, discriminations, violences sexuelles)
                  via signalsports@sports.gouv.fr (loi du 8 mars 2024).
                </li>
                <li>
                  Le respect des prérogatives d’encadrement définies par le Code
                  du sport et les arrêtés régissant les diplômes et titres
                  détenus.
                </li>
                <li>
                  L’application stricte des lois et règlements en matière de
                  consommation de substances interdites.
                </li>
                <li>
                  L’obligation de déclaration des accidents à la FFVL et aux
                  services de l’État en cas d’incident grave.
                </li>
              </ul>
              <h3>Responsabilité en cas de perte ou de détérioration</h3>
              <p>
                Le matériel fourni au stagiaire pendant la durée du stage reste
                sous sa responsabilité, à l’exception des phases de vol. Toute
                détérioration ou perte survenant en dehors de ces phases engage
                le stagiaire, qui devra alors rembourser le matériel à sa valeur
                de remplacement auprès de la structure.
              </p>
              <h3>Modalités d’inscription, de paiement et d’annulation</h3>
              <p>
                Information disponible dans les Conditions Générales de Vente.
              </p>
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
          Pour toute question relative aux présentes mentions légales, vous
          pouvez contacter Serre Chevalier Parapente à l’adresse suivante :
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
