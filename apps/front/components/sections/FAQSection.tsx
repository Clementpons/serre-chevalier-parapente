import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

export default function FAQSection() {
  return (
    <section className="px-4 py-24 lg:px-36 xl:px-48 lg:py-48 relative">
      <div className="w-full relative z-20 bg-slate-50 p-4 xl:p-8 rounded-lg text-slate-900 max-w-[800px] mx-auto">
        <p className="font-bold text-2xl p-2 text-slate-800 text-center">
          Vos questions fréquentes
        </p>
        <Accordion type="single" collapsible className="">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-left">
              Faut-il obligatoirement un diplôme ou brevet pour voler seul
              librement ?
            </AccordionTrigger>
            <AccordionContent className="text-left">
              Non. La FFVL laisse le pilote libre de ses choix. La seule chose
              obligatoire est l’assurance de responsabilité civile en vol. Libre
              à vous de regarder un tuto youtube, acheter une voile sur
              leboncoin et partir voler (ne le faites pas !).
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-left">
              Quand serai-je autonome en vol ?
            </AccordionTrigger>
            <AccordionContent className="text-left">
              <p>Il y a 2 cas distincts :</p>
              <ul className="my-4 space-y-2">
                <li className="before:content-[''] before:block before:w-1 before:h-1 before:bg-slate-900 before:rounded-lg before:absolute before:top-0 before:left-0 before:translate-y-2 relative pl-4">
                  Le “lâché solo” si je vous estime capable décoller, voler et
                  atterrir sans assistance sur nos sites en conditions calmes.
                  Pour 90% des élèves n’ayant aucune pratique préalable, ce
                  niveau est acquis en 10 jours d’apprentissage. Pour les
                  autres, il suffit généralement de 1 à 3 journées
                  supplémentaires pour y arriver.
                </li>
                <li className="before:content-[''] before:block before:w-1 before:h-1 before:bg-slate-900 before:rounded-lg before:absolute before:top-0 before:left-0 before:translate-y-2 relative pl-4">
                  Une autonomie labellisée FFVL qui est réglementée et
                  uniquement délivrée par un moniteur certifié FFVL. Le passage
                  du brevet correspondant (voir ci-dessous) est inclus en fin de
                  stage Progression et Autonomie, sans garantie de réussite.
                </li>
              </ul>
              <p>
                Envoyez-moi un message en bas de page pour plus d’explications à
                ce sujet !
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-left">
              Un vrai brevet à la fin ?
            </AccordionTrigger>
            <AccordionContent className="text-left">
              L’obtention du brevet vert FFVL valide officiellement cette
              autonomie FFVL. Il permet au pratiquant de reprendre sa formation
              là où il l’a arrêté, dans n’importe quelle école FFVL. Il permet
              également de prouver ses compétences de vol s’il se rend dans un
              club FFVL. Enfin, il ouvre la possibilité de passer le brevet
              officiel FFVL suivant (brevet bleu de pilote).
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger className="text-left">
              Est-ce difficile ?
            </AccordionTrigger>
            <AccordionContent className="text-left">
              Au fil des années nous avons affiné une pédagogie approuvée par
              nos élèves. Cette méthode va à l’essentiel selon vos objectifs et
              votre progression. Elle vous offre un maximum de résultats tout en
              garantissant une sécurité optimale à chaque instant. Tout le monde
              apprend à un rythme différent. Nous sommes là pour en tenir compte
              et vous faire progresser sereinement et efficacement.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger className="text-left">
              Quelle dépense supplémentaire dois-je anticiper ?
            </AccordionTrigger>
            <AccordionContent className="text-left">
              Dans toute école, la licence FFVL incluant l’assurance de
              responsabilité civile aérienne est obligatoire. Elle est de 40€
              pour 9 jours ou 94€ pour un an.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-6" className="border-none">
            <AccordionTrigger className="text-left">
              Que se passe-t-il en cas de météo défavorable ?
            </AccordionTrigger>
            <AccordionContent className="text-left">
              Nous vous demandons d’être disponible pendant une semaine complète
              pour 5 jours de stage. Cela nous permet de décaler une journée non
              volée si nécessaire. Si malgré nos efforts les conditions ne
              permettent pas de voler, les journées non pratiquées ne vous sont
              pas facturées (au prorata de la formule choisie : 120 ou 140
              €/jour, voir plus bas). La vallée de Serre-Chevalier offre alors
              un panel d’activités pour vous occuper (randonnées, Grands Bains
              du Monêtier, ski, rafting, canyoning, via ferrata, tyrolienne,
              saut à l&apos;élastique).
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
