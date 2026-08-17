import { and, eq, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "./db";
import { user } from "./db/schema";
import type { Role } from "./constants";
import { getSession } from "./session";

export async function setLocaleCookie(locale: "en" | "ar") {
  const jar = await cookies();
  jar.set("mawadda-locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

export async function countOwners() {
  try {
    const rows = await db.select({ id: user.id }).from(user).where(eq(user.role, "owner"));
    return rows.length;
  } catch {
    return null;
  }
}

export function nextPathForUser(input: {
  role: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  memberStatus: string;
}) {
  const role = input.role as Role;
  if (role === "owner" || role === "matchmaker") return "/admin";
  if (!input.emailVerified) return "/verify-email";
  if (!input.phoneVerified) return "/verify-phone";
  if (input.memberStatus === "banned") return "/banned";
  if (input.memberStatus === "onboarding") return "/onboarding";
  if (input.memberStatus === "hidden_matched") return "/matches";
  return "/browse";
}

export async function getMe() {
  const session = await getSession();
  if (!session) return null;
  const rows = await db
    .select()
    .from(user)
    .where(and(eq(user.id, session.user.id), isNull(user.deletedAt)))
    .limit(1);
  return rows[0] ?? null;
}
