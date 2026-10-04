import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Lalezar, Cairo, Archivo_Black } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import ConsentBanner from "@/components/ConsentBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
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
  title: "PLAYM3ANA — بلاصة اللعب",
  description: "ألعاب د القصارة بالدارجة فتيليفون واحد. لعب مع صحابك!",
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
  return (
    <html lang="ar" dir="rtl">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${lalezar.variable} ${cairo.variable} ${archivoBlack.variable} antialiased`}
      >
        <Providers>{children}</Providers>
        <ConsentBanner />
      </body>
    </html>
  );
}