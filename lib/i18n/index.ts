import { cookies } from "next/headers";
import { ar, en, type Dictionary, type Locale } from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  const value = jar.get("mawadda-locale")?.value;
  return value === "ar" ? "ar" : "en";
}

export async function getDictionary(): Promise<{ locale: Locale; t: Dictionary }> {
  const locale = await getLocale();
  return { locale, t: locale === "ar" ? ar : en };
}
