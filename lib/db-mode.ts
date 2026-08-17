export const PGLITE_PATH = "data/pglite";

export function isRemotePostgres(url = process.env.DATABASE_URL ?? "") {
  if (!url.startsWith("postgres://") && !url.startsWith("postgresql://")) {
    return false;
  }
  try {
    const host = new URL(url).hostname;
    return host !== "localhost" && host !== "127.0.0.1";
  } catch {
    return false;
  }
}
