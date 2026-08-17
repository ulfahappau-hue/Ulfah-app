import Link from "next/link";
import { BrowseFilters } from "@/components/browse-filters";
import { MemberTabs } from "@/components/chrome";
import { Card } from "@/components/ui";
import { getDictionary } from "@/lib/i18n";
import {
  educationLabels,
  jobTypeLabels,
  maritalLabels,
  practicingLabels,
} from "@/lib/labels";
import { listPublicProfiles } from "@/lib/public-profile";
import { requireSession } from "@/lib/session";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { EDUCATION, JOB_TYPES, MARITAL_STATUSES, PRACTICING_LEVELS } from "@/lib/constants";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const { t } = await getDictionary();
  const meRows = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
  const me = meRows[0];
  const raw = await searchParams;
  const filters = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
  const profiles = me ? await listPublicProfiles(me, filters) : [];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-forest">{t.browse.title}</h1>
      {me?.memberStatus !== "active" ? (
        <p className="rounded-2xl bg-gold/15 px-4 py-3 text-sm text-forest">
          You can browse after a matchmaker approves your profile.
        </p>
      ) : null}
      <BrowseFilters values={filters} />
      {profiles.length === 0 ? (
        <p className="text-forest/70">{t.browse.empty}</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {profiles.map((item) => (
            <li key={item.id}>
              <Link href={`/browse/${item.id}`}>
                <Card className="h-full transition hover:border-gold/50">
                  <div className="mb-3 flex h-28 items-end rounded-2xl bg-forest/90 p-4 text-cream">
                    <p className="font-display text-2xl">
                      {item.firstName}, {item.age}
                    </p>
                  </div>
                  <p className="text-sm text-forest/80">
                    {item.city}, {item.state}
                  </p>
                  <p className="mt-1 text-sm">
                    {maritalLabels[item.maritalStatus as (typeof MARITAL_STATUSES)[number]]} ·{" "}
                    {practicingLabels[item.practicingLevel as (typeof PRACTICING_LEVELS)[number]]}
                  </p>
                  <p className="mt-1 text-sm text-forest/70">
                    {educationLabels[item.education as (typeof EDUCATION)[number]]} ·{" "}
                    {jobTypeLabels[item.jobType as (typeof JOB_TYPES)[number]]}
                  </p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <MemberTabs t={t} role={session.user.role} />
    </div>
  );
}
