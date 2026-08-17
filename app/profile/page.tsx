import { eq } from "drizzle-orm";
import { MemberTabs } from "@/components/chrome";
import { PhotoUpload } from "@/components/photo-upload";
import { ProfileForm } from "@/components/profile-form";
import { Card } from "@/components/ui";
import { db } from "@/lib/db";
import { contactSecret, photo, profile } from "@/lib/db/schema";
import { decryptSecret } from "@/lib/encryption";
import { getDictionary } from "@/lib/i18n";
import { requireSession } from "@/lib/session";

export default async function ProfilePage() {
  const session = await requireSession();
  const { t } = await getDictionary();
  const [profileRows, secretRows, photos] = await Promise.all([
    db.select().from(profile).where(eq(profile.userId, session.user.id)).limit(1),
    db.select().from(contactSecret).where(eq(contactSecret.userId, session.user.id)).limit(1),
    db.select().from(photo).where(eq(photo.userId, session.user.id)),
  ]);
  const current = profileRows[0];
  const secret = secretRows[0];
  const status = session.user.memberStatus;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-forest">{t.profile.title}</h1>
      <p className="text-forest/80">
        {status === "pending_review"
          ? t.profile.pending
          : status === "active"
            ? t.profile.active
            : status === "hidden_matched"
              ? "Your profile is hidden after a released match."
              : "Finish your profile so a matchmaker can review it."}
      </p>
      <Card>
        <div className="mb-4 flex gap-3">
          {photos.map((item) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={item.id}
              src={`/api/photos/${item.id}`}
              alt=""
              className="h-24 w-24 rounded-2xl object-cover"
            />
          ))}
        </div>
        <PhotoUpload />
      </Card>
      <Card>
        <ProfileForm
          gender={session.user.gender ?? null}
          submitLabel={t.profile.save}
          values={
            current
              ? {
                  dateOfBirth: current.dateOfBirth,
                  state: current.state,
                  city: current.city,
                  education: current.education,
                  jobTitle: current.jobTitle,
                  jobType: current.jobType,
                  practicingLevel: current.practicingLevel,
                  maritalStatus: current.maritalStatus,
                  hasChildren: current.hasChildren,
                  childrenCount: current.childrenCount,
                  willingToRelocate: current.willingToRelocate,
                  ethnicity: current.ethnicity,
                  aboutMe: current.aboutMe,
                  seekingText: current.seekingText,
                  waliName: secret?.waliName,
                  waliPhone: secret?.waliPhoneEnc ? decryptSecret(secret.waliPhoneEnc) : "",
                  waliEmail: secret?.waliEmailEnc ? decryptSecret(secret.waliEmailEnc) : "",
                }
              : undefined
          }
        />
      </Card>
      <MemberTabs t={t} role={session.user.role} />
    </div>
  );
}
