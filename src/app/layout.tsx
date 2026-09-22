import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Lalezar, Cairo, Archivo_Black } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import ConsentBanner from "@/components/ConsentBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lalezar = Lalezar({
  variable: "--font-lalezar",
  subsets: ["arabic", "latin"],
  weight: "400",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const archivoBlack = Archivo_Black({
  variable: "--font-grit",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "PLAYM3ANA — ساحة اللعب",
  description: "Pass & play party games بالدارجة على تيليفون واحد. العب مع الصحاب ديالك!",
  applicationName: "PLAYM3ANA",
};

export const viewport: Viewport = {
  themeColor: "#0d0a06",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-7713392774673260";

  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lalezar.variable} ${cairo.variable} ${archivoBlack.variable} antialiased`}
      >
        <Script
          id="adsense-loader"
          strategy="afterInteractive"
          async
          crossOrigin="anonymous"
          data-ad-frequency-hint="60s"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
        />
        <Script id="adsense-init" strategy="afterInteractive">{`
          window.adsbygoogle = window.adsbygoogle || [];
          window.adBreak = function (o) { window.adsbygoogle.push(o); };
          window.adConfig = function (o) { window.adsbygoogle.push(o); };
          window.adConfig({
            preloadAdBreaks: 'on',
            sound: 'on',
            onReady: function () { window.__adsReady = true; }
          });
        `}</Script>
        <Providers>{children}</Providers>
        <ConsentBanner />
      </body>
    </html>
  );
}