import { desc } from "drizzle-orm";
import { createInviteAction, revokeInviteAction } from "@/actions/admin";
import { Button, Card, Field, Input } from "@/components/ui";
import { db } from "@/lib/db";
import { invite } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/session";

export default async function AdminInvitesPage() {
  await requireAdmin();
  const rows = await db.select().from(invite).orderBy(desc(invite.createdAt));

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl text-forest">Invites</h1>
      <Card>
        <form action={createInviteAction} className="grid gap-3 sm:grid-cols-2">
          <Field label="Email to send invite (optional)">
            <Input name="email" type="email" placeholder="guest@example.com" />
          </Field>
          <Field label="Note">
            <Input name="note" />
          </Field>
          <Field label="Max uses">
            <Input name="maxUses" type="number" min={1} defaultValue={1} />
          </Field>
          <Field label="Expires in days">
            <Input name="days" type="number" min={1} defaultValue={30} />
          </Field>
          <Button type="submit" className="sm:col-span-2">
            Create invite
          </Button>
        </form>
      </Card>
      <ul className="space-y-3">
        {rows.map((row) => (
          <li key={row.id}>
            <Card className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-lg tracking-widest">{row.code}</p>
                <p className="text-sm text-forest/70">
                  {row.usedCount}/{row.maxUses} used
                  {row.email ? ` · ${row.email}` : ""}
                  {row.revokedAt ? " · revoked" : ""}
                </p>
              </div>
              {!row.revokedAt ? (
                <form action={revokeInviteAction.bind(null, row.id)}>
                  <Button type="submit" variant="secondary">
                    Revoke
                  </Button>
                </form>
              ) : null}
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
