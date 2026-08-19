import Link from "next/link";
import { signOutAction } from "@/actions/auth";
import { LanguageToggle } from "@/components/language-toggle";
import { Logo } from "@/components/logo";
import { isAdminRole } from "@/lib/session";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

export function AppHeader({
  locale,
  t,
  user,
}: {
  locale: Locale;
  t: Dictionary;
  user?: { name: string; role: string } | null;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-gold/20 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href={user ? "/browse" : "/"} className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <span className="font-display text-xl text-forest">{t.brand}</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle locale={locale} />
          {user ? (
            <>
              {isAdminRole(user.role) ? (
                <Link href="/admin" className="hidden cursor-pointer text-sm text-forest sm:inline">
                  {t.nav.admin}
                </Link>
              ) : null}
              <form action={signOutAction}>
                <button type="submit" className="cursor-pointer text-sm text-forest/70">
                  {t.nav.signOut}
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="cursor-pointer text-sm text-forest">
              {t.nav.login}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function MemberTabs({ t, role }: { t: Dictionary; role: string }) {
  const items = [
    { href: "/browse", label: t.nav.browse },
    { href: "/matches", label: t.nav.matches },
    { href: "/profile", label: t.nav.profile },
    { href: "/settings", label: t.nav.settings },
  ];
  if (isAdminRole(role)) items.push({ href: "/admin", label: t.nav.admin });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-gold/20 bg-paper/95 px-2 py-2 backdrop-blur sm:hidden">
      <ul className="grid grid-cols-4 gap-1">
        {items.slice(0, 4).map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block cursor-pointer rounded-2xl px-2 py-2 text-center text-xs text-forest"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
