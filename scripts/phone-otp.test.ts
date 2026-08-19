import assert from "node:assert/strict";
import test from "node:test";
import { codesMatch, FALLBACK_DEMO_OTP, hashPhoneOtp, isDemoPhoneOtp } from "../lib/phone-otp";
import { nextPathForUser } from "../lib/next-path";

test("nextPathForUser sends members without phoneVerified to verify-phone", () => {
  assert.equal(
    nextPathForUser({
      role: "member",
      emailVerified: true,
      phoneVerified: false,
      memberStatus: "onboarding",
    }),
    "/verify-phone",
  );
});

test("nextPathForUser skips verify-phone after the flag is true", () => {
  assert.equal(
    nextPathForUser({
      role: "member",
      emailVerified: true,
      phoneVerified: true,
      memberStatus: "onboarding",
    }),
    "/onboarding",
  );
  assert.equal(
    nextPathForUser({
      role: "member",
      emailVerified: true,
      phoneVerified: true,
      memberStatus: "active",
    }),
    "/browse",
  );
});

test("hashed OTP matches the issued code", () => {
  const userId = "user_1";
  const code = "482913";
  assert.equal(codesMatch(hashPhoneOtp(userId, code), userId, code), true);
  assert.equal(codesMatch(hashPhoneOtp(userId, code), userId, "000000"), false);
});

test("demo OTP is accepted when Twilio is not configured", () => {
  delete process.env.TWILIO_ACCOUNT_SID;
  delete process.env.TWILIO_AUTH_TOKEN;
  delete process.env.TWILIO_FROM_NUMBER;
  delete process.env.PHONE_OTP_DEMO;
  assert.equal(isDemoPhoneOtp(FALLBACK_DEMO_OTP), true);
  assert.equal(isDemoPhoneOtp("111111"), false);
});
