"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { MAX_ACTIVE_INTERESTS } from "@/lib/constants";
import { db } from "@/lib/db";
import { interest, match, user } from "@/lib/db/schema";
import { requireSession } from "@/lib/session";
import { newId, oppositeGender, orderedPair } from "@/lib/utils";

export type InterestState = { error?: string; ok?: boolean; matched?: boolean };

async function loadMember(id: string) {
  const rows = await db.select().from(user).where(eq(user.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function expressInterestAction(toUserId: string): Promise<InterestState> {
  const session = await requireSession();
  const me = await loadMember(session.user.id);
  const them = await loadMember(toUserId);
  if (!me || !them) return { error: "Profile not found." };
  if (me.id === them.id) return { error: "You cannot like your own profile." };
  if (me.memberStatus !== "active") return { error: "Your profile must be approved first." };
  if (them.memberStatus !== "active") return { error: "That profile is not available." };
  if (!me.gender || !them.gender || them.gender !== oppositeGender(me.gender)) {
    return { error: "You can only express interest in the opposite gender." };
  }

  const active = await db
    .select()
    .from(interest)
    .where(and(eq(interest.fromUserId, me.id), isNull(interest.withdrawnAt)));
  const existing = active.find((row) => row.toUserId === toUserId);
  if (existing) return { ok: true };
  if (active.length >= MAX_ACTIVE_INTERESTS) {
    return { error: "You can have at most 10 active interests." };
  }

  await db
    .insert(interest)
    .values({
      id: newId(),
      fromUserId: me.id,
      toUserId: them.id,
    })
    .onConflictDoUpdate({
      target: [interest.fromUserId, interest.toUserId],
      set: { withdrawnAt: null, createdAt: new Date() },
    });

  const reverse = await db
    .select()
    .from(interest)
    .where(
      and(
        eq(interest.fromUserId, them.id),
        eq(interest.toUserId, me.id),
        isNull(interest.withdrawnAt),
      ),
    )
    .limit(1);

  let matched = false;
  if (reverse[0]) {
    const [a, b] = orderedPair(me.id, them.id);
    await db
      .insert(match)
      .values({
        id: newId(),
        userAId: a,
        userBId: b,
        status: "pending_admin",
      })
      .onConflictDoNothing();
    matched = true;
  }

  revalidatePath("/browse");
  revalidatePath("/matches");
  return { ok: true, matched };
}

export async function withdrawInterestAction(toUserId: string): Promise<InterestState> {
  const session = await requireSession();
  const [a, b] = orderedPair(session.user.id, toUserId);
  const existingMatch = await db
    .select()
    .from(match)
    .where(and(eq(match.userAId, a), eq(match.userBId, b)))
    .limit(1);
  if (existingMatch[0]) {
    return { error: "You cannot withdraw after a mutual match. Contact admin if needed." };
  }

  await db
    .update(interest)
    .set({ withdrawnAt: new Date() })
    .where(
      and(
        eq(interest.fromUserId, session.user.id),
        eq(interest.toUserId, toUserId),
        isNull(interest.withdrawnAt),
      ),
    );
  revalidatePath("/browse");
  return { ok: true };
}
