import { desc } from "drizzle-orm";
import Link from "next/link";
import { Card } from "@/components/ui";
import { db } from "@/lib/db";
import { profile, user } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/session";

export default async function AdminProfilesPage() {
  await requireAdmin();
  const members = await db.select().from(user).orderBy(desc(user.createdAt));
  const profiles = await db.select().from(profile);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl text-forest">Profiles</h1>
      <ul className="space-y-3">
        {members
          .filter((m) => m.role === "member")
          .map((member) => {
            const row = profiles.find((p) => p.userId === member.id);
            return (
              <li key={member.id}>
                <Link href={`/admin/profiles/${member.id}`}>
                  <Card className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-forest/70">
                        {member.gender} · {member.memberStatus}
                        {row ? ` · ${row.city}, ${row.state}` : ""}
                      </p>
                    </div>
                    <span className="text-xs uppercase tracking-widest text-gold">
                      {member.memberStatus.replaceAll("_", " ")}
                    </span>
                  </Card>
                </Link>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
