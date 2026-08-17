import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  approveProfileAction,
  banUserAction,
  rejectProfileAction,
  reopenProfileAction,
} from "@/actions/admin";
import { Button, Card, Textarea } from "@/components/ui";
import { db } from "@/lib/db";
import { contactSecret, photo, profile, user } from "@/lib/db/schema";
import { decryptSecret } from "@/lib/encryption";
import { requireAdmin } from "@/lib/session";
import { ageFromDob } from "@/lib/utils";

export default async function AdminProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const members = await db.select().from(user).where(eq(user.id, id)).limit(1);
  const member = members[0];
  if (!member) notFound();
  const [profileRows, secretRows, photos] = await Promise.all([
    db.select().from(profile).where(eq(profile.userId, id)).limit(1),
    db.select().from(contactSecret).where(eq(contactSecret.userId, id)).limit(1),
    db.select().from(photo).where(eq(photo.userId, id)),
  ]);
  const row = profileRows[0];
  const secret = secretRows[0];

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl text-forest">
        {member.name} {row ? `· ${ageFromDob(row.dateOfBirth)}` : ""}
      </h1>
      <Card>
        <p className="text-sm text-forest/70">
          {member.gender} · {member.memberStatus} · {member.email} · {member.phone}
        </p>
        {row ? (
          <div className="mt-4 space-y-2 text-sm leading-7">
            <p>
              {row.city}, {row.state}
            </p>
            <p>
              {row.maritalStatus} · children: {row.hasChildren ? row.childrenCount : 0}
            </p>
            <p>
              {row.education} · {row.jobTitle} ({row.jobType})
            </p>
            <p>Practicing: {row.practicingLevel}</p>
            <p>Relocate: {row.willingToRelocate}</p>
            {row.ethnicity ? <p>Ethnicity: {row.ethnicity}</p> : null}
            <p className="whitespace-pre-wrap">{row.aboutMe}</p>
            <p className="whitespace-pre-wrap">{row.seekingText}</p>
          </div>
        ) : (
          <p className="mt-3">No profile submitted yet.</p>
        )}
        <div className="mt-4 rounded-2xl bg-cream p-4 text-sm">
          <p className="font-medium">Private contact</p>
          <p>Email: {member.email}</p>
          <p>Phone: {member.phone}</p>
          {secret?.waliName ? <p>Wali: {secret.waliName}</p> : null}
          {secret?.waliPhoneEnc ? <p>Wali phone: {decryptSecret(secret.waliPhoneEnc)}</p> : null}
          {secret?.waliEmailEnc ? <p>Wali email: {decryptSecret(secret.waliEmailEnc)}</p> : null}
        </div>
        <div className="mt-4 flex gap-2">
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
      </Card>
      <div className="flex flex-wrap gap-3">
        <form action={approveProfileAction.bind(null, id)}>
          <Button type="submit">Approve</Button>
        </form>
        <form action={reopenProfileAction.bind(null, id)}>
          <Button type="submit" variant="secondary">
            Reopen
          </Button>
        </form>
        <form action={banUserAction.bind(null, id)}>
          <Button type="submit" variant="danger">
            Ban
          </Button>
        </form>
      </div>
      <Card>
        <form action={rejectProfileAction.bind(null, id)} className="space-y-3">
          <Textarea name="note" placeholder="Note to the member if sending back" />
          <Button type="submit" variant="secondary">
            Send back for edits
          </Button>
        </form>
      </Card>
    </div>
  );
}
