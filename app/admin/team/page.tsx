import { inviteMatchmakerAction } from "@/actions/admin";
import { Button, Card, Field, Input } from "@/components/ui";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { requireOwner } from "@/lib/session";
import { eq, or } from "drizzle-orm";

export default async function AdminTeamPage() {
  await requireOwner();
  const team = await db
    .select()
    .from(user)
    .where(or(eq(user.role, "owner"), eq(user.role, "matchmaker")));

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-forest">Team</h1>
      <Card>
        <p className="mb-4 text-sm text-forest/80">
          Matchmakers can approve profiles and release matches. They cannot change team settings.
          The person must register with an invite first, then you promote their email here.
        </p>
        <form action={inviteMatchmakerAction} className="space-y-3">
          <Field label="Member email to promote">
            <Input name="email" type="email" required />
          </Field>
          <Button type="submit">Promote to matchmaker</Button>
        </form>
      </Card>
      <ul className="space-y-3">
        {team.map((member) => (
          <li key={member.id}>
            <Card>
              <p className="font-medium">{member.name}</p>
              <p className="text-sm text-forest/70">
                {member.role} · {member.email}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
