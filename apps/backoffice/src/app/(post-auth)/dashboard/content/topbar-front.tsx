"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { LoaderIcon, ExternalLinkIcon, EyeIcon2, EyeOffIcon, InfoIcon, SaveIcon2 } from "@/lib/icons";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useGetTopBar } from "@/features/content/api/use-get-topbar";
import { useUpdateTopBar } from "@/features/content/api/use-update-topbar";

function TopBarFront() {
  const { data: topBarData, isLoading: isFetching } = useGetTopBar();
  const { mutate: updateTopBar, isPending } = useUpdateTopBar();

  const [topBar, setTopBar] = useState({
    isActive: false,
    title: "",
    secondaryText: "",
    ctaTitle: "",
    ctaLink: "",
    ctaIsFull: false,
    ctaIsExternal: false,
  });

  useEffect(() => {
    if (topBarData) {
      setTopBar({
        isActive: topBarData.isActive,
        title: topBarData.title,
        secondaryText: topBarData.secondaryText || "",
        ctaTitle: topBarData.ctaTitle || "",
        ctaLink: topBarData.ctaLink || "",
        ctaIsFull: topBarData.ctaIsFull,
        ctaIsExternal: topBarData.ctaIsExternal,
      });
    }
  }, [topBarData]);

  const isLoading = isFetching;

  const handleSave = () => {
    updateTopBar(topBar);
  };

  const handleReset = () => {
    if (topBarData) {
      setTopBar({
        isActive: topBarData.isActive,
        title: topBarData.title,
        secondaryText: topBarData.secondaryText || "",
        ctaTitle: topBarData.ctaTitle || "",
        ctaLink: topBarData.ctaLink || "",
        ctaIsFull: topBarData.ctaIsFull,
        ctaIsExternal: topBarData.ctaIsExternal,
      });
    } else {
      setTopBar({
        isActive: false,
        title: "",
        secondaryText: "",
        ctaTitle: "",
        ctaLink: "",
        ctaIsFull: false,
        ctaIsExternal: false,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoaderIcon className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div>
        <h1 className="text-2xl lg:text-3xl text-balance font-bold tracking-tight">
          Gestion du contenu du site web
        </h1>
        <p className="text-muted-foreground mt-2 text-balance text-sm lg:text-base">
          Gérez le contenu textuel de votre site web en un seul et même endroit.
        </p>
      </div>

      <div className="mt-8">
        <div className="lg:flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight relative pl-4 before:content-[''] before:block before:bg-blue-500 before:w-1 before:h-full before:absolute before:left-0 before:top-0">
            Bandeau - Offre Promotionelle
          </h2>
          <div className="mt-2 lg:mt-0 flex flex-row-reverse lg:block items-center gap-2">
            <Button variant="link" onClick={handleReset} disabled={isPending}>
              Annuler les changements
            </Button>
            <Button onClick={handleSave} disabled={isPending || !topBar.title}>
              {isPending ? (
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <SaveIcon2 className="mr-2 h-4 w-4" />
              )}
              Enregistrer
            </Button>
          </div>
        </div>

        <div className="lg:flex items-center gap-8">
          <div className="w-full lg:w-1/3 space-y-2 mt-4 mb-8">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "gap-2 w-1/2 border bg-gray-50 rounded p-2 py-4 flex items-center justify-center transition-colors",
                  topBar.isActive
                    ? "bg-blue-500 text-white"
                    : "cursor-pointer hover:bg-gray-100",
                )}
                onClick={() => setTopBar({ ...topBar, isActive: true })}
              >
                <EyeIcon2 className="h-4 w-4" />
                <Label className="cursor-pointer">Activer le bandeau</Label>
              </div>
              <div
                className={cn(
                  "gap-2 w-1/2 border bg-gray-50 rounded p-2 py-4 flex items-center justify-center transition-colors",
                  !topBar.isActive
                    ? "bg-blue-500 text-white"
                    : "cursor-pointer hover:bg-gray-100",
                )}
                onClick={() => setTopBar({ ...topBar, isActive: false })}
              >
                <EyeOffIcon className="h-4 w-4" />
                <Label className="cursor-pointer">Désactiver le bandeau</Label>
              </div>
            </div>
            <div className="w-full">
              <Label htmlFor="title">Titre</Label>
              <Input
                type="text"
                id="title"
                placeholder="Titre"
                value={topBar.title}
                onChange={(e) =>
                  setTopBar({ ...topBar, title: e.target.value })
                }
              />
            </div>
            <div className="w-full">
              <Label htmlFor="secondaryText">Sous Titre</Label>
              <Input
                type="text"
                id="secondaryText"
                placeholder="Sous Titre"
                value={topBar.secondaryText}
                onChange={(e) =>
                  setTopBar({ ...topBar, secondaryText: e.target.value })
                }
              />
            </div>
            <div className="w-full">
              <Label htmlFor="ctaTitle">Titre du CTA</Label>
              <Input
                type="text"
                id="ctaTitle"
                placeholder="Titre du CTA"
                value={topBar.ctaTitle}
                onChange={(e) =>
                  setTopBar({ ...topBar, ctaTitle: e.target.value })
                }
              />
            </div>
            <div className="w-full flex items-center gap-2 pt-1 pb-4">
              <Switch
                id="ctaIsFull"
                checked={topBar.ctaIsFull}
                onCheckedChange={(checked) =>
                  setTopBar({ ...topBar, ctaIsFull: checked })
                }
              />
              <Label htmlFor="ctaIsFull" className="cursor-pointer">
                Le CTA occupe toute la largeur du bandeau
              </Label>
              <Tooltip>
                <TooltipTrigger
                  type="button"
                  onClick={(e) => e.preventDefault()}
                >
                  <InfoIcon className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Activez ce bouton si vous voulez que la zone cliquable du
                    CTA soit sur toute la largeur du bandeau.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="w-full">
              <Label htmlFor="ctaLink">Lien du CTA</Label>
              {
                !topBar.ctaIsExternal ? (
                  <div className="flex items-stretch">
                    <div className="text-xs text-gray-600 bg-gray-200 px-2 text-nowrap flex items-center border border-gray-200 rounded-l-md">
                        https://serre-chevalier-parapente.fr/
                    </div>
                <Input
                  type="text"
                  id="ctaLink"
                  placeholder="Lien du CTA"
                  value={topBar.ctaLink}
                  className="flex rounded-none rounded-r-md border-l-transparent"
                  onChange={(e) =>
                    setTopBar({ ...topBar, ctaLink: e.target.value })
                  }
                />
              </div>) : (
                <Input
                  type="text"
                  id="ctaLink"
                  placeholder="Lien du CTA"
                  value={topBar.ctaLink}
                  onChange={(e) =>
                    setTopBar({ ...topBar, ctaLink: e.target.value })
                  }
                />
              )}
            </div>
            <div className="w-full flex items-center gap-2 pt-1 pb-4">
              <Switch
                id="ctaIsExternal"
                checked={topBar.ctaIsExternal}
                onCheckedChange={(checked) =>
                  setTopBar({ ...topBar, ctaIsExternal: checked })
                }
              />
              <Label htmlFor="ctaIsExternal" className="cursor-pointer">
                Le lien mène à l&apos;extérieur du site web
              </Label>
              <Tooltip>
                <TooltipTrigger
                  type="button"
                  onClick={(e) => e.preventDefault()}
                >
                  <InfoIcon className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Activez ce bouton si le lien de votre CTA mène ailleurs que
                    sur votre site web.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <div className="w-full lg:w-2/3">
            <TopBarPreview {...topBar} />
          </div>
        </div>
      </div>
    </>
  );
}

const TopBarPreview = ({
  isActive = true,
  title = "Ceci est un titre",
  secondaryText = "Ceci est un sous-titre",
  ctaTitle = "Ceci est un titre de CTA",
  ctaLink = "https://serre-chevalier-parapente.fr",
  ctaIsFull = true,
  ctaIsExternal = true,
}: {
  isActive: boolean;
  title: string;
  secondaryText: string;
  ctaTitle: string;
  ctaLink: string;
  ctaIsFull: boolean;
  ctaIsExternal: boolean;
}) => {
  return (
    <div className="bg-gray-50 w-full h-[30svh] overflow-hidden relative rounded-b-lg shadow-lg border-gray-400 border rounded-lg mt-4">
      <div className="flex items-center justify-between bg-gray-200 py-1 px-2 rounded-t-lg">
        <span className="text-xs font-semibold">
          Serre Chevalier Parapente - Aperçu de votre TopBar
        </span>
        <div className="flex tiems-center gap-2">
          <div className="w-3 h-3 block rounded-full bg-red-600"></div>
          <div className="w-3 h-3 block rounded-full bg-orange-600"></div>
          <div className="w-3 h-3 block rounded-full bg-green-600"></div>
        </div>
      </div>
      {isActive ? (
        ctaIsFull ? (
          <Link
            href={ctaIsExternal ? ctaLink : `https://serre-chevalier-parapente.fr/${ctaLink}`}
            target={"_blank"}
            title={ctaTitle}
            className="bg-blue-800 w-full h-[5vh] lg:h-auto text-center flex items-center gap-2 justify-center lg:p-2 px-4 z-[60]"
            onClick={(e) => e.preventDefault()}
          >
            <p className="text-xs md:text-sm text-slate-50">
              <span className="font-semibold mr-1">
                {title || "Ceci est un titre"}
              </span>
              {secondaryText}
            </p>
            {ctaIsExternal && (
              <ExternalLinkIcon className="h-4 w-4 text-slate-50 inline-block" />
            )}
          </Link>
        ) : (
          <div className="bg-blue-800 w-full h-[5vh] lg:h-auto text-center flex items-center gap-2 justify-center lg:p-2 px-4 z-[60]">
            <p className="text-xs md:text-sm text-slate-50">
              <span className="font-semibold mr-1">
                {title || "Ceci est un titre"}
              </span>
              {secondaryText}
            </p>
            {ctaTitle && (
              <Link
                href={ctaIsExternal ? ctaLink : `https://serre-chevalier-parapente.fr/${ctaLink}`}
                target={"_blank"}
                title={ctaTitle}
                className="ml-1 text-xs md:text-sm text-slate-50 flex items-center gap-1 hover:underline"
                onClick={(e) => e.preventDefault()}
              >
                {ctaTitle}
                {ctaIsExternal && (
                  <ExternalLinkIcon className="size-3 text-slate-50 inline-block" />
                )}
              </Link>
            )}
          </div>
        )
      ) : null}

      <Image
        src="/placeholder/bg-hero-home.jpg"
        alt=""
        className="scale-[1.01]"
        width={1920}
        height={1080}
      />
    </div>
  );
};

export default TopBarFront;
