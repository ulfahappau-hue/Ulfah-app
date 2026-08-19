import type { Role } from "./constants";

export function nextPathForUser(input: {
  role: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  memberStatus: string;
}) {
  const role = input.role as Role;
  if (role === "owner" || role === "matchmaker") return "/admin";
  if (!input.emailVerified) return "/verify-email";
  if (!input.phoneVerified) return "/verify-phone";
  if (input.memberStatus === "banned") return "/banned";
  if (input.memberStatus === "onboarding") return "/onboarding";
  if (input.memberStatus === "hidden_matched") return "/matches";
  return "/browse";
}
