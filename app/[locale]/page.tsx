import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import LandingPage from "../LandingPage";
import { dictionaries, isLocale, locales, type Locale } from "../i18n";

type Props = { params: Promise<{ locale: string }> };

const openGraphLocales: Record<Locale, string> = {
  ru: "ru_RU",
  kz: "kk_KZ",
  en: "en_US",
};

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

async function getMetadataBase() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return new URL(`${protocol}://${host}`);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: value } = await params;
  if (!isLocale(value)) return {};

  const locale = value as Locale;
  const t = dictionaries[locale];
  const metadataBase = await getMetadataBase();
  const path = `/${locale}`;

  return {
    metadataBase,
    title: t.meta.title,
    description: t.meta.description,
    alternates: {
      canonical: path,
      languages: { ru: "/ru", kk: "/kz", en: "/en", "x-default": "/ru" },
    },
    openGraph: {
      title: t.meta.title,
      description: t.meta.ogDescription,
      type: "website",
      locale: openGraphLocales[locale],
      alternateLocale: locales.filter((code) => code !== locale).map((code) => openGraphLocales[code]),
      url: path,
      images: [{ url: new URL("/og.png", metadataBase).toString(), width: 1736, height: 909 }],
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.twitterDescription,
      images: [new URL("/og.png", metadataBase).toString()],
    },
  };
}

export default async function LocalizedPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LandingPage locale={locale} />;
}
