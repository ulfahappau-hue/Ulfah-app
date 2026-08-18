"use server";

import { eq, inArray, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { writeAudit } from "@/lib/audit";
import { APP_NAME, APP_URL } from "@/lib/constants";
import { db } from "@/lib/db";
import { contactSecret, invite, match, profile, user } from "@/lib/db/schema";
import { decryptSecret } from "@/lib/encryption";
import { emailLayout, sendEmail } from "@/lib/email";
import { requireAdmin, requireOwner } from "@/lib/session";
import { sendSms } from "@/lib/sms";
import { newId, randomCode } from "@/lib/utils";

async function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/profiles");
  revalidatePath("/admin/matches");
  revalidatePath("/admin/invites");
  revalidatePath("/browse");
  revalidatePath("/matches");
}

export async function createInviteAction(formData: FormData) {
  const session = await requireAdmin();
  const email = String(formData.get("email") ?? "").trim() || null;
  const note = String(formData.get("note") ?? "").trim() || null;
  const maxUses = Math.max(1, Number(formData.get("maxUses") ?? 1));
  const days = Number(formData.get("days") ?? 30);
  const code = randomCode(8);
  await db.insert(invite).values({
    id: newId(),
    code,
    email,
    note,
    maxUses,
    expiresAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
    createdByUserId: session.user.id,
  });
  await writeAudit({
    actorId: session.user.id,
    action: "create_invite",
    targetType: "invite",
    metadata: { code, email },
  });
  if (email) {
    const registerUrl = `${APP_URL}/register?invite=${encodeURIComponent(code)}`;
    await sendEmail(
      email,
      `You're invited to ${APP_NAME}`,
      emailLayout(
        "Your invite code",
        `<p>Assalamu alaikum,</p>
         <p>You have been invited to join ${APP_NAME}.</p>
         <p>Your invite code: <strong style="letter-spacing:.12em">${code}</strong></p>
         <p><a href="${registerUrl}" style="display:inline-block;background:#1B3D32;color:#F4EFE4;padding:12px 18px;border-radius:999px;text-decoration:none">Create your account</a></p>
         <p>If the button does not work, open ${registerUrl}</p>`,
      ),
    );
  }
  revalidatePath("/admin/invites");
}

export async function revokeInviteAction(inviteId: string) {
  const session = await requireAdmin();
  await db
    .update(invite)
    .set({ revokedAt: new Date() })
    .where(eq(invite.id, inviteId));
  await writeAudit({
    actorId: session.user.id,
    action: "revoke_invite",
    targetType: "invite",
    targetId: inviteId,
  });
  revalidatePath("/admin/invites");
}

export async function approveProfileAction(userId: string) {
  const session = await requireAdmin();
  await db
    .update(user)
    .set({ memberStatus: "active", updatedAt: new Date() })
    .where(eq(user.id, userId));
  await db
    .update(profile)
    .set({
      approvedAt: new Date(),
      approvedByUserId: session.user.id,
      pendingSensitiveReview: false,
    })
    .where(eq(profile.userId, userId));
  await writeAudit({
    actorId: session.user.id,
    action: "approve_profile",
    targetType: "user",
    targetId: userId,
  });
  const rows = await db.select().from(user).where(eq(user.id, userId)).limit(1);
  const member = rows[0];
  if (member) {
    await sendEmail(
      member.email,
      `Your ${APP_NAME} profile is live`,
      emailLayout(
        "Profile approved",
        `<p>Assalamu alaikum ${member.name},</p><p>Your profile is now visible to matching members.</p>`,
      ),
    );
  }
  await revalidateAdmin();
}

export async function rejectProfileAction(userId: string, formData: FormData) {
  const session = await requireAdmin();
  const note = String(formData.get("note") ?? "").trim();
  await db
    .update(user)
    .set({ memberStatus: "onboarding", updatedAt: new Date() })
    .where(eq(user.id, userId));
  await writeAudit({
    actorId: session.user.id,
    action: "reject_profile",
    targetType: "user",
    targetId: userId,
    metadata: { note },
  });
  const rows = await db.select().from(user).where(eq(user.id, userId)).limit(1);
  const member = rows[0];
  if (member) {
    await sendEmail(
      member.email,
      `Please update your ${APP_NAME} profile`,
      emailLayout(
        "Profile needs an update",
        `<p>Assalamu alaikum ${member.name},</p><p>${note || "Please review your profile and submit again."}</p>`,
      ),
    );
  }
  await revalidateAdmin();
}

export async function banUserAction(userId: string) {
  const session = await requireAdmin();
  await db
    .update(user)
    .set({ memberStatus: "banned", updatedAt: new Date() })
    .where(eq(user.id, userId));
  await writeAudit({
    actorId: session.user.id,
    action: "ban_user",
    targetType: "user",
    targetId: userId,
  });
  await revalidateAdmin();
}

export async function reopenProfileAction(userId: string) {
  const session = await requireAdmin();
  await db
    .update(user)
    .set({ memberStatus: "active", updatedAt: new Date() })
    .where(eq(user.id, userId));
  await writeAudit({
    actorId: session.user.id,
    action: "reopen_profile",
    targetType: "user",
    targetId: userId,
  });
  await revalidateAdmin();
}

export async function releaseMatchAction(matchId: string) {
  const session = await requireAdmin();
  const rows = await db.select().from(match).where(eq(match.id, matchId)).limit(1);
  const pair = rows[0];
  if (!pair || pair.status === "released") return;

  const people = await db
    .select()
    .from(user)
    .where(inArray(user.id, [pair.userAId, pair.userBId]));
  const a = people.find((p) => p.id === pair.userAId);
  const b = people.find((p) => p.id === pair.userBId);
  if (!a || !b) return;

  const secrets = await db
    .select()
    .from(contactSecret)
    .where(inArray(contactSecret.userId, [a.id, b.id]));

  await db
    .update(match)
    .set({
      status: "released",
      releasedAt: new Date(),
      releasedByUserId: session.user.id,
    })
    .where(eq(match.id, matchId));

  await db
    .update(user)
    .set({ memberStatus: "hidden_matched", updatedAt: new Date() })
    .where(or(eq(user.id, a.id), eq(user.id, b.id)));

  const secretFor = (id: string) => secrets.find((s) => s.userId === id);

  async function notify(
    recipient: typeof user.$inferSelect,
    other: typeof user.$inferSelect,
  ) {
    const secret = secretFor(other.id);
    const waliBits = [
      secret?.waliName ? `Wali: ${secret.waliName}` : null,
      secret?.waliPhoneEnc ? `Wali phone: ${decryptSecret(secret.waliPhoneEnc)}` : null,
      secret?.waliEmailEnc ? `Wali email: ${decryptSecret(secret.waliEmailEnc)}` : null,
    ]
      .filter(Boolean)
      .join("<br/>");

    await sendEmail(
      recipient.email,
      `${APP_NAME} has released a match`,
      emailLayout(
        "Contact details released",
        `<p>Assalamu alaikum ${recipient.name},</p>
         <p>A matchmaker has released contact details for ${other.name}.</p>
         <p>Phone: ${other.phone ?? "Not provided"}<br/>Email: ${other.email}</p>
         ${waliBits ? `<p>${waliBits}</p>` : ""}
         <p>Please involve family and keep the conversation for marriage.</p>`,
      ),
    );
    if (recipient.phone) {
      await sendSms(
        recipient.phone,
        `${APP_NAME}: contact for ${other.name} has been released. Sign in to view phone, email, and wali details.`,
      );
    }
  }

  await notify(a, b);
  await notify(b, a);

  await writeAudit({
    actorId: session.user.id,
    action: "release_match",
    targetType: "match",
    targetId: matchId,
    metadata: { userAId: a.id, userBId: b.id },
  });
  await revalidateAdmin();
}

export async function declineMatchAction(matchId: string, formData: FormData) {
  const session = await requireAdmin();
  const note = String(formData.get("note") ?? "").trim();
  await db
    .update(match)
    .set({
      status: "declined",
      declinedAt: new Date(),
      adminNote: note || null,
    })
    .where(eq(match.id, matchId));
  await writeAudit({
    actorId: session.user.id,
    action: "decline_match",
    targetType: "match",
    targetId: matchId,
    metadata: { note },
  });
  await revalidateAdmin();
}

export async function inviteMatchmakerAction(formData: FormData) {
  const session = await requireOwner();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email.includes("@")) return;
  const rows = await db.select().from(user).where(eq(user.email, email)).limit(1);
  if (!rows[0]) return;
  await db
    .update(user)
    .set({ role: "matchmaker", memberStatus: "active", phoneVerified: true, updatedAt: new Date() })
    .where(eq(user.id, rows[0].id));
  await writeAudit({
    actorId: session.user.id,
    action: "promote_matchmaker",
    targetType: "user",
    targetId: rows[0].id,
  });
  revalidatePath("/admin/team");
}
