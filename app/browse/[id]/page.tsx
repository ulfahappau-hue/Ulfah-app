import { and, eq, isNull } from "drizzle-orm";
import { notFound } from "next/navigation";
import { InterestButtons, ReportForm } from "@/components/member-actions";
import { MemberTabs } from "@/components/chrome";
import { Card } from "@/components/ui";
import { db } from "@/lib/db";
import { profile, user } from "@/lib/db/schema";
import { getDictionary } from "@/lib/i18n";
import {
  educationLabels,
  jobTypeLabels,
  maritalLabels,
  practicingLabels,
  relocationLabels,
} from "@/lib/labels";
import { getInterestState, toPublicProfile } from "@/lib/public-profile";
import { requireSession } from "@/lib/session";
import { oppositeGender } from "@/lib/utils";
import type {
  EDUCATION,
  JOB_TYPES,
  MARITAL_STATUSES,
  PRACTICING_LEVELS,
  RELOCATION,
} from "@/lib/constants";

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { t } = await getDictionary();
  const { id } = await params;
  const rows = await db
    .select({ member: user, profile })
    .from(user)
    .innerJoin(profile, eq(profile.userId, user.id))
    .where(and(eq(user.id, id), eq(user.memberStatus, "active"), isNull(user.deletedAt)))
    .limit(1);
  const row = rows[0];
  if (!row || !session.user.gender || row.member.gender !== oppositeGender(session.user.gender)) {
    notFound();
  }
  const item = toPublicProfile(row.member, row.profile);
  const state = await getInterestState(session.user.id, item.id);

  return (
    <div className="space-y-6">
      <Card>
        <div className="rounded-2xl bg-forest p-6 text-cream">
          <p className="font-display text-4xl">
            {item.firstName}, {item.age}
          </p>
          <p className="mt-2 opacity-80">
            {item.city}, {item.state}
          </p>
        </div>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-forest/60">Marital status</dt>
            <dd>{maritalLabels[item.maritalStatus as (typeof MARITAL_STATUSES)[number]]}</dd>
          </div>
          <div>
            <dt className="text-forest/60">Children</dt>
            <dd>{item.hasChildren ? `${item.childrenCount} child(ren)` : "No children"}</dd>
          </div>
          <div>
            <dt className="text-forest/60">Practicing</dt>
            <dd>{practicingLabels[item.practicingLevel as (typeof PRACTICING_LEVELS)[number]]}</dd>
          </div>
          <div>
            <dt className="text-forest/60">Education</dt>
            <dd>{educationLabels[item.education as (typeof EDUCATION)[number]]}</dd>
          </div>
          <div>
            <dt className="text-forest/60">Work</dt>
            <dd>
              {item.jobTitle} · {jobTypeLabels[item.jobType as (typeof JOB_TYPES)[number]]}
            </dd>
          </div>
          <div>
            <dt className="text-forest/60">Relocate</dt>
            <dd>{relocationLabels[item.willingToRelocate as (typeof RELOCATION)[number]]}</dd>
          </div>
          {item.ethnicity ? (
            <div>
              <dt className="text-forest/60">Ethnicity</dt>
              <dd>{item.ethnicity}</dd>
            </div>
          ) : null}
        </dl>
        <div className="mt-6 space-y-3">
          <h2 className="font-display text-2xl text-forest">About</h2>
          <p className="whitespace-pre-wrap leading-relaxed">{item.aboutMe}</p>
          <h2 className="font-display text-2xl text-forest">Seeking</h2>
          <p className="whitespace-pre-wrap leading-relaxed">{item.seekingText}</p>
        </div>
        <div className="mt-6">
          <InterestButtons userId={item.id} sent={state.sent} matched={state.matched} />
        </div>
      </Card>
      <Card>
        <h2 className="mb-3 font-display text-xl text-forest">Safety</h2>
        <ReportForm userId={item.id} />
      </Card>
      <MemberTabs t={t} role={session.user.role} />
    </div>
  );
}
