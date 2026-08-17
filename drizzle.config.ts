import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "drizzle-kit";
import { isRemotePostgres, PGLITE_PATH } from "./lib/db-mode";

function loadEnvFile(filename: string) {
  try {
    const text = readFileSync(resolve(process.cwd(), filename), "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    // file may not exist
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const url = process.env.DATABASE_URL ?? "";

export default isRemotePostgres(url)
  ? defineConfig({
      schema: "./lib/db/schema.ts",
      out: "./drizzle",
      dialect: "postgresql",
      dbCredentials: { url },
    })
  : defineConfig({
      schema: "./lib/db/schema.ts",
      out: "./drizzle",
      dialect: "postgresql",
      driver: "pglite",
      dbCredentials: { url: resolve(process.cwd(), PGLITE_PATH) },
    });
