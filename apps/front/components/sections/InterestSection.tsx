import "keen-slider/keen-slider.min.css";
import { ChevronRightIcon } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import Slider from "../ui-self/Slider";
import SliderInterest from "../ui-self/sliders/SliderInterest";

export default function InterestSection() {
  const sliderContent = [];

  return (
    <section className="mx-4 my-24 lg:mx-36 xl:mx-48 lg:my-48 lg:flex lg:gap-12 lg:items-center">
      <div className="lg:w-1/2 h-[40vh] xl:h-[50vh] rounded-lg overflow-hidden">
        <SliderInterest />
      </div>
      <div className="mt-8 lg:w-1/2 lg:mt-0">
        <p className="font-bold text-2xl text-slate-800">
          “Je l&apos;ai fait !!”
        </p>
        <p className="text-slate-800 mt-4">
          Soleil levant, léger vent frais sur votre visage. 1500m séparent vos
          pieds du sol. Vous glissez sans bruit dans les airs comme un oiseau.
          La vue est spectaculaire. Seul aux commandes du parapente, tous vos
          sens sont en éveil. Passé et futur s&apos;effacent, vous reconnectez
          enfin avec de vraies émotions.
        </p>
        <p className="text-slate-800 mt-4">
          Ce rêve d&apos;évasion devient enfin accessible. Clément et son équipe
          FFVL s&apos;appuient sur 16 années d&apos;expérience pour vous
          partager une pédagogie à la fois rigoureuse et enthousiaste. Aux
          commandes de voiles sécurisantes et performantes, apprenez à utiliser
          vos ailes sur l&apos;un des plus beaux sites de parapente.
        </p>
        <Link href="#pricing" className="mt-4 inline-block">
          <Button variant="default" size={"lg"} className="gap-2">
            <ChevronRightIcon size={16} />
            J&apos;apprends à voler
          </Button>
        </Link>
      </div>
    </section>
  );
}
