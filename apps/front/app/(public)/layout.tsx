"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { LucideMenu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CartSidebar } from "@/components/cart/CartSidebar";
import TopBar from "@/components/layout/TopBar";
declare const window: any;

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
            {/* <DropdownMenuItem
              onClick={() => {
                setIsMenuOpened(false);
              }}
            >
              <Link href="/reserver/bon-cadeau" className="w-full flex items-center justify-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-md">
              <LucideGift className="inline mr-2 size-4" />
                Offrir un bon cadeau
              </Link>
            </DropdownMenuItem> */}
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
        <TopBar />
        <div
          className={cn(
            "w-screen h-screen bg-slate-950/70 fixed top-0 left-0 z-50",
            isMenuOpened ? "block" : "hidden",
          )}
        ></div>
      </header>
      {children}
      <footer className="bg-slate-900 border-b-[1vh] border-blue-700 md:flex justify-between items-center px-4 py-24 lg:px-36 xl:px-48">
        <div className="md:flex gap-4 text-slate-50 items-center">
          <div className="flex md:flex-col items-center gap-4 justify-center">
            <Image
              src={"/logo/logo-light-nobg.webp"}
              width={70}
              height={70}
              alt="Logo Parapente à Serre Chevalier"
              className="w-24 h-24"
              priority
            />
            <Image
              src={"/logo/logoffvl.webp"}
              width={70}
              height={70}
              alt="Logo Parapente à Serre Chevalier"
              className="w-16 h-16"
              priority
            />
          </div>
          <div className="text-center md:text-left mt-6 md:mt-0">
            <p>Au plaisir de vous retrouver !</p>
            <p className="font-semibold text-xl my-2">Clément Pons</p>
            <p className="text-sm">Moniteur certifié FFVL</p>
            <p className="text-sm">Diplômé DEJEPS Vol Libre</p>
            <Link href={"tel:0645913595"} className="block mt-4">
              06.45.91.35.95
            </Link>
            <Link href={"mailto:clementpons5@gmail.com"}>
              clementpons5@gmail.com
            </Link>
          </div>
        </div>
        <div className="text-slate-50 text-center md:text-right mt-16 md:mt-0">
          <nav>
            <ul>
              <li>
                <Button
                  variant={"link"}
                  disabled
                  className="p-0 text-base text-slate-50 font-normal"
                  asChild
                >
                  <Link
                    href="/reserver"
                    className="hover:text-slate-50/70 transition"
                  >
                    Réserver
                  </Link>
                </Button>
              </li>
              <li>
                <Button
                  variant={"link"}
                  className="p-0 text-base text-slate-50 font-normal"
                  asChild
                >
                  <Link
                    href="/blog"
                    className="hover:text-slate-50/70 transition"
                  >
                    Blog
                  </Link>
                </Button>
              </li>
              <li>
                <Button
                  variant={"link"}
                  disabled
                  className="p-0 text-base text-slate-50 font-normal"
                  asChild
                >
                  <Link
                    href="#contact"
                    className="hover:text-slate-50/70 transition"
                  >
                    Nous contacter
                  </Link>
                </Button>
              </li>
              <li></li>
              <li>
                <div className="space-x-4">
                  <Button
                    variant={"link"}
                    disabled
                    className="p-0 text-base text-slate-50 font-normal"
                    asChild
                  >
                    <Link
                      href="/legal"
                      className="hover:text-slate-50/70 transition"
                    >
                      Mentions Légales
                    </Link>
                  </Button>
                  <span> | </span>
                  <Button
                    variant={"link"}
                    disabled
                    className="p-0 text-base text-slate-50 font-normal"
                    asChild
                  >
                    <Link
                      href="/cgu"
                      className="hover:text-slate-50/70 transition"
                    >
                      CGU
                    </Link>
                  </Button>
                  <span> | </span>
                  <Button
                    variant={"link"}
                    disabled
                    className="p-0 text-base text-slate-50 font-normal"
                    asChild
                  >
                    <Link
                      href="/cgv"
                      className="hover:text-slate-50/70 transition"
                    >
                      CGV
                    </Link>
                  </Button>
                </div>
              </li>
              <li>
                <div className="space-x-4">
                  <Button
                    variant={"link"}
                    disabled
                    className="p-0 text-base text-slate-50 font-normal"
                    asChild
                  >
                    <Link
                      href="/cookies"
                      className="hover:text-slate-50/70 transition"
                    >
                      Politique de cookies
                    </Link>
                  </Button>
                  <span> | </span>
                  <Button
                    variant={"link"}
                    disabled
                    className="p-0 text-base text-slate-50 font-normal"
                    asChild
                  >
                    <Link
                      href="/privacy"
                      className="hover:text-slate-50/70 transition"
                    >
                      Confidentialité
                    </Link>
                  </Button>
                </div>
              </li>
              <li>
                <Button
                  variant={"link"}
                  disabled
                  className="p-0 text-base text-slate-50 font-normal"
                  asChild
                >
                  <Link
                    href="https://serreche-parapente-backoffice.vercel.app"
                    target="_blank"
                    className="hover:text-slate-50/70 transition"
                  >
                    Espace Administrateur
                  </Link>
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
