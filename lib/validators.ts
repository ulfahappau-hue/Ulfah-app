import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "./constants";

export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `At least ${MIN_PASSWORD_LENGTH} characters`)
  .regex(/[A-Za-z]/, "Include a letter")
  .regex(/[0-9]/, "Include a number");

export const registerSchema = z.object({
  inviteCode: z.string().trim().min(4),
  firstName: z.string().trim().min(2).max(40),
  email: z.string().email(),
  password: passwordSchema,
  gender: z.enum(["male", "female"]),
  liveInAu: z.literal("on"),
  intention: z.literal("on"),
  ageConfirm: z.literal("on"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const ABOUT_ME_MIN_CHARS = 40;
export const ABOUT_ME_MAX_CHARS = 1200;
export const SEEKING_TEXT_MIN_CHARS = 20;
export const SEEKING_TEXT_MAX_CHARS = 800;

export const profileSchema = z.object({
  dateOfBirth: z.string().min(8, "Enter your date of birth."),
  state: z.string().min(2, "Choose your state."),
  city: z.string().min(2, "Choose your city."),
  education: z.string().min(2, "Choose your education."),
  jobTitle: z
    .string()
    .trim()
    .min(2, "Enter a job title.")
    .max(80, "Job title must be 80 characters or fewer."),
  jobType: z.string().min(2, "Choose a job type."),
  practicingLevel: z.string().min(2, "Choose a practicing level."),
  maritalStatus: z.string().min(2, "Choose a marital status."),
  hasChildren: z.enum(["yes", "no"], { error: "Say whether you have children." }),
  childrenCount: z.coerce
    .number()
    .int("Number of children must be a whole number.")
    .min(0, "Number of children cannot be negative.")
    .max(20, "Number of children must be 20 or fewer."),
  willingToRelocate: z.enum(["yes", "no", "maybe"], {
    error: "Say whether you are willing to relocate.",
  }),
  ethnicity: z.string().trim().max(80, "Ethnicity must be 80 characters or fewer.").optional(),
  aboutMe: z
    .string()
    .trim()
    .min(
      ABOUT_ME_MIN_CHARS,
      `About me must be at least ${ABOUT_ME_MIN_CHARS} characters (about 1–2 sentences).`,
    )
    .max(ABOUT_ME_MAX_CHARS, `About me must be ${ABOUT_ME_MAX_CHARS} characters or fewer.`),
  seekingText: z
    .string()
    .trim()
    .min(SEEKING_TEXT_MIN_CHARS, `What I am seeking must be at least ${SEEKING_TEXT_MIN_CHARS} characters.`)
    .max(SEEKING_TEXT_MAX_CHARS, `What I am seeking must be ${SEEKING_TEXT_MAX_CHARS} characters or fewer.`),
  waliName: z.string().trim().max(80, "Wali name must be 80 characters or fewer.").optional(),
  waliPhone: z.string().trim().max(20, "Wali phone must be 20 characters or fewer.").optional(),
  waliEmail: z.string().trim().max(120, "Wali email must be 120 characters or fewer.").optional(),
});

export function fieldErrorsFromZod(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}

export type ProfileDraft = {
  dateOfBirth: string;
  state: string;
  city: string;
  education: string;
  jobTitle: string;
  jobType: string;
  practicingLevel: string;
  maritalStatus: string;
  hasChildren: string;
  childrenCount: string;
  willingToRelocate: string;
  ethnicity: string;
  aboutMe: string;
  seekingText: string;
  waliName: string;
  waliPhone: string;
  waliEmail: string;
};

function formString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export function readProfileDraft(formData: FormData): ProfileDraft {
  return {
    dateOfBirth: formString(formData, "dateOfBirth"),
    state: formString(formData, "state"),
    city: formString(formData, "city"),
    education: formString(formData, "education"),
    jobTitle: formString(formData, "jobTitle"),
    jobType: formString(formData, "jobType"),
    practicingLevel: formString(formData, "practicingLevel"),
    maritalStatus: formString(formData, "maritalStatus"),
    hasChildren: formString(formData, "hasChildren"),
    childrenCount: formString(formData, "childrenCount"),
    willingToRelocate: formString(formData, "willingToRelocate"),
    ethnicity: formString(formData, "ethnicity"),
    aboutMe: formString(formData, "aboutMe"),
    seekingText: formString(formData, "seekingText"),
    waliName: formString(formData, "waliName"),
    waliPhone: formString(formData, "waliPhone"),
    waliEmail: formString(formData, "waliEmail"),
  };
}
