import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

export default function FAQBiPlacesSection() {
  return (
    <section className="px-4 py-24 lg:px-36 xl:px-48 lg:py-48 relative">
      <div className="w-full relative z-20 bg-slate-50 p-4 xl:p-8 rounded-lg text-slate-900 max-w-[800px] mx-auto">
        <p className="font-bold text-2xl p-2 text-slate-800 text-center text-balance">
          Vos questions les plus fréquentes sur les baptême bi-place en
          parapente
        </p>
        <Accordion type="single" defaultValue="item-1" collapsible className="">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-left">
              Qui peut faire un baptême en parapente ?
            </AccordionTrigger>
            <AccordionContent className="text-left border-l border-slate-900 pl-4 pb-2 mb-4">
              <p>
                Bonne nouvelle : le baptême en parapente biplace est accessible
                à presque tout le monde, dès lors qu’il n’y a pas de
                contre-indication médicale particulière.
              </p>
              <p className="mt-4">
                Pas besoin d’être sportif, ni adepte de sensations fortes. Le
                vol s’adapte à votre profil : enfants, adultes, seniors,
                personnes en situation de handicap… chacun peut vivre cette
                expérience à sa façon.
              </p>
              <ul className="my-4 space-y-2 pl-4">
                <li className="before:content-[''] before:block before:w-1 before:h-1 before:bg-slate-900 before:rounded-lg before:absolute before:top-0 before:left-0 before:translate-y-2 relative pl-4">
                  Enfants : dès qu’ils en ont envie et qu’ils en font la demande
                  eux-mêmes
                </li>
                <li className="before:content-[''] before:block before:w-1 before:h-1 before:bg-slate-900 before:rounded-lg before:absolute before:top-0 before:left-0 before:translate-y-2 relative pl-4">
                  Personnes âgées : il suffit de pouvoir courir quelques pas sur
                  un terrain légèrement irrégulier
                </li>
                <li className="before:content-[''] before:block before:w-1 before:h-1 before:bg-slate-900 before:rounded-lg before:absolute before:top-0 before:left-0 before:translate-y-2 relative pl-4">
                  Personnes en situation de handicap : nous proposons des vols
                  en chariot pour les personnes à mobilité réduite. N'hésitez
                  pas à nous contacter pour en discuter ensemble.
                </li>
              </ul>
              <p className="mt-4">
                Notre équipe adapte toujours sa manière de voler à votre âge,
                votre condition physique et vos envies du moment, pour que
                l’expérience soit confortable, rassurante et inoubliable.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-left">
              Quelle tenue prévoir ?
            </AccordionTrigger>
            <AccordionContent className="text-left border-l border-slate-900 pl-4 pb-2 mb-4">
              <p>
                Même si le vol se déroule souvent en plein soleil, on vole en
                altitude, parfois au-dessus de 2000 mètres. Il peut y faire plus
                frais qu’en vallée, même l’été. Voici ce que nous vous
                conseillons :
              </p>
              <ul className="my-4 space-y-2 pl-4">
                <li className="before:content-[''] before:block before:w-1 before:h-1 before:bg-slate-900 before:rounded-lg before:absolute before:top-0 before:left-0 before:translate-y-2 relative pl-4">
                  Un pantalon long (évitez les shorts, même par temps chaud)
                </li>
                <li className="before:content-[''] before:block before:w-1 before:h-1 before:bg-slate-900 before:rounded-lg before:absolute before:top-0 before:left-0 before:translate-y-2 relative pl-4">
                  Un pull ou une polaire légère
                </li>
                <li className="before:content-[''] before:block before:w-1 before:h-1 before:bg-slate-900 before:rounded-lg before:absolute before:top-0 before:left-0 before:translate-y-2 relative pl-4">
                  Une veste coupe-vent, surtout si le créneau est tôt le matin
                  ou en fin de journée
                </li>
                <li className="before:content-[''] before:block before:w-1 before:h-1 before:bg-slate-900 before:rounded-lg before:absolute before:top-0 before:left-0 before:translate-y-2 relative pl-4">
                  Des chaussures fermées avec une bonne tenue de pied : baskets
                  de trail, chaussures de rando légères ou running
                </li>
                <li className="before:content-[''] before:block before:w-1 before:h-1 before:bg-slate-900 before:rounded-lg before:absolute before:top-0 before:left-0 before:translate-y-2 relative pl-4">
                  Vous pouvez aussi prévoir une paire de lunettes de soleil avec
                  un cordon.
                </li>
              </ul>
              <p className="mt-4">
                Vous pourrez laisser vos effets personnels au sol pour être
                l’esprit libre pendant le vol.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-left">
              Est-ce qu’on a le vertige ?
            </AccordionTrigger>
            <AccordionContent className="text-left border-l border-slate-900 pl-4 pb-2 mb-4">
              <p>Non, on ne ressent pas le vertige en parapente.</p>
              <p className="mt-4">
                Le vertige apparaît uniquement lorsque votre corps est en
                contact avec le sol et que votre cerveau perçoit un déséquilibre
                (comme en regardant dans le vide depuis un balcon ou une
                falaise).
              </p>
              <p className="mt-4">
                En vol, cette sensation disparaît complètement : vous êtes
                assis, porté par l’air, sans point de repère fixe sous les
                pieds.
              </p>
              <p className="mt-4">
                Résultat : même les personnes sensibles au vertige sont souvent
                agréablement surprises par la douceur et le confort du vol.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger className="text-left">
              Combien de temps dure un vol ?
            </AccordionTrigger>
            <AccordionContent className="text-left border-l border-slate-900 pl-4 pb-2 mb-4">
              <p>
                Nous proposons plusieurs formats de{" "}
                <strong>baptême en parapente biplace à Serre-Chevalier</strong>,
                il y en a pour tous les goûts :
              </p>
              <ul className="my-4 space-y-2 pl-4">
                <li className="before:content-[''] before:block before:w-1 before:h-1 before:bg-slate-900 before:rounded-lg before:absolute before:top-0 before:left-0 before:translate-y-2 relative pl-4">
                  <p>
                    <span className="font-bold">Vol P’tit Loup</span>– Moins de
                    10 minutes
                  </p>
                  <p>
                    Idéal pour les enfants, une toute première approche en
                    douceur.
                  </p>
                </li>
                <li className="before:content-[''] before:block before:w-1 before:h-1 before:bg-slate-900 before:rounded-lg before:absolute before:top-0 before:left-0 before:translate-y-2 relative pl-4">
                  <p>
                    <span className="font-bold">Vol Aventure</span>– Environ 15
                    minutes
                  </p>
                  <p>
                    Le format le plus populaire, parfait pour découvrir les
                    sensations du vol libre.
                  </p>
                </li>
                <li className="before:content-[''] before:block before:w-1 before:h-1 before:bg-slate-900 before:rounded-lg before:absolute before:top-0 before:left-0 before:translate-y-2 relative pl-4">
                  <p>
                    <span className="font-bold">Vol de Durée</span>– Environ 30
                    minutes
                  </p>
                  <p>
                    Pour avoir le temps de contempler, et profiter pleinement du
                    paysage.
                  </p>
                </li>
                <li className="before:content-[''] before:block before:w-1 before:h-1 before:bg-slate-900 before:rounded-lg before:absolute before:top-0 before:left-0 before:translate-y-2 relative pl-4">
                  <p>
                    <span className="font-bold">Vol Grande Durée</span>– 45
                    minutes à 1 heure
                  </p>
                  <p>
                    Une vraie immersion pour les curieux, les contemplatifs ou
                    ceux qui veulent vivre l’expérience à fond.
                  </p>
                </li>
                <li className="before:content-[''] before:block before:w-1 before:h-1 before:bg-slate-900 before:rounded-lg before:absolute before:top-0 before:left-0 before:translate-y-2 relative pl-4">
                  <p>
                    <span className="font-bold">Vol Hiver</span>– 1000m de
                    dénivelé
                  </p>
                  <p>
                    Pour découvrir le domaine skiable et les sommets enneigés
                    sous un angle que vous ne verrez qu’ici.
                  </p>
                </li>
              </ul>
              <p className="mt-4">
                La durée exacte du vol dépend des conditions météo, du site
                utilisé, de la formule choisie, et parfois de votre confort en
                l’air.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger className="text-left">
              Peut-on annuler ou reporter ?
            </AccordionTrigger>
            <AccordionContent className="text-left border-l border-slate-900 pl-4 pb-2 mb-4">
              <p>
                Non, vous ne pouvez pas annuler ou reporter un vol de votre
                propre initiative.
              </p>
              <p className="mt-4">
                Une fois votre créneau réservé, il est important de respecter
                l’organisation mise en place.
              </p>
              <p className="mt-4">
                Nos moniteurs construisent chaque journée de vols en fonction de
                la météo, des créneaux disponibles, du matériel et de la
                logistique (transport, rotation, équipes... ).
              </p>
              <p className="mt-4">
                Un changement unilatéral peut désorganiser l’ensemble du
                planning et impacter d’autres participants.
              </p>
              <p className="mt-4">
                En revanche, si les conditions météo ne sont pas favorables ou
                que la sécurité n’est pas garantie, c’est nous qui vous
                contacterons pour proposer un report ou une annulation sans
                frais.
              </p>
              <p className="mt-4">
                Merci de votre compréhension : c’est grâce à ce respect
                collectif que nous pouvons faire voler chacun dans les
                meilleures conditions possibles.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-6">
            <AccordionTrigger className="text-left">
              Que se passe-t-il si la météo est mauvaise ?
            </AccordionTrigger>
            <AccordionContent className="text-left border-l border-slate-900 pl-4 pb-2 mb-4">
              <p>
                Le parapente dépend entièrement des conditions aérologiques, et en montagne, la météo peut changer rapidement.
              </p>
              <p className="mt-4">
                En cas de conditions défavorables (vent fort, pluie, instabilité…), nous reportons ou annulons le vol sans frais, toujours dans une logique de sécurité avant tout.
              </p>
              <p className="mt-4">
                Vous êtes informé la veille de votre vol, entre 18h et 20h, par SMS. Ce message vous confirme le maintien du vol, ou vous propose un ajustement de créneau voir une nouvelle date si nécessaire.
              </p>
              <p className="mt-4">
                Notre équipe suit de près l’évolution des conditions pour ne vous faire voler que lorsque les conditions sont réunies pour un vol sûr et agréable.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <Image
        src="/placeholder/section_faq.webp"
        alt="Faire du parapente dans la vallée de Serre Chevalier Briançon"
        width={1920}
        height={1080}
        className="absolute block w-full h-full object-cover object-center top-0 left-0"
      />
    </section>
  );
}
