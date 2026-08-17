import { eq, or } from "drizzle-orm";
import { MemberTabs } from "@/components/chrome";
import { Card } from "@/components/ui";
import { db } from "@/lib/db";
import { contactSecret, match, photo, user } from "@/lib/db/schema";
import { decryptSecret } from "@/lib/encryption";
import { getDictionary } from "@/lib/i18n";
import { requireSession } from "@/lib/session";

export default async function MatchesPage() {
  const session = await requireSession();
  const { t } = await getDictionary();
  const rows = await db
    .select()
    .from(match)
    .where(or(eq(match.userAId, session.user.id), eq(match.userBId, session.user.id)));

  const otherIds = rows.map((row) => (row.userAId === session.user.id ? row.userBId : row.userAId));
  const people = otherIds.length
    ? await db.select().from(user).where(or(...otherIds.map((id) => eq(user.id, id))))
    : [];
  const secrets = otherIds.length
    ? await db
        .select()
        .from(contactSecret)
        .where(or(...otherIds.map((id) => eq(contactSecret.userId, id))))
    : [];
  const photos = otherIds.length
    ? await db.select().from(photo).where(or(...otherIds.map((id) => eq(photo.userId, id))))
    : [];

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-forest">{t.matches.title}</h1>
      {rows.length === 0 ? <p className="text-forest/70">{t.matches.empty}</p> : null}
      <ul className="space-y-4">
        {rows.map((row) => {
          const otherId = row.userAId === session.user.id ? row.userBId : row.userAId;
          const other = people.find((p) => p.id === otherId);
          const secret = secrets.find((s) => s.userId === otherId);
          const otherPhotos = photos.filter((p) => p.userId === otherId);
          const released = row.status === "released";
          return (
            <li key={row.id}>
              <Card>
                <p className="font-display text-2xl text-forest">{other?.name ?? "Member"}</p>
                <p className="text-sm text-forest/70">
                  {released ? t.matches.released : t.matches.pending}
                </p>
                {otherPhotos.length ? (
                  <div className="mt-3 flex gap-2">
                    {otherPhotos.map((item) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={item.id}
                        src={`/api/photos/${item.id}`}
                        alt=""
                        className="h-24 w-24 rounded-2xl object-cover"
                      />
                    ))}
                  </div>
                ) : null}
                {released && other ? (
                  <div className="mt-4 rounded-2xl bg-cream p-4 text-sm leading-7">
                    <p>Phone: {other.phone}</p>
                    <p>Email: {other.email}</p>
                    {secret?.waliName ? <p>Wali: {secret.waliName}</p> : null}
                    {secret?.waliPhoneEnc ? (
                      <p>Wali phone: {decryptSecret(secret.waliPhoneEnc)}</p>
                    ) : null}
                    {secret?.waliEmailEnc ? (
                      <p>Wali email: {decryptSecret(secret.waliEmailEnc)}</p>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-forest/70">
                    Photos and contact stay hidden from public browse. Admin will release phone,
                    email, and wali details when ready.
                  </p>
                )}
              </Card>
            </li>
          );
        })}
      </ul>
      <MemberTabs t={t} role={session.user.role} />
    </div>
  );
}
