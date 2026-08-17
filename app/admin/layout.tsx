import Link from "next/link";
import { requireAdmin } from "@/lib/session";
import { getDictionary } from "@/lib/i18n";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const { t } = await getDictionary();
  const links = [
    { href: "/admin", label: t.admin.dashboard },
    { href: "/admin/profiles", label: t.admin.profiles },
    { href: "/admin/matches", label: t.admin.matches },
    { href: "/admin/invites", label: t.admin.invites },
    { href: "/admin/reports", label: t.admin.reports },
    ...(session.user.role === "owner" ? [{ href: "/admin/team", label: t.admin.team }] : []),
  ];
  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <nav className="flex gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-full border border-gold/30 bg-paper px-4 py-2 text-sm text-forest"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
