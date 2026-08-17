import { desc } from "drizzle-orm";
import { declineMatchAction, releaseMatchAction } from "@/actions/admin";
import { Button, Card, Textarea } from "@/components/ui";
import { db } from "@/lib/db";
import { match, user } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/session";

export default async function AdminMatchesPage() {
  await requireAdmin();
  const rows = await db.select().from(match).orderBy(desc(match.createdAt));
  const people = await db.select().from(user);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl text-forest">Matches</h1>
      {rows.length === 0 ? <p>No mutual matches yet.</p> : null}
      <ul className="space-y-3">
        {rows.map((row) => {
          const a = people.find((p) => p.id === row.userAId);
          const b = people.find((p) => p.id === row.userBId);
          return (
            <li key={row.id}>
              <Card>
                <p className="font-display text-2xl text-forest">
                  {a?.name} · {b?.name}
                </p>
                <p className="text-sm text-forest/70">{row.status.replaceAll("_", " ")}</p>
                {row.status === "pending_admin" ? (
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <form action={releaseMatchAction.bind(null, row.id)}>
                      <Button type="submit">Release contacts</Button>
                    </form>
                    <form action={declineMatchAction.bind(null, row.id)} className="flex-1 space-y-2">
                      <Textarea name="note" placeholder="Optional reason if declining" />
                      <Button type="submit" variant="secondary">
                        Decline
                      </Button>
                    </form>
                  </div>
                ) : null}
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
