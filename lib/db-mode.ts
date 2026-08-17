export const PGLITE_PATH = "data/pglite";

function cleanEnv(value: string | undefined) {
  return (value ?? "").trim().replace(/^['"]|['"]$/g, "");
}

function hostnameOf(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

export function isRemotePostgres(url: string) {
  if (!url.startsWith("postgres://") && !url.startsWith("postgresql://")) {
    return false;
  }
  const host = hostnameOf(url);
  return Boolean(host) && host !== "localhost" && host !== "127.0.0.1";
}

function isDatabaseUrlKey(key: string) {
  return /(^|_)((DATABASE_URL(_UNPOOLED)?)|(POSTGRES_URL(_NON_POOLING)?)|(POSTGRES_PRISMA_URL))$/.test(
    key,
  );
}

function collectPostgresUrls() {
  const entries: { key: string; url: string }[] = [];
  for (const [key, raw] of Object.entries(process.env)) {
    if (!isDatabaseUrlKey(key)) continue;
    const url = cleanEnv(raw);
    if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
      entries.push({ key, url });
    }
  }
  return entries;
}

export function getDatabaseUrl(options?: { preferUnpooled?: boolean }) {
  const remote = collectPostgresUrls().filter((entry) => isRemotePostgres(entry.url));
  if (remote.length > 0) {
    const unpooled = remote.find(
      (entry) =>
        /UNPOOLED|NON_POOLING/i.test(entry.key) || !hostnameOf(entry.url).includes("-pooler"),
    );
    const pooled = remote.find(
      (entry) => /POSTGRES_URL$/.test(entry.key) || hostnameOf(entry.url).includes("-pooler"),
    );
    if (options?.preferUnpooled) return (unpooled ?? remote[0]).url;
    return (pooled ?? unpooled ?? remote[0]).url;
  }

  return (
    cleanEnv(process.env.DATABASE_URL) ||
    cleanEnv(process.env.POSTGRES_URL) ||
    ""
  );
}
