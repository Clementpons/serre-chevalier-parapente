"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

export default function TimelineSection() {
  const [activeSteps, setActiveSteps] = useState<number[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;

      const timelineElement = timelineRef.current;
      const rect = timelineElement.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how much of the timeline is visible
      const timelineTop = rect.top;
      const timelineHeight = rect.height;
      const timelineBottom = rect.bottom;
      
      // Start animation when timeline enters viewport
      if (timelineBottom > 0 && timelineTop < windowHeight) {
        // Calculate progress (0 to 1)
        const visibleTop = Math.max(0, windowHeight - timelineTop);
        const visibleHeight = Math.min(visibleTop, timelineHeight);
        const progress = Math.min(visibleHeight / timelineHeight, 1);
        
        // Activate steps based on progress
        const newActiveSteps: number[] = [];
        if (progress > 0.1) newActiveSteps.push(1);
        if (progress > 0.35) newActiveSteps.push(2);
        if (progress > 0.65) newActiveSteps.push(3);
        if (progress > 0.9) newActiveSteps.push(4);
        
        setActiveSteps(newActiveSteps);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate line height based on active steps
  const getLineHeight = () => {
    if (activeSteps.includes(4)) return 100;
    if (activeSteps.includes(3)) return 75;
    if (activeSteps.includes(2)) return 50;
    if (activeSteps.includes(1)) return 25;
    return 0;
  };

  return (
    <section className="mx-4 my-24 lg:mx-36 xl:mx-48 lg:my-48">
      <div className="relative" ref={timelineRef}>
        {/* Timeline background line (slate) */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-300 hidden md:block"></div>
        
        {/* Timeline progress line (blue) */}
        <div 
          className="absolute left-8 top-0 w-0.5 bg-blue-600 hidden md:block transition-all duration-700 ease-out"
          style={{ height: `${getLineHeight()}%` }}
        ></div>
        
        {/* Étape 1: Réservation et confirmation */}
        <div className="relative mb-16 md:mb-24">
          <div className="flex items-start">
            <div className={`hidden md:flex items-center justify-center w-16 h-16 rounded-full font-bold text-xl mr-8 flex-shrink-0 relative z-10 transition-all duration-500 ${
              activeSteps.includes(1) 
                ? 'bg-blue-600 text-white transform scale-110' 
                : 'bg-slate-300 text-slate-600'
            }`}>
              1
            </div>
            <div className="flex-1">
              <div className={`md:hidden w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center mb-4 transition-all duration-500 ${
                activeSteps.includes(1) 
                  ? 'bg-blue-600 text-white transform scale-110' 
                  : 'bg-slate-300 text-slate-600'
              }`}>
                1
              </div>
              <h3 className="font-bold text-2xl text-slate-800 mb-4">
                Réservation et confirmation
              </h3>
              <div className="space-y-4 text-slate-800">
                <p>
                  Choisir et réserver votre baptême parapente biplace à Serre-Chevalier est simple et rapide.
                  Commencez par sélectionner le vol qui vous convient le mieux parmi nos différents baptêmes.
                </p>
                <p>
                  Une fois votre créneau choisi, il vous suffit de réserver en ligne. Vous recevez alors une notification immédiate confirmant votre inscription.
                </p>
                <p>
                  La veille du vol, entre 18h et 20h, vous recevrez un SMS de confirmation avec tous les détails pratiques : heure exacte, lieu de rendez-vous, équipement à prévoir… Si vous n'avez pas reçu ce message passé 20h, n'hésitez pas à nous appeler.
                </p>
                <div className="bg-slate-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                  <p className="text-slate-800 font-medium">
                    À noter : le parapente dépend étroitement des conditions météo. Il est possible que l'horaire soit ajusté pour garantir les meilleures conditions de vol. Nous vous conseillons de garder en tête un ou deux créneaux de report, au cas où la météo nécessite un décalage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Étape 2: Arrivée sur le site et briefing */}
        <div className="relative mb-16 md:mb-24">
          <div className="flex items-start">
            <div className={`hidden md:flex items-center justify-center w-16 h-16 rounded-full font-bold text-xl mr-8 flex-shrink-0 relative z-10 transition-all duration-500 ${
              activeSteps.includes(2) 
                ? 'bg-blue-600 text-white transform scale-110' 
                : 'bg-slate-300 text-slate-600'
            }`}>
              2
            </div>
            <div className="flex-1">
              <div className={`md:hidden w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center mb-4 transition-all duration-500 ${
                activeSteps.includes(2) 
                  ? 'bg-blue-600 text-white transform scale-110' 
                  : 'bg-slate-300 text-slate-600'
              }`}>
                2
              </div>
              <h3 className="font-bold text-2xl text-slate-800 mb-4">
                Arrivée sur le site et briefing
              </h3>
              <div className="space-y-4 text-slate-800">
                <p>
                  Le jour de votre baptême, rendez-vous au parking des Carines, au pied du col du Granon. C'est là que vous retrouvez notre équipe, les moniteurs et parfois quelques autres passagers déjà dans l'ambiance... Un peu d'excitation, beaucoup de sourires.
                </p>
                <p>
                  Une fois le groupe réuni, nous vous présentons le déroulement de l'activité, étape par étape:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Combien de temps dure la montée et la préparation</li>
                  <li>Quelle voile correspond à quel moniteur, pour vous repérer facilement</li>
                  <li>Et bien sûr, nous répondons à toutes vos questions</li>
                </ul>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                  <p>
                    Pendant ce temps, les accompagnants restent à l'atterrissage, une zone dégagée et agréable qui offre une vue parfaite sur votre vol, du décollage à l'atterrissage.
                  </p>
                  <p className="mt-2">
                    Vous, vous prenez place dans notre navette, direction le décollage. Le briefing technique est réalisé sur place, juste avant le vol, dans une ambiance détendue mais concentrée, avec votre moniteur à vos côtés.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Étape 3: Décollage et vol */}
        <div className="relative mb-16 md:mb-24">
          <div className="flex items-start">
            <div className={`hidden md:flex items-center justify-center w-16 h-16 rounded-full font-bold text-xl mr-8 flex-shrink-0 relative z-10 transition-all duration-500 ${
              activeSteps.includes(3) 
                ? 'bg-blue-600 text-white transform scale-110' 
                : 'bg-slate-300 text-slate-600'
            }`}>
              3
            </div>
            <div className="flex-1">
              <div className={`md:hidden w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center mb-4 transition-all duration-500 ${
                activeSteps.includes(3) 
                  ? 'bg-blue-600 text-white transform scale-110' 
                  : 'bg-slate-300 text-slate-600'
              }`}>
                3
              </div>
              <h3 className="font-bold text-2xl text-slate-800 mb-4">
                Décollage et vol
              </h3>
              <div className="space-y-4 text-slate-800">
                <p>
                  Arrivé sur le site de décollage, souvent perché à plus de 2000 mètres d'altitude, vous prenez une grande bouffée d'air pur. Le silence, la vue dégagée sur la vallée, la lumière du jour sur les sommets… Tout invite à lâcher prise. C'est un moment suspendu, hors du temps.
                </p>
                <p>
                  Votre moniteur vous équipe : une sellette confortable, un casque, un dernier point météo. Puis vient le briefing. En quelques mots simples, il vous explique :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Comment prendre appui pour gonfler la voile,</li>
                  <li>De rester debout jusqu'à l'ordre de s'asseoir,</li>
                  <li>Et surtout : se laisser porter, profiter.</li>
                </ul>
                <p>
                  Quelques pas… et vous quittez le sol en douceur. Pas de secousse, pas de saut : juste cette sensation incroyable d'être porté, comme sur un coussin d'air.
                </p>
                <p>
                  Le vol commence. Il est silencieux, fluide, incroyablement apaisant. Vous êtes confortablement installé, votre moniteur gère la trajectoire. Vous pouvez discuter, observer, poser vos questions… ou simplement vous laisser émerveiller.
                </p>
                
                <div className="bg-gradient-to-r from-slate-50 to-slate-50 border border-slate-200 p-6 rounded-lg">
                  <h4 className="font-bold text-lg text-slate-800 mb-3">Et côté sensations ?</h4>
                  <p className="mb-3">
                    Le baptême bi-place, ce n'est ni une chute libre, ni un manège. C'est doux, naturel, progressif.
                  </p>
                  <p className="mb-3">
                    Mais si vous aimez un peu d'adrénaline, votre pilote peut ajouter quelques virages dynamiques en fin de vol. Uniquement si vous le souhaitez.
                  </p>
                  <p className="text-slate-800 font-medium">
                    La sécurité, elle, reste non négociable : tout notre matériel est récent, contrôlé, homologué. Tous les moniteurs sont diplômés d'État, formés à la pédagogie et au pilotage de précision.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Étape 4: Atterrissage et photos */}
        <div className="relative">
          <div className="flex items-start">
            <div className={`hidden md:flex items-center justify-center w-16 h-16 rounded-full font-bold text-xl mr-8 flex-shrink-0 relative z-10 transition-all duration-500 ${
              activeSteps.includes(4) 
                ? 'bg-blue-600 text-white transform scale-110' 
                : 'bg-slate-300 text-slate-600'
            }`}>
              4
            </div>
            <div className="flex-1">
              <div className={`md:hidden w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center mb-4 transition-all duration-500 ${
                activeSteps.includes(4) 
                  ? 'bg-blue-600 text-white transform scale-110' 
                  : 'bg-slate-300 text-slate-600'
              }`}>
                4
              </div>
              <h3 className="font-bold text-2xl text-slate-800 mb-4">
                Atterrissage et photos
              </h3>
              <div className="space-y-4 text-slate-800">
                <p>
                  Après votre vol riche, le retour au sol se fait en douceur. L'atterrissage a lieu dans une grande prairie dégagée, au pied du col du Granon.
                </p>
                <p>
                  Votre moniteur vous indique simplement de vous redresser et de marcher quelques pas à l'arrivée. Parfois, la voile conserve un peu de vitesse : c'est volontaire, cette énergie est utilisée pour se poser proprement.
                </p>
                <p>
                  Une fois les pieds à terre, les émotions remontent. Joie, fierté, apaisement… et souvent, l'envie immédiate de recommencer.
                </p>
                
                <div className="bg-gradient-to-r from-slate-50 to-slate-50 border border-slate-200 p-6 rounded-lg">
                  <h4 className="font-bold text-lg text-slate-800 mb-3">Des souvenirs à revivre et à partager</h4>
                  <p className="mb-3">
                    Si vous le souhaitez, vous pouvez ajouter une option photo/vidéo à votre baptême parapente biplace (25 €). Grâce à une GoPro embarquée, le moniteur filme tout au long du vol : votre regard, les panoramas, le décollage, les éventuelles figures… sans rien vous demander de plus que de profiter.
                  </p>
                  <p className="mb-3">
                    Les images sont ensuite envoyées par WeTransfer, le soir-même ou le lendemain.
                  </p>
                  <p className="text-slate-800 font-medium">
                    Un beau moyen de revivre votre vol ou de le partager avec vos proches.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}