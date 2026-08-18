import { cookies } from "next/headers";
import { LEGACY_LOCALE_COOKIE, LOCALE_COOKIE } from "../constants";
import { ar, en, type Dictionary, type Locale } from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const value = jar.get(LOCALE_COOKIE)?.value ?? jar.get(LEGACY_LOCALE_COOKIE)?.value;
  return value === "ar" ? "ar" : "en";
}

export async function getDictionary(): Promise<{ locale: Locale; t: Dictionary }> {
  const locale = await getLocale();
  return { locale, t: locale === "ar" ? ar : en };
}
