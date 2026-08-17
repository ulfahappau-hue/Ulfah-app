import { desc } from "drizzle-orm";
import { resolveReportAction } from "@/actions/report";
import { Button, Card } from "@/components/ui";
import { db } from "@/lib/db";
import { report, user } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/session";

export default async function AdminReportsPage() {
  await requireAdmin();
  const rows = await db.select().from(report).orderBy(desc(report.createdAt));
  const people = await db.select().from(user);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl text-forest">Reports</h1>
      {rows.length === 0 ? <p>No reports.</p> : null}
      <ul className="space-y-3">
        {rows.map((row) => {
          const reporter = people.find((p) => p.id === row.reporterId);
          const target = people.find((p) => p.id === row.targetUserId);
          return (
            <li key={row.id}>
              <Card>
                <p className="font-medium">
                  {reporter?.name} reported {target?.name}
                </p>
                <p className="text-sm text-forest/70">
                  {row.reason} · {row.status}
                </p>
                {row.details ? <p className="mt-2 text-sm">{row.details}</p> : null}
                {row.status === "open" ? (
                  <form action={resolveReportAction.bind(null, row.id)} className="mt-3">
                    <Button type="submit" variant="secondary">
                      Mark resolved
                    </Button>
                  </form>
                ) : null}
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
