import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MIN_AGE } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function newId() {
  return crypto.randomUUID();
}

export function randomCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

export function ageFromDob(dob: string | Date) {
  const date = typeof dob === "string" ? new Date(dob) : dob;
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age -= 1;
  return age;
}

export function isAtLeastAge(dob: string, min = MIN_AGE) {
  return ageFromDob(dob) >= min;
}

export function orderedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export function oppositeGender(gender: string) {
  return gender === "male" ? "female" : "male";
}

export function normalizeAuPhone(input: string) {
  const digits = input.replace(/[^\d+]/g, "");
  if (digits.startsWith("+61")) return `+61${digits.slice(3).replace(/^0/, "")}`;
  if (digits.startsWith("61")) return `+61${digits.slice(2).replace(/^0/, "")}`;
  if (digits.startsWith("0")) return `+61${digits.slice(1)}`;
  if (digits.startsWith("+")) return digits;
  return `+61${digits}`;
}

export function isValidAuMobile(phone: string) {
  return /^\+614\d{8}$/.test(phone);
}
