import { eq } from "drizzle-orm";
import Link from "next/link";
import { Card } from "@/components/ui";
import { db } from "@/lib/db";
import { invite, match, report, user } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/session";

export default async function AdminHomePage() {
  await requireAdmin();
  const [pendingProfiles, pendingMatches, openReports, invites] = await Promise.all([
    db.select().from(user).where(eq(user.memberStatus, "pending_review")),
    db.select().from(match).where(eq(match.status, "pending_admin")),
    db.select().from(report).where(eq(report.status, "open")),
    db.select().from(invite),
  ]);

  const stats = [
    { label: "Profiles to review", value: pendingProfiles.length, href: "/admin/profiles" },
    { label: "Matches to release", value: pendingMatches.length, href: "/admin/matches" },
    { label: "Open reports", value: openReports.length, href: "/admin/reports" },
    { label: "Invites", value: invites.length, href: "/admin/invites" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-forest">Matchmaker desk</h1>
      <p className="text-forest/80">
        Approve people, then wait for mutual interest. Only then release phone, email, and wali
        details.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <Link key={stat.href} href={stat.href}>
            <Card>
              <p className="text-sm text-forest/70">{stat.label}</p>
              <p className="font-display text-4xl text-forest">{stat.value}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
