"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function setLocaleAction(locale: "en" | "ar") {
  const jar = await cookies();
  jar.set("mawadda-locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
