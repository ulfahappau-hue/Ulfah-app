import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDatabaseUrl, isRemotePostgres } from "../db-mode";
import { createPgliteDb } from "./pglite";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  postgres?: ReturnType<typeof postgres>;
};

function createDb() {
  const url = getDatabaseUrl({ preferUnpooled: false });
  if (isRemotePostgres(url)) {
    if (!globalForDb.postgres) {
      globalForDb.postgres = postgres(url, {
        max: process.env.VERCEL ? 1 : 10,
        idle_timeout: 20,
        connect_timeout: 8,
        ssl: "require",
        prepare: false,
      });
    }
    return drizzlePostgres(globalForDb.postgres, { schema });
  }

  // Vercel has a read-only filesystem. Never use PGlite there.
  if (process.env.VERCEL) {
    if (!globalForDb.postgres) {
      globalForDb.postgres = postgres(
        url || "postgresql://unused:unused@127.0.0.1:9/unused",
        {
          max: 1,
          connect_timeout: 2,
        },
      );
    }
    return drizzlePostgres(globalForDb.postgres, { schema });
  }

  return createPgliteDb();
}

export const db = createDb();
export type Database = typeof db;
