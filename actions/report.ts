"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { REPORT_REASONS } from "@/lib/constants";
import { db } from "@/lib/db";
import { report } from "@/lib/db/schema";
import { requireSession } from "@/lib/session";
import { newId } from "@/lib/utils";

export async function reportUserAction(targetUserId: string, formData: FormData) {
  const session = await requireSession();
  const reason = String(formData.get("reason") ?? "");
  const details = String(formData.get("details") ?? "").trim();
  if (!REPORT_REASONS.includes(reason as (typeof REPORT_REASONS)[number])) {
    return { error: "Choose a reason." };
  }
  if (targetUserId === session.user.id) return { error: "You cannot report yourself." };

  await db.insert(report).values({
    id: newId(),
    reporterId: session.user.id,
    targetUserId,
    reason,
    details: details || null,
  });
  revalidatePath("/admin/reports");
  return { ok: true };
}

export async function resolveReportAction(reportId: string) {
  const { requireAdmin } = await import("@/lib/session");
  const session = await requireAdmin();
  await db
    .update(report)
    .set({
      status: "resolved",
      resolvedAt: new Date(),
      resolvedByUserId: session.user.id,
    })
    .where(eq(report.id, reportId));
  revalidatePath("/admin/reports");
}
