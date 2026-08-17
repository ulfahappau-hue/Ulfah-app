import { db } from "./db";
import { auditLog } from "./db/schema";
import { newId } from "./utils";

export async function writeAudit(input: {
  actorId?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(auditLog).values({
    id: newId(),
    actorId: input.actorId ?? null,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId ?? null,
    metadata: input.metadata ? JSON.stringify(input.metadata) : null,
  });
}
