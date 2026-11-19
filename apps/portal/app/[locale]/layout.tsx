import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IBM_Plex_Sans_Arabic, Inter, Space_Grotesk } from "next/font/google";
import { direction, isLocale, locales } from "@mouna/i18n";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk" });
const plexArabic = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500", "700"], variable: "--font-plex-ar" });

export const metadata: Metadata = { title: "Mouna · Client portal" };

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={locale} dir={direction(locale)} className={`${inter.variable} ${grotesk.variable} ${plexArabic.variable}`}>
      <body>{children}</body>
    </html>
  );
}
