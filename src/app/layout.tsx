import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Lalezar, Cairo, Archivo_Black } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

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
  title: "Darja Arcade — ساحة اللعب",
  description: "Pass & play party games بالدارجة على تيليفون واحد. العب مع الصحاب ديالك!",
  applicationName: "Darja Arcade",
};

export const viewport: Viewport = {
  themeColor: "#06060f",
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lalezar.variable} ${cairo.variable} ${archivoBlack.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}