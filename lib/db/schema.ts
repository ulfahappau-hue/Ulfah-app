import { relations } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  role: text("role").default("member").notNull(),
  gender: text("gender"),
  phone: text("phone"),
  phoneVerified: boolean("phone_verified").default(false).notNull(),
  memberStatus: text("member_status").default("onboarding").notNull(),
  inviteId: text("invite_id"),
  deletedAt: timestamp("deleted_at"),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invite = pgTable(
  "invite",
  {
    id: text("id").primaryKey(),
    code: text("code").notNull().unique(),
    email: text("email"),
    note: text("note"),
    maxUses: integer("max_uses").default(1).notNull(),
    usedCount: integer("used_count").default(0).notNull(),
    expiresAt: timestamp("expires_at"),
    createdByUserId: text("created_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    revokedAt: timestamp("revoked_at"),
  },
  (t) => [index("invite_code_idx").on(t.code)],
);

export const profile = pgTable("profile", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  dateOfBirth: date("date_of_birth").notNull(),
  state: text("state").notNull(),
  city: text("city").notNull(),
  education: text("education").notNull(),
  jobTitle: text("job_title").notNull(),
  jobType: text("job_type").notNull(),
  practicingLevel: text("practicing_level").notNull(),
  maritalStatus: text("marital_status").notNull(),
  hasChildren: boolean("has_children").default(false).notNull(),
  childrenCount: integer("children_count").default(0).notNull(),
  willingToRelocate: text("willing_to_relocate").notNull(),
  ethnicity: text("ethnicity"),
  aboutMe: text("about_me").notNull(),
  seekingText: text("seeking_text").notNull(),
  submittedAt: timestamp("submitted_at"),
  approvedAt: timestamp("approved_at"),
  approvedByUserId: text("approved_by_user_id").references(() => user.id, {
    onDelete: "set null",
  }),
  pendingSensitiveReview: boolean("pending_sensitive_review")
    .default(false)
    .notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contactSecret = pgTable("contact_secret", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  waliName: text("wali_name"),
  waliPhoneEnc: text("wali_phone_enc"),
  waliEmailEnc: text("wali_email_enc"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const photo = pgTable(
  "photo",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    storageKey: text("storage_key").notNull(),
    mimeType: text("mime_type").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("photo_user_id_idx").on(t.userId)],
);

export const phoneOtp = pgTable(
  "phone_otp",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    phone: text("phone").notNull(),
    codeHash: text("code_hash").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    attempts: integer("attempts").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("phone_otp_user_id_idx").on(t.userId)],
);

export const interest = pgTable(
  "interest",
  {
    id: text("id").primaryKey(),
    fromUserId: text("from_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    toUserId: text("to_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    withdrawnAt: timestamp("withdrawn_at"),
  },
  (t) => [
    uniqueIndex("interest_pair_idx").on(t.fromUserId, t.toUserId),
    index("interest_to_user_idx").on(t.toUserId),
  ],
);

export const match = pgTable(
  "match",
  {
    id: text("id").primaryKey(),
    userAId: text("user_a_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    userBId: text("user_b_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: text("status").default("pending_admin").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    releasedAt: timestamp("released_at"),
    releasedByUserId: text("released_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    declinedAt: timestamp("declined_at"),
    adminNote: text("admin_note"),
  },
  (t) => [uniqueIndex("match_pair_idx").on(t.userAId, t.userBId)],
);

export const report = pgTable(
  "report",
  {
    id: text("id").primaryKey(),
    reporterId: text("reporter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    targetUserId: text("target_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    details: text("details"),
    status: text("status").default("open").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    resolvedAt: timestamp("resolved_at"),
    resolvedByUserId: text("resolved_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (t) => [index("report_status_idx").on(t.status)],
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: text("id").primaryKey(),
    actorId: text("actor_id").references(() => user.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    targetType: text("target_type").notNull(),
    targetId: text("target_id"),
    metadata: text("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("audit_log_created_at_idx").on(t.createdAt)],
);

export const userRelations = relations(user, ({ one, many }) => ({
  profile: one(profile, { fields: [user.id], references: [profile.userId] }),
  contactSecret: one(contactSecret, {
    fields: [user.id],
    references: [contactSecret.userId],
  }),
  photos: many(photo),
}));

export const profileRelations = relations(profile, ({ one }) => ({
  user: one(user, { fields: [profile.userId], references: [user.id] }),
}));

export const photoRelations = relations(photo, ({ one }) => ({
  user: one(user, { fields: [photo.userId], references: [user.id] }),
}));
