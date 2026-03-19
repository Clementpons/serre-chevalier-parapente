import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export async function generateMetadata() {
  return {
    title: `Stage de Parapente - Conditions générales d&apos;utilisation`,
    description: `Stage de Parapente - Conditions générales d&apos;utilisation`,
    alternates: {
      canonical: `https://www.serre-chevalier-parapente.fr/cgu`,
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
            <h1 className="my-8 text-center text-balance">
              CONDITIONS GÉNÉRALES D&apos;UTILISATION (CGU)
            </h1>
            <span className="text-center text-sm opacity-50 w-full block">
              Dernière mise à jour : 17/05/2025
            </span>
            <div>
              <h2>1. OBJET</h2>
              <p>
                Les présentes Conditions Générales d&apos;Utilisation (CGU)
                définissent les règles d’accès et d’utilisation du site
                serre-chevalier-parapente.fr. L’accès et la navigation sur le site
                impliquent l’acceptation pleine et entière des présentes CGU.
              </p>

              <h2>2. IDENTIFICATION DE L&apos;ÉDITEUR DU SITE</h2>
              <p>Nom de la société : Serre Chevalier Parapente</p>
              <p>Forme juridique : Entreprise Individuelle</p>
              <p>Siège social : 68 CHEM DE FORTVILLE 05100 BRIANCON</p>
              <p>Numéro SIRET : 82969102100036</p>
              <p>
                Numéro de TVA intracommunautaire : Non soumis (enseignement)
              </p>
              <p>Contact : clementpons5@gmail.com 06 45 91 35 95</p>

              <h2>3. ACCÈS AU SITE</h2>
              <p>
                Le site est accessible gratuitement à tout utilisateur disposant d’un accès internet. Toutefois, certains services nécessitent une réservation et un paiement (voir CGV). L’éditeur du site se réserve le droit d’interrompre l’accès temporairement pour des raisons de maintenance ou de mise à jour.
              </p>

              <h2>4. CONTENUS ET PROPRIÉTÉ INTELLECTUELLE</h2>
              <p>
                L’ensemble des éléments du site (serre-chevalier-parapente.fr) – textes, images, graphismes, logos, vidéos, codes – est protégé par le droit de la propriété intellectuelle. Toute reproduction, représentation ou exploitation non autorisée est interdite.
              </p>

              <h2>5. RESPONSABILITÉ</h2>
              <h3>5.1 Responsabilité de l’éditeur </h3>
              <p>
                L’éditeur met tout en œuvre pour assurer l’exactitude des informations publiées mais ne peut garantir l’absence d’erreurs ou d’omissions. L’utilisation des informations fournies se fait sous la seule responsabilité de l’utilisateur.
              </p>
              <h3>5.2 Responsabilité de l’utilisateur</h3>
              <p>
                L’utilisateur s’engage à ne pas perturber le bon fonctionnement du site et à respecter les lois en vigueur. Tout usage frauduleux ou abusif pourra entraîner des sanctions et/ou la suspension de l’accès au site.
              </p>

              <h2>6. LIENS HYPERTEXTES</h2>
              <p>
                Le site peut contenir des liens vers des sites tiers. Serre Chevalier Parpaente ne saurait être tenu responsable du contenu ou de la politique de confidentialité de ces sites externes.
              </p>

              <h2>7. COOKIES ET DONNÉES PERSONNELLES</h2>
              <p>L’utilisateur est informé que des cookies analytiques sont utilisés pour améliorer l’expérience utilisateur. Pour plus d’informations, consulter la Politique de Confidentialité et la Politique de Cookies disponibles en pied de page.</p>

              <h2>8. MODIFICATION DES CGU</h2>
              <p>
                Serre Chevalier Parapente se réserve le droit de modifier les présentes CGU à tout moment. La version applicable est celle accessible en ligne à la date d’utilisation du site.
              </p>

              <h2>9. DROIT APPLICABLE ET JURIDICTION COMPÉTENTE</h2>
              <p>
                Les présentes CGU sont soumises au droit français. Tout litige sera soumis aux tribunaux compétents de Gap.
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
          Pour toute question relative aux présentes CGU, vous pouvez contacter
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
