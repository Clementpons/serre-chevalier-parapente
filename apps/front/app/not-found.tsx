"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Mountain, Plane } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { CartSidebar } from "@/components/cart/CartSidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LucideMenu } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotFound() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpened, setIsMenuOpened] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative">
      {/* Header copié du layout public */}
      <header className="relative">
        <Link
          href={"/"}
          title="Page d'accueil de l'école Serre Chevalier Parapente"
          className={`bg-slate-800 w-12 md:w-16 lg:w-24 h-12 md:h-16 lg:h-24 p-0.5 2xl:p-1 z-[70] transition-all duration-300 rounded-full
        ${isScrolled ? "fixed left-4 top-4" : "fixed left-4 top-[6vh]"}
        `}
        >
          <Image
            src={"/logo/logo-light-nobg.webp"}
            width={70}
            height={70}
            alt="Logo Parapente à Serre Chevalier"
            className="w-full"
            priority
          />
        </Link>
        {/* Panier */}
        <div
          className={`z-[70] transition-all duration-300 ${isScrolled ? "fixed right-16 top-2" : "fixed right-20 top-[6vh]"}`}
        >
          <CartSidebar isScrolled={isScrolled} />
        </div>

        <DropdownMenu open={isMenuOpened} onOpenChange={setIsMenuOpened}>
          <DropdownMenuTrigger asChild>
            <Button
              variant={"outline"}
              size={"icon"}
              title="Ouvrir le menu de navigation"
              className={`m-2 p-0.5 2xl:p-1 z-[70] transition-all duration-300 rounded-full
        ${isScrolled ? "fixed right-2 top-2" : "fixed right-4 top-[6vh]"}
        `}
            >
              <LucideMenu className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem
              onClick={() => {
                setIsMenuOpened(false);
              }}
            >
              <Link href="/" className="block w-full">
                Accueil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setIsMenuOpened(false);
              }}
            >
              <Link href="/bi-places" className="block w-full">
                Baptêmes
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setIsMenuOpened(false);
              }}
            >
              <Link href="/nos-stages" className="block w-full">
                Nos stages
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setIsMenuOpened(false);
              }}
            >
              <Link href="/reserver" className="block w-full">
                Réserver
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setIsMenuOpened(false);
              }}
            >
              <Link href="/blog" className="block w-full">
                Blog
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Link
          href={"/#pricing"}
          title="Profitez de l'offre promo dès maintenant !"
          className="bg-blue-800 w-full h-[5vh] lg:h-auto text-center flex items-center justify-center lg:block lg:p-2 px-4 absolute left-0 top-0 z-[60]"
        >
          <p className="text-xs md:text-sm text-slate-50">
            <span className="font-semibold">Offre spéciale</span> avant
            augmentation des tarifs ! Nombre de places limitées
          </p>
        </Link>
        <div
          className={cn(
            "w-screen h-screen bg-slate-950/70 fixed top-0 left-0 z-50",
            isMenuOpened ? "block" : "hidden",
          )}
        ></div>
      </header>

      {/* Contenu de la page 404 */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Illustration */}
          <div className="text-8xl">🏔️</div>

          {/* Titre et message */}
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-slate-900">404</h1>
            <h2 className="text-2xl font-semibold text-slate-700">
              Oups ! Page introuvable
            </h2>
            <p className="text-slate-600">
              Il semble que cette page ait pris son envol sans vous. Ne vous
              inquiétez pas, retournons vers les sommets !
            </p>
          </div>

          {/* Boutons de navigation */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Link href="/nos-stages">
                <Button variant="outline" size="lg" className="w-full">
                  <Mountain className="w-5 h-5 mr-2" />
                  Découvrir nos stages
                </Button>
              </Link>

              <Link href="/bi-places">
                <Button variant="outline" size="lg" className="w-full">
                  <Plane className="w-5 h-5 mr-2" />
                  Réserver un bi-place
                </Button>
              </Link>
            </div>
            <Link href="/">
              <Button
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Home className="w-5 h-5 mr-2" />
                Retour à l'accueil
              </Button>
            </Link>
          </div>

          {/* Message supplémentaire */}
          <p className="text-sm text-slate-500">
            Si vous pensez que c'est une erreur, n'hésitez pas à nous contacter.
          </p>
        </div>
      </div>
    </div>
  );
}
