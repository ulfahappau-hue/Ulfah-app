import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { newId } from "./utils";

const localDir = path.join(process.cwd(), "data", "uploads");

export async function savePhotoFile(buffer: Buffer, mimeType: string) {
  const ext =
    mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
  const id = newId();
  const key = `${id}.${ext}`;
  await mkdir(localDir, { recursive: true });
  await writeFile(path.join(localDir, key), buffer);
  return key;
}

export async function readPhotoFile(key: string) {
  const safe = path.basename(key);
  return readFile(path.join(localDir, safe));
}
