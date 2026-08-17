import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const PREFIX = "v1";

function getKey() {
  const secret = process.env.CONTACT_ENCRYPTION_KEY;
  if (!secret || secret.length < 16) {
    throw new Error("CONTACT_ENCRYPTION_KEY must be set (16+ characters)");
  }
  return scryptSync(secret, "mawadda-contacts", 32);
}

export function encryptSecret(plain: string | null | undefined) {
  if (!plain) return null;
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [PREFIX, iv.toString("base64"), tag.toString("base64"), encrypted.toString("base64")].join(
    ".",
  );
}

export function decryptSecret(payload: string | null | undefined) {
  if (!payload) return null;
  const [version, ivB64, tagB64, dataB64] = payload.split(".");
  if (version !== PREFIX || !ivB64 || !tagB64 || !dataB64) {
    throw new Error("Invalid encrypted payload");
  }
  const key = getKey();
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
