"use client";

import { setLocaleAction } from "@/actions/locale";
import type { Locale } from "@/lib/i18n/dictionaries";

export function LanguageToggle({ locale }: { locale: Locale }) {
  return (
    <button
      type="button"
      className="cursor-pointer rounded-full border border-gold/40 px-3 py-1 text-xs tracking-widest uppercase text-forest"
      onClick={() => setLocaleAction(locale === "en" ? "ar" : "en")}
    >
      {locale === "en" ? "عربي" : "EN"}
    </button>
  );
}
