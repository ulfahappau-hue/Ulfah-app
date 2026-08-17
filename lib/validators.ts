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

export const profileSchema = z.object({
  dateOfBirth: z.string().min(8),
  state: z.string().min(2),
  city: z.string().min(2),
  education: z.string().min(2),
  jobTitle: z.string().trim().min(2).max(80),
  jobType: z.string().min(2),
  practicingLevel: z.string().min(2),
  maritalStatus: z.string().min(2),
  hasChildren: z.enum(["yes", "no"]),
  childrenCount: z.coerce.number().int().min(0).max(20),
  willingToRelocate: z.enum(["yes", "no", "maybe"]),
  ethnicity: z.string().trim().max(80).optional(),
  aboutMe: z.string().trim().min(40).max(1200),
  seekingText: z.string().trim().min(20).max(800),
  waliName: z.string().trim().max(80).optional(),
  waliPhone: z.string().trim().max(20).optional(),
  waliEmail: z.string().trim().max(120).optional(),
});
