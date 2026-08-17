export const APP_NAME = "Mawadda";
export const APP_TAGLINE = "Muslim marriage matching in Australia";

export const ROLES = ["member", "matchmaker", "owner"] as const;
export type Role = (typeof ROLES)[number];

export const MEMBER_STATUSES = [
  "onboarding",
  "pending_review",
  "active",
  "paused",
  "hidden_matched",
  "banned",
] as const;
export type MemberStatus = (typeof MEMBER_STATUSES)[number];

export const GENDERS = ["male", "female"] as const;
export type Gender = (typeof GENDERS)[number];

export const AU_STATES = [
  { value: "NSW", label: "New South Wales" },
  { value: "VIC", label: "Victoria" },
  { value: "QLD", label: "Queensland" },
  { value: "WA", label: "Western Australia" },
  { value: "SA", label: "South Australia" },
  { value: "TAS", label: "Tasmania" },
  { value: "ACT", label: "Australian Capital Territory" },
  { value: "NT", label: "Northern Territory" },
] as const;

export const EDUCATION = [
  "high_school",
  "tafe",
  "bachelor",
  "master",
  "doctorate",
  "islamic_studies",
  "other",
] as const;

export const JOB_TYPES = [
  "education",
  "healthcare",
  "engineering",
  "it",
  "business",
  "trades",
  "student",
  "homemaker",
  "islamic_work",
  "other",
] as const;

export const PRACTICING_LEVELS = [
  "learning",
  "practicing",
  "very_practicing",
] as const;

export const MARITAL_STATUSES = [
  "never_married",
  "divorced",
  "widowed",
] as const;

export const RELOCATION = ["yes", "no", "maybe"] as const;

export const MAX_PHOTOS = 3;
export const MAX_ACTIVE_INTERESTS = 10;
export const MIN_AGE = 18;
export const MIN_PASSWORD_LENGTH = 10;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export const SENSITIVE_PROFILE_FIELDS = [
  "maritalStatus",
  "city",
  "state",
] as const;

export const REPORT_REASONS = [
  "fake_profile",
  "inappropriate",
  "harassment",
  "not_seeking_marriage",
  "other",
] as const;
