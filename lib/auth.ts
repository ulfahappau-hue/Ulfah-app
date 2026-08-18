import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "./db";
import * as schema from "./db/schema";
import { emailLayout, sendEmail } from "./email";
import { APP_NAME } from "./constants";

function originFromHost(host: string | undefined) {
  if (!host) return undefined;
  return host.startsWith("http://") || host.startsWith("https://")
    ? host.replace(/\/$/, "")
    : `https://${host}`;
}

function authBaseURL() {
  return (
    originFromHost(process.env.BETTER_AUTH_URL) ??
    originFromHost(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    originFromHost(process.env.VERCEL_URL) ??
    "http://localhost:3000"
  );
}

function authTrustedOrigins() {
  const origins = new Set<string>();
  for (const value of [
    process.env.BETTER_AUTH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
    "https://ulfah-app.vercel.app",
    "https://ulfah.com.au",
    "https://www.ulfah.com.au",
  ]) {
    const origin = originFromHost(value);
    if (origin) origins.add(origin);
  }
  if (origins.size === 0) origins.add("http://localhost:3000");
  return [...origins];
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: authBaseURL(),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    // Members are sent to /verify-email after login. Do not block sign-in here —
    // production has no working Resend key yet, so the owner would be locked out.
    requireEmailVerification: false,
    autoSignIn: false,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail(
        user.email,
        `Verify your ${APP_NAME} email`,
        emailLayout(
          "Confirm your email",
          `<p>Assalamu alaikum ${user.name},</p>
           <p>Please confirm your email to continue your ${APP_NAME} registration.</p>
           <p><a href="${url}" style="display:inline-block;background:#1B3D32;color:#F4EFE4;padding:12px 18px;border-radius:999px;text-decoration:none">Verify email</a></p>`,
        ),
      );
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "member",
        input: false,
      },
      gender: {
        type: "string",
        required: false,
        input: true,
      },
      phone: {
        type: "string",
        required: false,
        input: false,
      },
      phoneVerified: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
      memberStatus: {
        type: "string",
        defaultValue: "onboarding",
        input: false,
      },
      inviteId: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 14,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 20,
  },
  trustedOrigins: authTrustedOrigins(),
  ...(process.env.VERCEL ? { advanced: { useSecureCookies: true } } : {}),
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
