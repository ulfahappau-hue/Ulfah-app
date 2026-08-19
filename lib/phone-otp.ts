import { createHash, timingSafeEqual } from "crypto";
import { smsConfigured } from "./sms";

export const FALLBACK_DEMO_OTP = "000000";

export function hashPhoneOtp(userId: string, code: string) {
  return createHash("sha256").update(`${userId}:${code}`).digest("hex");
}

export function codesMatch(expectedHash: string, userId: string, code: string) {
  const expected = Buffer.from(expectedHash);
  const actual = Buffer.from(hashPhoneOtp(userId, code));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function configuredDemoOtp() {
  const fromEnv = process.env.PHONE_OTP_DEMO?.trim();
  if (fromEnv && /^\d{6}$/.test(fromEnv)) return fromEnv;
  if (!smsConfigured()) return FALLBACK_DEMO_OTP;
  return "";
}

export function isDemoPhoneOtp(code: string) {
  const demo = configuredDemoOtp();
  if (!demo) return false;
  const expected = Buffer.from(demo);
  const actual = Buffer.from(code);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
