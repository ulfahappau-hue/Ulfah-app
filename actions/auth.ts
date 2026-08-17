"use server";

import { and, eq, gt, ilike, isNull, or, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { invite, user } from "@/lib/db/schema";
import { countOwners, nextPathForUser } from "@/lib/me";
import { getSession } from "@/lib/session";
import { loginSchema, passwordSchema, registerSchema } from "@/lib/validators";

function dbErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  if (/relation .* does not exist/i.test(message)) {
    return process.env.VERCEL
      ? "The database is connected, but tables are missing. Redeploy the app so the schema can be applied."
      : "Database tables are missing. Stop npm run dev, run npm run db:push, then npm run dev again.";
  }
  if (/failed query|connect|econnrefused|enotfound/i.test(message)) {
    return process.env.VERCEL
      ? "Could not reach Postgres. In Vercel, DATABASE_URL must be the Neon connection string, not localhost."
      : "Database is not ready. Stop npm run dev, run npm run db:push, then npm run dev again.";
  }
  return message;
}

export type AuthState = { error?: string; fieldErrors?: Record<string, string> };

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    inviteCode: formData.get("inviteCode"),
    firstName: formData.get("firstName"),
    email: formData.get("email"),
    password: formData.get("password"),
    gender: formData.get("gender"),
    liveInAu: formData.get("liveInAu"),
    intention: formData.get("intention"),
    ageConfirm: formData.get("ageConfirm"),
  });
  if (!parsed.success) {
    return { error: "Please check the form and try again." };
  }

  const code = parsed.data.inviteCode.trim().toUpperCase();
  const now = new Date();
  const invites = await db
    .select()
    .from(invite)
    .where(
      and(
        eq(invite.code, code),
        isNull(invite.revokedAt),
        or(isNull(invite.expiresAt), gt(invite.expiresAt, now)),
      ),
    )
    .limit(1);
  const found = invites[0];
  if (!found || found.usedCount >= found.maxUses) {
    return { error: "This invite code is not valid." };
  }
  if (found.email && found.email.toLowerCase() !== parsed.data.email.toLowerCase()) {
    return { error: "This invite is reserved for a different email." };
  }

  try {
    await auth.api.signUpEmail({
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
        name: parsed.data.firstName,
        callbackURL: "/verify-phone",
      },
    });
  } catch (error) {
    const message = dbErrorMessage(error, "Could not create account.");
    return { error: message };
  }

  await db
    .update(user)
    .set({
      inviteId: found.id,
      gender: parsed.data.gender,
      memberStatus: "onboarding",
      updatedAt: now,
    })
    .where(eq(user.email, parsed.data.email));

  await db
    .update(invite)
    .set({ usedCount: sql`${invite.usedCount} + 1` })
    .where(eq(invite.id, found.id));

  await writeAudit({
    action: "register",
    targetType: "user",
    metadata: { email: parsed.data.email, inviteId: found.id },
  });

  redirect("/verify-email?email=" + encodeURIComponent(parsed.data.email));
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function findUserIdByEmail(email: string) {
  const normalized = normalizeEmail(email);
  const rows = await db
    .select({ id: user.id })
    .from(user)
    .where(ilike(user.email, normalized))
    .limit(1);
  return rows[0]?.id;
}

async function redirectPathForEmail(email: string) {
  const normalized = normalizeEmail(email);
  const rows = await db
    .select({
      role: user.role,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      memberStatus: user.memberStatus,
    })
    .from(user)
    .where(ilike(user.email, normalized))
    .limit(1);
  const found = rows[0];
  if (!found) return "/admin";
  return nextPathForUser({
    role: found.role,
    emailVerified: Boolean(found.emailVerified),
    phoneVerified: Boolean(found.phoneVerified),
    memberStatus: found.memberStatus,
  });
}

async function markOwnerReady(userId: string) {
  await db
    .update(user)
    .set({
      role: "owner",
      memberStatus: "active",
      emailVerified: true,
      phoneVerified: true,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId));
}

function errorText(error: unknown) {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "object") {
    const record = error as { message?: unknown; body?: { message?: unknown } };
    if (typeof record.message === "string") return record.message;
    if (typeof record.body?.message === "string") return record.body.message;
  }
  return "";
}

function signInErrorMessage(error: unknown) {
  const message = errorText(error) || "Could not sign in.";
  if (/email not verified/i.test(message)) {
    return "Could not start a session. Refresh the page and try again.";
  }
  if (/invalid email or password|user not found/i.test(message)) {
    return "That email or password is incorrect.";
  }
  return message;
}

async function signInWithPassword(email: string, password: string) {
  await auth.api.signInEmail({
    body: { email, password },
    headers: await headers(),
  });
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter a valid email and password." };

  const email = normalizeEmail(parsed.data.email);
  const password = parsed.data.password;
  const userId = await findUserIdByEmail(email);

  if (userId && ((await countOwners()) ?? 0) === 0) {
    await markOwnerReady(userId);
  } else if (userId) {
    await db
      .update(user)
      .set({ emailVerified: true, updatedAt: new Date() })
      .where(eq(user.id, userId));
  }

  try {
    await signInWithPassword(email, password);
  } catch (error) {
    if (userId && /email not verified/i.test(errorText(error))) {
      await db
        .update(user)
        .set({ emailVerified: true, updatedAt: new Date() })
        .where(eq(user.id, userId));
      try {
        await signInWithPassword(email, password);
      } catch (retryError) {
        return { error: signInErrorMessage(retryError) };
      }
    } else {
      return { error: signInErrorMessage(error) };
    }
  }

  // Set-Cookie from signInEmail is not on this request, so getSession() is null
  // here. Redirect and let the next request read the new session cookie.
  redirect(await redirectPathForEmail(email));
}

export async function setupOwnerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (((await countOwners()) ?? 0) > 0) {
    return { error: "Setup is already complete." };
  }
  const firstName = String(formData.get("firstName") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const pass = passwordSchema.safeParse(password);
  if (firstName.length < 2 || !email.includes("@") || !pass.success) {
    return { error: "Use a real name, email, and a strong password." };
  }

  try {
    await auth.api.signUpEmail({
      body: { email, password, name: firstName },
    });
  } catch (error) {
    const existingId = await findUserIdByEmail(email);
    if (!existingId) {
      return { error: dbErrorMessage(error, "Could not create owner.") };
    }
  }

  const userId = await findUserIdByEmail(email);
  if (!userId) {
    return { error: "Could not create owner." };
  }

  await markOwnerReady(userId);

  await writeAudit({
    action: "setup_owner",
    targetType: "user",
    metadata: { email },
  });

  try {
    await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });
  } catch (error) {
    return { error: signInErrorMessage(error) };
  }
  redirect("/admin");
}

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}

export async function resendVerificationAction(formData: FormData) {
  const session = await getSession();
  const email = session?.user.email ?? String(formData.get("email") ?? "");
  if (!email) return;
  try {
    await auth.api.sendVerificationEmail({
      body: { email, callbackURL: "/verify-phone" },
      headers: await headers(),
    });
  } catch {
    // surfaced in server logs; user can try again
  }
}

