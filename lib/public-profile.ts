import { and, eq, isNull, ne } from "drizzle-orm";
import { db } from "./db";
import { interest, match, profile, user } from "./db/schema";
import { ageFromDob, oppositeGender, orderedPair } from "./utils";

export type PublicProfile = {
  id: string;
  firstName: string;
  gender: string;
  age: number;
  state: string;
  city: string;
  education: string;
  jobTitle: string;
  jobType: string;
  practicingLevel: string;
  maritalStatus: string;
  hasChildren: boolean;
  childrenCount: number;
  willingToRelocate: string;
  ethnicity: string | null;
  aboutMe: string;
  seekingText: string;
};

export function toPublicProfile(
  member: typeof user.$inferSelect,
  row: typeof profile.$inferSelect,
): PublicProfile {
  return {
    id: member.id,
    firstName: member.name,
    gender: member.gender ?? "",
    age: ageFromDob(row.dateOfBirth),
    state: row.state,
    city: row.city,
    education: row.education,
    jobTitle: row.jobTitle,
    jobType: row.jobType,
    practicingLevel: row.practicingLevel,
    maritalStatus: row.maritalStatus,
    hasChildren: row.hasChildren,
    childrenCount: row.childrenCount,
    willingToRelocate: row.willingToRelocate,
    ethnicity: row.ethnicity,
    aboutMe: row.aboutMe,
    seekingText: row.seekingText,
  };
}

export async function listPublicProfiles(viewer: typeof user.$inferSelect, filters: Record<string, string | undefined>) {
  if (!viewer.gender) return [];
  const rows = await db
    .select({ member: user, profile })
    .from(user)
    .innerJoin(profile, eq(profile.userId, user.id))
    .where(
      and(
        eq(user.memberStatus, "active"),
        eq(user.gender, oppositeGender(viewer.gender)),
        isNull(user.deletedAt),
        ne(user.id, viewer.id),
      ),
    );

  return rows
    .map(({ member, profile: row }) => toPublicProfile(member, row))
    .filter((item) => {
      if (filters.q) {
        const q = filters.q.toLowerCase();
        if (!`${item.firstName} ${item.city} ${item.jobTitle}`.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (filters.state && item.state !== filters.state) return false;
      if (filters.maritalStatus && item.maritalStatus !== filters.maritalStatus) return false;
      if (filters.practicingLevel && item.practicingLevel !== filters.practicingLevel) return false;
      if (filters.education && item.education !== filters.education) return false;
      if (filters.jobType && item.jobType !== filters.jobType) return false;
      if (filters.hasChildren === "yes" && !item.hasChildren) return false;
      if (filters.hasChildren === "no" && item.hasChildren) return false;
      if (filters.minAge && item.age < Number(filters.minAge)) return false;
      if (filters.maxAge && item.age > Number(filters.maxAge)) return false;
      return true;
    });
}

export async function getInterestState(fromId: string, toId: string) {
  const sent = await db
    .select()
    .from(interest)
    .where(and(eq(interest.fromUserId, fromId), eq(interest.toUserId, toId), isNull(interest.withdrawnAt)))
    .limit(1);
  const [a, b] = orderedPair(fromId, toId);
  const matched = await db
    .select()
    .from(match)
    .where(and(eq(match.userAId, a), eq(match.userBId, b)))
    .limit(1);
  return { sent: Boolean(sent[0]), matched: Boolean(matched[0]) };
}
