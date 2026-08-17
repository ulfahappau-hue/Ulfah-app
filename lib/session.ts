import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import type { Role } from "./constants";

export async function getSession() {
  try {
    return await auth.api.getSession({
      headers: await headers(),
    });
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  const role = session.user.role as Role;
  if (role !== "owner" && role !== "matchmaker") {
    redirect("/browse");
  }
  return session;
}

export async function requireOwner() {
  const session = await requireSession();
  if (session.user.role !== "owner") {
    redirect("/admin");
  }
  return session;
}

export function isAdminRole(role: string | null | undefined) {
  return role === "owner" || role === "matchmaker";
}
