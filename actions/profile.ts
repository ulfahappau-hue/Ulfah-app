"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { MAX_PHOTO_BYTES, MAX_PHOTOS, SENSITIVE_PROFILE_FIELDS } from "@/lib/constants";
import { db } from "@/lib/db";
import { contactSecret, photo, profile, user } from "@/lib/db/schema";
import { encryptSecret } from "@/lib/encryption";
import { savePhotoFile } from "@/lib/storage";
import { requireSession } from "@/lib/session";
import { isAtLeastAge, isValidAuMobile, newId, normalizeAuPhone } from "@/lib/utils";
import { fieldErrorsFromZod, profileSchema, readProfileDraft, type ProfileDraft } from "@/lib/validators";

export type ProfileState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: ProfileDraft;
  ok?: boolean;
};

export async function saveProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const session = await requireSession();
  const meRows = await db.select().from(user).where(eq(user.id, session.user.id)).limit(1);
  const me = meRows[0];
  if (!me) return { error: "Account not found." };
  if (me.role === "member" && me.memberStatus === "banned") {
    return { error: "This account is suspended." };
  }
  if (me.role === "member" && me.memberStatus === "hidden_matched") {
    return { error: "Your profile is paused after a match. Ask admin to reopen it." };
  }

  const parsed = profileSchema.safeParse({
    dateOfBirth: formData.get("dateOfBirth"),
    state: formData.get("state"),
    city: formData.get("city"),
    education: formData.get("education"),
    jobTitle: formData.get("jobTitle"),
    jobType: formData.get("jobType"),
    practicingLevel: formData.get("practicingLevel"),
    maritalStatus: formData.get("maritalStatus"),
    hasChildren: formData.get("hasChildren"),
    childrenCount: formData.get("childrenCount") || 0,
    willingToRelocate: formData.get("willingToRelocate"),
    ethnicity: formData.get("ethnicity") || undefined,
    aboutMe: formData.get("aboutMe"),
    seekingText: formData.get("seekingText"),
    waliName: formData.get("waliName") || undefined,
    waliPhone: formData.get("waliPhone") || undefined,
    waliEmail: formData.get("waliEmail") || undefined,
  });
  if (!parsed.success) {
    return {
      fieldErrors: fieldErrorsFromZod(parsed.error),
      values: readProfileDraft(formData),
    };
  }
  if (!isAtLeastAge(parsed.data.dateOfBirth)) {
    return {
      fieldErrors: { dateOfBirth: "You must be 18 or older." },
      values: readProfileDraft(formData),
    };
  }

  const gender = me.gender;
  if (gender === "female") {
    if (!parsed.data.waliName || !parsed.data.waliPhone || !parsed.data.waliEmail) {
      const fieldErrors: Record<string, string> = {};
      if (!parsed.data.waliName) fieldErrors.waliName = "Enter your wali’s name.";
      if (!parsed.data.waliPhone) fieldErrors.waliPhone = "Enter your wali’s mobile.";
      if (!parsed.data.waliEmail) fieldErrors.waliEmail = "Enter your wali’s email.";
      return { fieldErrors, values: readProfileDraft(formData) };
    }
  }
  if (parsed.data.waliPhone && !isValidAuMobile(normalizeAuPhone(parsed.data.waliPhone))) {
    return {
      fieldErrors: { waliPhone: "Wali phone must be a valid Australian mobile." },
      values: readProfileDraft(formData),
    };
  }

  const existing = await db
    .select()
    .from(profile)
    .where(eq(profile.userId, me.id))
    .limit(1);
  const current = existing[0];
  const wasApproved = me.memberStatus === "active" && Boolean(current?.approvedAt);

  const sensitiveChanged =
    wasApproved &&
    current &&
    SENSITIVE_PROFILE_FIELDS.some((field) => current[field] !== parsed.data[field]);

  const submit = formData.get("submitForReview") === "1" || !wasApproved || sensitiveChanged;

  await db
    .insert(profile)
    .values({
      userId: me.id,
      dateOfBirth: parsed.data.dateOfBirth,
      state: parsed.data.state,
      city: parsed.data.city,
      education: parsed.data.education,
      jobTitle: parsed.data.jobTitle,
      jobType: parsed.data.jobType,
      practicingLevel: parsed.data.practicingLevel,
      maritalStatus: parsed.data.maritalStatus,
      hasChildren: parsed.data.hasChildren === "yes",
      childrenCount: parsed.data.hasChildren === "yes" ? parsed.data.childrenCount : 0,
      willingToRelocate: parsed.data.willingToRelocate,
      ethnicity: parsed.data.ethnicity || null,
      aboutMe: parsed.data.aboutMe,
      seekingText: parsed.data.seekingText,
      submittedAt: submit ? new Date() : current?.submittedAt ?? new Date(),
      approvedAt: sensitiveChanged ? null : current?.approvedAt ?? null,
      pendingSensitiveReview: Boolean(sensitiveChanged),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: profile.userId,
      set: {
        dateOfBirth: parsed.data.dateOfBirth,
        state: parsed.data.state,
        city: parsed.data.city,
        education: parsed.data.education,
        jobTitle: parsed.data.jobTitle,
        jobType: parsed.data.jobType,
        practicingLevel: parsed.data.practicingLevel,
        maritalStatus: parsed.data.maritalStatus,
        hasChildren: parsed.data.hasChildren === "yes",
        childrenCount: parsed.data.hasChildren === "yes" ? parsed.data.childrenCount : 0,
        willingToRelocate: parsed.data.willingToRelocate,
        ethnicity: parsed.data.ethnicity || null,
        aboutMe: parsed.data.aboutMe,
        seekingText: parsed.data.seekingText,
        submittedAt: submit ? new Date() : current?.submittedAt ?? new Date(),
        approvedAt: sensitiveChanged ? null : current?.approvedAt ?? null,
        pendingSensitiveReview: Boolean(sensitiveChanged),
        updatedAt: new Date(),
      },
    });

  await db
    .insert(contactSecret)
    .values({
      userId: me.id,
      waliName: parsed.data.waliName || null,
      waliPhoneEnc: parsed.data.waliPhone
        ? encryptSecret(normalizeAuPhone(parsed.data.waliPhone))
        : null,
      waliEmailEnc: parsed.data.waliEmail ? encryptSecret(parsed.data.waliEmail) : null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: contactSecret.userId,
      set: {
        waliName: parsed.data.waliName || null,
        waliPhoneEnc: parsed.data.waliPhone
          ? encryptSecret(normalizeAuPhone(parsed.data.waliPhone))
          : null,
        waliEmailEnc: parsed.data.waliEmail ? encryptSecret(parsed.data.waliEmail) : null,
        updatedAt: new Date(),
      },
    });

  if (submit && me.role === "member") {
    await db
      .update(user)
      .set({
        memberStatus: "pending_review",
        updatedAt: new Date(),
      })
      .where(eq(user.id, me.id));
  }

  revalidatePath("/onboarding");
  revalidatePath("/profile");
  return { ok: true };
}

export async function uploadPhotoAction(formData: FormData): Promise<ProfileState> {
  const session = await requireSession();
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a photo." };
  if (file.size > MAX_PHOTO_BYTES) return { error: "Photos must be 5MB or smaller." };
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return { error: "Use a JPG, PNG, or WebP photo." };
  }

  const existing = await db.select().from(photo).where(eq(photo.userId, session.user.id));
  if (existing.length >= MAX_PHOTOS) return { error: "You can upload up to 3 photos." };

  const key = await savePhotoFile(Buffer.from(await file.arrayBuffer()), file.type);
  await db.insert(photo).values({
    id: newId(),
    userId: session.user.id,
    storageKey: key,
    mimeType: file.type,
    sortOrder: existing.length,
  });
  revalidatePath("/onboarding");
  revalidatePath("/profile");
  return { ok: true };
}

export async function deletePhotoAction(photoId: string): Promise<ProfileState> {
  const session = await requireSession();
  const owned = await db.select().from(photo).where(eq(photo.id, photoId)).limit(1);
  if (!owned[0] || owned[0].userId !== session.user.id) {
    return { error: "Not allowed." };
  }
  await db.delete(photo).where(eq(photo.id, photoId));
  revalidatePath("/onboarding");
  revalidatePath("/profile");
  return { ok: true };
}

export async function deleteAccountAction(): Promise<ProfileState> {
  const session = await requireSession();
  await db
    .update(user)
    .set({
      deletedAt: new Date(),
      memberStatus: "banned",
      email: `deleted+${session.user.id}@invalid.local`,
      phone: null,
      name: "Deleted",
      updatedAt: new Date(),
    })
    .where(eq(user.id, session.user.id));
  return { ok: true };
}
