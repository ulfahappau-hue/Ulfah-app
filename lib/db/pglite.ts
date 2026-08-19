import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema";

const globalForPglite = globalThis as unknown as {
  pglite?: PGlite;
};

/** Local-only PGlite. Path is statically scoped so Turbopack does not walk all of cwd. */
export function createPgliteDb() {
  if (!globalForPglite.pglite) {
    const dir = join(process.cwd(), "data", "pglite");
    mkdirSync(dir, { recursive: true });
    globalForPglite.pglite = new PGlite(dir);
  }
  return drizzle(globalForPglite.pglite, { schema });
}
