"use server";

import { randomInt } from "crypto";
import { and, desc, eq, gt } from "drizzle-orm";
import { redirect } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { db } from "@/lib/db";
import { phoneOtp, user } from "@/lib/db/schema";
import { getMe, nextPathForUser } from "@/lib/me";
import {
  codesMatch,
  hashPhoneOtp,
  isDemoPhoneOtp,
} from "@/lib/phone-otp";
import { requireSession } from "@/lib/session";
import { sendSms } from "@/lib/sms";
import { isValidAuMobile, newId, normalizeAuPhone } from "@/lib/utils";

export type PhoneState = { error?: string; sent?: boolean; devCode?: string };

async function requireMember() {
  await requireSession();
  const me = await getMe();
  if (!me) redirect("/login");
  return me;
}

export async function sendPhoneOtpAction(_prev: PhoneState, formData: FormData): Promise<PhoneState> {
  const me = await requireMember();
  const phone = normalizeAuPhone(String(formData.get("phone") ?? ""));
  if (!isValidAuMobile(phone)) {
    return { error: "Enter a valid Australian mobile in the form 04xxxxxxxx." };
  }

  const taken = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.phone, phone))
    .limit(1);
  if (taken[0] && taken[0].id !== me.id) {
    return { error: "That phone number is already in use." };
  }

  const recent = await db
    .select()
    .from(phoneOtp)
    .where(eq(phoneOtp.userId, me.id))
    .orderBy(desc(phoneOtp.createdAt))
    .limit(1);
  if (recent[0] && Date.now() - recent[0].createdAt.getTime() < 60_000) {
    return { error: "Please wait a minute before requesting another code." };
  }

  const code = String(randomInt(100000, 1000000));
  await db.insert(phoneOtp).values({
    id: newId(),
    userId: me.id,
    phone,
    codeHash: hashPhoneOtp(me.id, code),
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
  const me = await requireMember();
  const code = String(formData.get("code") ?? "").trim();
  const phoneFromForm = normalizeAuPhone(String(formData.get("phone") ?? ""));
  if (!/^\d{6}$/.test(code)) return { error: "Enter the 6-digit code." };

  const rows = await db
    .select()
    .from(phoneOtp)
    .where(and(eq(phoneOtp.userId, me.id), gt(phoneOtp.expiresAt, new Date())))
    .orderBy(desc(phoneOtp.createdAt))
    .limit(1);
  const row = rows[0];

  if (row) {
    if (row.attempts >= 5) return { error: "Too many attempts. Request a new code." };
    await db
      .update(phoneOtp)
      .set({ attempts: row.attempts + 1 })
      .where(eq(phoneOtp.id, row.id));
  }

  const otpOk = row ? codesMatch(row.codeHash, me.id, code) : false;
  const demoOk = isDemoPhoneOtp(code);
  if (!otpOk && !demoOk) {
    if (!row) return { error: "Code expired. Request a new one." };
    return { error: "That code is incorrect." };
  }

  const phone = row?.phone || phoneFromForm;
  if (!isValidAuMobile(phone)) {
    return { error: "Enter a valid Australian mobile in the form 04xxxxxxxx." };
  }

  const taken = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.phone, phone))
    .limit(1);
  if (taken[0] && taken[0].id !== me.id) {
    return { error: "That phone number is already in use." };
  }

  const updated = await db
    .update(user)
    .set({
      phone,
      phoneVerified: true,
      updatedAt: new Date(),
    })
    .where(eq(user.id, me.id))
    .returning({
      id: user.id,
      role: user.role,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      memberStatus: user.memberStatus,
    });
  const saved = updated[0];
  if (!saved?.phoneVerified) {
    return { error: "Could not save phone verification. Try again." };
  }

  await db.delete(phoneOtp).where(eq(phoneOtp.userId, me.id));
  redirect(
    nextPathForUser({
      role: saved.role,
      emailVerified: Boolean(saved.emailVerified),
      phoneVerified: true,
      memberStatus: saved.memberStatus,
    }),
  );
}
