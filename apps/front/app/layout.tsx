import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";
import CookieConsentBanner from "@/components/cookie-consent/CookieConsentBanner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const manrope = Manrope({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Serre-Chevalier Parapente",
  description: "Volez en parapente à Serre-Chevalier",
  alternates: {
    canonical: "https://www.serre-chevalier-parapente.fr",
  },
  icons: {
    icon: [
      {
        rel: "icon",
        media: "(prefers-color-scheme: light)",
        type: "image/png",
        url: "/favicon/favicon-light.png",
      },
      {
        rel: "icon",
        media: "(prefers-color-scheme: dark)",
        type: "image/png",
        url: "/favicon/favicon-dark.png",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        {/* 1. Initialisation du Consent Mode par défaut (Interdit tout)*/}
        <Script id="google-consent-mode" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'analytics_storage': 'denied',
              'wait_for_update': 500
            });
          `}
        </Script>

        {/* Google Tag Manager - Modified to preserve existing ID */}
        <Script id="gtm-init" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-T7N3XCH');
          `}
        </Script>
        {/* End Google Tag Manager */}
      </head>
      <body className={manrope.className}>
        {children}
        <CookieConsentBanner />
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
