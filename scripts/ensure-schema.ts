import { spawnSync } from "node:child_process";
import { getDatabaseUrl, isRemotePostgres } from "../lib/db-mode";

if (!process.env.VERCEL) {
  process.exit(0);
}

const url = getDatabaseUrl({ preferUnpooled: true });
if (!isRemotePostgres(url)) {
  console.error(
    "No remote Postgres URL found. Vercel Neon often names it ulfah_DATABASE_URL. The app needs a postgres:// URL whose host is not localhost.",
  );
  process.exit(1);
}

process.env.DATABASE_URL = url;
const result = spawnSync(
  process.execPath,
  ["./node_modules/drizzle-kit/bin.cjs", "push", "--force"],
  { stdio: "inherit", env: process.env },
);
process.exit(result.status ?? 1);
