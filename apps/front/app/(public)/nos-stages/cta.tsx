"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideArrowRight } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

function CTANosStages({
  type,
}: {
  type: "INITIATION" | "PROGRESSION" | "AUTONOMIE";
}) {
  const [isScrolled, setIsScrolled] = useState(false);

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
    <div>
      <Button
        asChild
        variant="default"
        size={"lg"}
        className={cn(
          "fixed lg:hidden z-50 transition-all duration-300 w-[92svw]",
          "bottom-4 right-1/2 translate-x-1/2"
        )}
      >
        <Link
          href={
            type === "INITIATION"
              ? "/reserver/stage?stageType=INITIATION"
              : type === "PROGRESSION"
                ? "/reserver/stage?stageType=PROGRESSION"
                : "/reserver/stage?stageType=AUTONOMIE"
          }
          title={
            type === "INITIATION"
              ? "Réserver mon Stage Initiation"
              : type === "PROGRESSION"
                ? "Réserver mon Stage Progression"
                : "Réserver mon Stage Autonomie"
          }
        >
          <LucideArrowRight className="size-4 mr-2" />
          {type === "INITIATION"
            ? "Réserver mon Stage Initiation"
            : type === "PROGRESSION"
              ? "Réserver mon Stage Progression"
              : "Réserver mon Stage Autonomie"}
        </Link>
      </Button>
      <Button
        asChild
        variant="outline"
        className={cn(
          "fixed hidden lg:flex z-50 transition-all duration-300",
          isScrolled ? "top-4 right-32" : "top-16 right-[8.5rem]"
        )}
      >
        <Link
          href={
            type === "INITIATION"
              ? "/reserver/stage?stageType=INITIATION"
              : type === "PROGRESSION"
                ? "/reserver/stage?stageType=PROGRESSION"
                : "/reserver/stage?stageType=AUTONOMIE"
          }
          title={
            type === "INITIATION"
              ? "Réserver mon Stage Initiation"
              : type === "PROGRESSION"
                ? "Réserver mon Stage Progression"
                : "Réserver mon Stage Autonomie"
          }
        >
          <LucideArrowRight className="size-4 mr-2" />
          {type === "INITIATION"
            ? "Réserver mon Stage Initiation"
            : type === "PROGRESSION"
              ? "Réserver mon Stage Progression"
              : "Réserver mon Stage Autonomie"}
        </Link>
      </Button>
    </div>
  );
}

export default CTANosStages;
