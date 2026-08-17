import {
  EDUCATION,
  JOB_TYPES,
  MARITAL_STATUSES,
  PRACTICING_LEVELS,
  RELOCATION,
  REPORT_REASONS,
} from "./constants";

export const educationLabels: Record<(typeof EDUCATION)[number], string> = {
  high_school: "High school",
  tafe: "TAFE / Diploma",
  bachelor: "Bachelor",
  master: "Master",
  doctorate: "Doctorate",
  islamic_studies: "Islamic studies",
  other: "Other",
};

export const jobTypeLabels: Record<(typeof JOB_TYPES)[number], string> = {
  education: "Education",
  healthcare: "Healthcare",
  engineering: "Engineering",
  it: "IT",
  business: "Business / finance",
  trades: "Trades",
  student: "Student",
  homemaker: "Homemaker",
  islamic_work: "Islamic work",
  other: "Other",
};

export const practicingLabels: Record<(typeof PRACTICING_LEVELS)[number], string> = {
  learning: "Learning my deen",
  practicing: "Practicing",
  very_practicing: "Very practicing",
};

export const maritalLabels: Record<(typeof MARITAL_STATUSES)[number], string> = {
  never_married: "Never married",
  divorced: "Divorced",
  widowed: "Widowed",
};

export const relocationLabels: Record<(typeof RELOCATION)[number], string> = {
  yes: "Yes",
  no: "No",
  maybe: "Maybe",
};

export const reportLabels: Record<(typeof REPORT_REASONS)[number], string> = {
  fake_profile: "Fake or misleading profile",
  inappropriate: "Inappropriate content",
  harassment: "Harassment",
  not_seeking_marriage: "Not seeking marriage",
  other: "Other",
};
