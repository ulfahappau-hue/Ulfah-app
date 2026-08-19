import { and, eq, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "./db";
import { user } from "./db/schema";
import { LOCALE_COOKIE } from "./constants";
import { getSession } from "./session";

export { nextPathForUser } from "./next-path";

export async function setLocaleCookie(locale: "en" | "ar") {
  const jar = await cookies();
  jar.set(LOCALE_COOKIE, locale, {
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
