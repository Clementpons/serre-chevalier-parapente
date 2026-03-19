"use client";

import { LucideExternalLink } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface TopBarData {
  id: string;
  isActive: boolean;
  title: string;
  secondaryText: string;
  ctaTitle: string;
  ctaLink: string;
  ctaIsFull: boolean;
  ctaIsExternal: boolean;
}

export default function TopBar() {
  const [data, setData] = useState<TopBarData | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    async function fetchTopBar() {
      try {
        const res = await fetch("/api/topbar");
        const json = await res.json();
        if (json.success && json.data?.isActive) {
          setData(json.data);
          setIsVisible(true);
        }
      } catch (error) {
        console.error("Failed to fetch TopBar data", error);
      }
    }
    fetchTopBar();
  }, []);

  if (!isVisible || !data) return null;

  const { title, secondaryText, ctaTitle, ctaLink, ctaIsFull, ctaIsExternal } =
    data;

  const linkHref = ctaIsExternal
    ? ctaLink
    : `/${ctaLink.replace(/^\//, "")}`;

  return (
    <>
      {ctaIsFull ? (
        <Link
          href={linkHref}
          target={ctaIsExternal ? "_blank" : undefined}
          rel={ctaIsExternal ? "noopener noreferrer" : undefined}
          title={ctaTitle || title}
          className="bg-blue-800 w-full h-[5vh] lg:h-auto text-center flex items-center justify-center lg:block lg:p-2 px-4 absolute left-0 top-0 z-[60]"
        >
          <div className="text-xs md:text-sm text-slate-50 flex items-center justify-center gap-2">
            <span>
              <span className="font-semibold mr-1">{title}</span>
              {secondaryText}
            </span>
            {ctaIsExternal && (
              <LucideExternalLink className="h-4 w-4 text-slate-50 inline-block" />
            )}
          </div>
        </Link>
      ) : (
        <div className="bg-blue-800 w-full h-[5vh] lg:h-auto text-center flex items-center justify-center lg:block lg:p-2 px-4 absolute left-0 top-0 z-[60]">
          <div className="text-xs md:text-sm text-slate-50 flex items-center justify-center gap-2">
            <span>
              <span className="font-semibold mr-1">{title}</span>
              {secondaryText}
            </span>
            {ctaTitle && (
              <Link
                href={linkHref}
                target={ctaIsExternal ? "_blank" : undefined}
                rel={ctaIsExternal ? "noopener noreferrer" : undefined}
                title={ctaTitle}
                className="ml-1 text-xs md:text-sm text-slate-50 flex items-center gap-1 hover:underline"
              >
                {ctaTitle}
                {ctaIsExternal && (
                  <LucideExternalLink className="h-4 w-4 text-slate-50 inline-block" />
                )}
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
