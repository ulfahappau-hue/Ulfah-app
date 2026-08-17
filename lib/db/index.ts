import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getDatabaseUrl, isRemotePostgres, PGLITE_PATH } from "../db-mode";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  postgres?: ReturnType<typeof postgres>;
  pglite?: PGlite;
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

  if (!globalForDb.pglite) {
    const dir = resolve(process.cwd(), PGLITE_PATH);
    mkdirSync(dir, { recursive: true });
    globalForDb.pglite = new PGlite(dir);
  }
  return drizzlePglite(globalForDb.pglite, { schema });
}

export const db = createDb();
export type Database = typeof db;
