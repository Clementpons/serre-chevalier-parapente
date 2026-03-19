"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideArrowRight } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

function CTABiPlaces() {
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
          href="/reserver/bapteme"
          title="Réserver mon Baptême de l'Air"
        >
          <LucideArrowRight className="size-4 mr-2" />
          Réserver mon Baptême de l'Air
          <LucideArrowRight className="size-4 ml-2" />
        </Link>
      </Button>
      <Button
        asChild
        variant="outline"
        className={cn(
          "fixed hidden lg:flex top-16 right-20 z-50 transition-all duration-300",
          isScrolled ? "top-4 right-16" : "top-[3.25rem] right-20"
        )}
      >
        <Link
          href="/reserver/bapteme"
          title="Réserver mon Baptême de l'Air"
        >
          <LucideArrowRight className="size-4 mr-2" />
          Réserver mon Baptême de l'Air
          <LucideArrowRight className="size-4 ml-2" />
        </Link>
      </Button>
    </div>
  );
}

export default CTABiPlaces;
