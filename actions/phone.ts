"use server";

import { createHash, randomInt, timingSafeEqual } from "crypto";
import { and, desc, eq, gt } from "drizzle-orm";
import { redirect } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { db } from "@/lib/db";
import { phoneOtp, user } from "@/lib/db/schema";
import { requireSession } from "@/lib/session";
import { sendSms } from "@/lib/sms";
import { isValidAuMobile, newId, normalizeAuPhone } from "@/lib/utils";

function hashCode(userId: string, code: string) {
  return createHash("sha256").update(`${userId}:${code}`).digest("hex");
}

export type PhoneState = { error?: string; sent?: boolean; devCode?: string };

export async function sendPhoneOtpAction(_prev: PhoneState, formData: FormData): Promise<PhoneState> {
  const session = await requireSession();
  const phone = normalizeAuPhone(String(formData.get("phone") ?? ""));
  if (!isValidAuMobile(phone)) {
    return { error: "Enter a valid Australian mobile in the form 04xxxxxxxx." };
  }

  const taken = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.phone, phone))
    .limit(1);
  if (taken[0] && taken[0].id !== session.user.id) {
    return { error: "That phone number is already in use." };
  }

  const recent = await db
    .select()
    .from(phoneOtp)
    .where(eq(phoneOtp.userId, session.user.id))
    .orderBy(desc(phoneOtp.createdAt))
    .limit(1);
  if (recent[0] && Date.now() - recent[0].createdAt.getTime() < 60_000) {
    return { error: "Please wait a minute before requesting another code." };
  }

  const code = String(randomInt(100000, 1000000));
  await db.insert(phoneOtp).values({
    id: newId(),
    userId: session.user.id,
    phone,
    codeHash: hashCode(session.user.id, code),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  const result = await sendSms(
    phone,
    `${APP_NAME} code: ${code}. It expires in 10 minutes. Do not share this code.`,
  );

  return { sent: true, devCode: result.dev ? code : undefined };
}

export async function verifyPhoneOtpAction(
  _prev: PhoneState,
  formData: FormData,
): Promise<PhoneState> {
  const session = await requireSession();
  const code = String(formData.get("code") ?? "").trim();
  if (!/^\d{6}$/.test(code)) return { error: "Enter the 6-digit code." };

  const rows = await db
    .select()
    .from(phoneOtp)
    .where(and(eq(phoneOtp.userId, session.user.id), gt(phoneOtp.expiresAt, new Date())))
    .orderBy(desc(phoneOtp.createdAt))
    .limit(1);
  const row = rows[0];
  if (!row) return { error: "Code expired. Request a new one." };
  if (row.attempts >= 5) return { error: "Too many attempts. Request a new code." };

  await db
    .update(phoneOtp)
    .set({ attempts: row.attempts + 1 })
    .where(eq(phoneOtp.id, row.id));

  const expected = Buffer.from(row.codeHash);
  const actual = Buffer.from(hashCode(session.user.id, code));
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return { error: "That code is incorrect." };
  }

  await db
    .update(user)
    .set({
      phone: row.phone,
      phoneVerified: true,
      updatedAt: new Date(),
    })
    .where(eq(user.id, session.user.id));

  redirect("/onboarding");
}
