import { Resend } from "resend";
import { APP_NAME, APP_URL } from "./constants";

export const OWNER_NOTIFY_FALLBACK_EMAIL = "ulfahapp.au@gmail.com";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? `${APP_NAME} <noreply@localhost>`;
  if (!key) {
    console.info(`[email:dev] to=${to}\nsubject=${subject}\n${html}`);
    return { dev: true as const };
  }
  const resend = new Resend(key);
  const { data, error } = await resend.emails.send({ from, to, subject, html });
  if (error) {
    console.error("[email:resend]", { to, subject, from, error });
    throw new Error(error.message);
  }
  console.info("[email:sent]", { to, subject, id: data?.id });
  return { dev: false as const, id: data?.id };
}

export async function sendEmailSafely(to: string, subject: string, html: string) {
  try {
    await sendEmail(to, subject, html);
  } catch (error) {
    console.error("[email:failed]", { to, subject, error });
  }
}

export function emailLayout(title: string, body: string) {
  return `
  <div style="font-family:Georgia,serif;background:#F4EFE4;padding:24px;color:#1B3D32">
    <div style="max-width:520px;margin:0 auto;background:#FBFAF6;border:1px solid #E4D9C5;border-radius:16px;padding:28px">
      <p style="letter-spacing:.2em;text-transform:uppercase;font-size:12px;color:#6B8F71;margin:0 0 8px">${APP_NAME}</p>
      <h1 style="font-size:24px;margin:0 0 16px">${title}</h1>
      <div style="font-size:16px;line-height:1.6">${body}</div>
    </div>
  </div>`;
}

export async function sendProfileSubmittedEmails(input: {
  memberEmail: string;
  memberName: string;
  memberUserId: string;
  ownerEmail?: string | null;
}) {
  const firstName = escapeHtml(input.memberName.trim().split(/\s+/)[0] || "there");
  const reviewUrl = `${APP_URL}/admin/profiles/${input.memberUserId}`;
  const ownerTo = input.ownerEmail?.trim() || OWNER_NOTIFY_FALLBACK_EMAIL;

  await sendEmailSafely(
    input.memberEmail,
    `We received your ${APP_NAME} profile`,
    emailLayout(
      "Profile submitted",
      `<p>Assalamu alaikum ${firstName},</p>
       <p>Thank you for submitting your profile. It is now waiting for a matchmaker to review it. You will get another email when it is approved.</p>
       <p>You can still open your profile at <a href="${APP_URL}/onboarding">${APP_URL}/onboarding</a>.</p>`,
    ),
  );

  await sendEmailSafely(
    ownerTo,
    `New ${APP_NAME} profile needs review`,
    emailLayout(
      "Profile waiting for review",
      `<p>Assalamu alaikum,</p>
       <p>${firstName} submitted a profile and it is waiting for approval.</p>
       <p><a href="${reviewUrl}" style="display:inline-block;background:#1B3D32;color:#F4EFE4;padding:12px 18px;border-radius:999px;text-decoration:none">Review profile</a></p>
       <p>If the button does not work, open ${reviewUrl}</p>`,
    ),
  );
}
