import { and, eq, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { match, photo } from "@/lib/db/schema";
import { isAdminRole } from "@/lib/session";
import { auth } from "@/lib/auth";
import { readPhotoFile } from "@/lib/storage";
import { orderedPair } from "@/lib/utils";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const session = await auth.api.getSession({
    headers: _request.headers,
  });
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const rows = await db.select().from(photo).where(eq(photo.id, id)).limit(1);
  const item = rows[0];
  if (!item) return new NextResponse("Not found", { status: 404 });

  const viewerId = session.user.id;
  const admin = isAdminRole(session.user.role);
  let allowed = admin || viewerId === item.userId;
  if (!allowed) {
    const [a, b] = orderedPair(viewerId, item.userId);
    const matches = await db
      .select()
      .from(match)
      .where(
        and(
          eq(match.userAId, a),
          eq(match.userBId, b),
          or(eq(match.status, "pending_admin"), eq(match.status, "released")),
        ),
      )
      .limit(1);
    allowed = Boolean(matches[0]);
  }
  if (!allowed) return new NextResponse("Not found", { status: 404 });

  try {
    const file = await readPhotoFile(item.storageKey);
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": item.mimeType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Missing file", { status: 404 });
  }
}
