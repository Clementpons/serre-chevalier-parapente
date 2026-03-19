import { Button } from "@/components/ui/button";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

export async function generateMetadata() {
  return {
    title: `Stage de Parapente - Conditions générales de vente`,
    description: `Stage de Parapente - Conditions générales de vente`,
    alternates: {
      canonical: `https://www.serre-chevalier-parapente.fr/cgv`,
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
              CONDITIONS GÉNÉRALES DE VENTE (CGV)
            </h1>
            <span className="text-center text-sm opacity-50 w-full block">
              Dernière mise à jour : 17/05/2025
            </span>
            <div>
              <h2>1. OBJET</h2>
              <p>
                Les présentes Conditions Générales de Vente (CGV) régissent les
                ventes de prestations de Serre Chevalier Parapente via son site
                internet stage-de-parapente.fr. Elles définissent les droits et
                obligations des parties dans le cadre des réservations
                effectuées en ligne.
              </p>

              <h2>2. IDENTIFICATION DU VENDEUR</h2>
              <p>Nom de la société : Serre Chevalier Parapente</p>
              <p>Forme juridique : Entreprise Individuelle</p>
              <p>Siège social : 68 CHEM DE FORTVILLE 05100 BRIANCON</p>
              <p>Numéro SIRET : 82969102100036</p>
              <p>
                Numéro de TVA intracommunautaire : Non soumis (enseignement)
              </p>
              <p>Contact : clementpons5@gmail.com 06 45 91 35 95</p>

              <h2>3. CARACTÉRISTIQUES DES PRESTATIONS PROPOSÉES</h2>
              <p>
                Prestations proposées à la réservation : stages de parapente de
                5 à 10 jours.
              </p>

              <h2>4. RÉSERVATION ET PROCESSUS DE COMMANDE</h2>
              <h3>4.1 Réservation</h3>
              <p>
                Les réservations s’effectuent via le site internet
                https://www.serre-chevalier-parapente.fr/. L’acheteur sélectionne la
                prestation souhaitée et valide sa commande après avoir pris
                connaissance des présentes CGV.
              </p>
              <h3>4.2 Confirmation de commande</h3>
              <p>
                Toute réservation est confirmée par email après validation du
                paiement. La confirmation vaut preuve de la transaction.
              </p>

              <h2>5. PRIX ET MODALITÉS DE PAIEMENT</h2>
              <h3>5.1 Tarifs </h3>
              <p>
                Les prix des prestations sont indiqués en euros (€) et toutes
                taxes comprises (TTC).
              </p>
              <h3>5.2 Paiement</h3>
              <p>
                Le paiement s’effectue en ligne via Stripe. Les moyens de
                paiement acceptés sont : Carte Bancaire
              </p>
              <h3>5.3 Sécurisation des paiements</h3>
              <p>
                Les transactions sont sécurisées via le protocole SSL et gérées
                par Stripe. Aucune donnée bancaire n’est stockée sur le site.
              </p>

              <h2>6. ANNULATION ET REMBOURSEMENT</h2>
              <h3>6.1 Annulation par le client</h3>
              <p>
                En cas d’annulation avant le stage à l&apos;initiative du client
                l’acompte ne sera pas remboursé, si le client annule durant le
                stage il devra payer les journées réalisées.
              </p>
              <h3>6.2 Annulation par l’organisateur</h3>
              <p>
                Si les conditions de sécurité ne peuvent pas être respectées dû
                à de mauvaises conditions météo et qu’aucun report n’a été
                trouvé. Un minimum de 3 participants par stage doit être remplis
                pour rentrer dans la catégorie stage en groupe, le cas échéant
                il sera proposé au stagiaire de racheter la place du participant
                manquant
              </p>

              <h2>7. OBLIGATIONS DU CLIENT</h2>
              <p>Le client s’engage à :</p>
              <ul>
                <li>Se présenter à l’heure convenue au lieu de rendez-vous.</li>
                <li>
                  Respecter les consignes de sécurité et les conditions
                  d’aptitude physique requises.
                </li>
                <li>
                  Fournir les documents nécessaires (ex. certificat médical,
                  licence FFVL, autorisation parentale pour les mineurs, etc.).
                </li>
              </ul>

              <h2>8. RESPONSABILITÉ</h2>
              <h3>8.1. Responsabilité de l’organisateur</h3>
              <p>
                L’organisateur s’engage à fournir des prestations conformes à la
                description sur le site. Il ne peut être tenu responsable des
                annulations ou modifications imposées par des conditions
                météorologiques ou de sécurité.
              </p>
              <h3>8.2. Responsabilité du client</h3>
              <p>
                Le client est responsable de son matériel personnel et de sa
                conformité aux exigences de l’activité. En cas de comportement
                inadapté ou de non-respect des consignes de sécurité,
                l’organisateur se réserve le droit d’exclure un participant sans
                remboursement.
              </p>

              <h2>9. ASSURANCES</h2>
              <p>
                La pratique du parapente nécessite obligatoirement une assurance
                de responsabilité civile aérienne spécifique, couvrant les
                dommages pouvant être causés à des tiers. Cette assurance n’est
                pas incluse dans le prix du stage.
              </p>
              <p>
                Chaque élève doit y souscrire avant le début du stage. L’école
                propose la souscription directe de cette assurance sur place, au
                moment de l’accueil administratif, selon deux formules :
              </p>
              <ul>
                <li>40 € pour une couverture de 9 jours,</li>
                <li>90 € pour une couverture annuelle.</li>
              </ul>
              <p>
                La souscription se fait avec le moniteur le premier jour de
                stage et est obligatoire. L’école se réserve le droit de refuser
                l’accès aux cours ou aux vols à tout participant non assuré,
                sans possibilité de remboursement du stage.
              </p>
              <p>
                Il est également vivement recommandé aux participants de
                disposer d’une assurance individuelle accident couvrant la
                pratique des sports aériens.
              </p>

              <h2>10. FORCE MAJEURE</h2>
              <p>
                L’école de parapente ne pourra être tenue responsable de
                l’inexécution totale ou partielle de ses obligations si celle-ci
                résulte d’un événement constitutif de force majeure, tel que
                défini par la loi et la jurisprudence française, et incluant
                notamment (sans s’y limiter) : conditions météorologiques
                défavorables, catastrophes naturelles, épidémies, restrictions
                gouvernementales, grèves, incendies, accidents, ou tout autre
                événement imprévisible et indépendant de la volonté de l’école.
              </p>
              <p>
                En cas de force majeure, l’école s’efforcera de proposer un
                report de la prestation à une date ultérieure. Si le report est
                impossible, un avoir ou un remboursement pourra être proposé, au
                cas par cas.
              </p>

              <h2>11. DROIT APPLICABLE ET RÈGLEMENT DES LITIGES</h2>
              <p>
                Les présentes CGV sont soumises au droit français. En cas de
                litige, une résolution amiable sera privilégiée. À défaut
                d’accord, les tribunaux de Gap seront seuls compétents.
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
          Pour toute question relative aux présentes CGV, vous pouvez contacter
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
