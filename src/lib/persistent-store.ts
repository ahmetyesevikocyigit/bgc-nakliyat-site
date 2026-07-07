import { readKvJson, writeKvJson } from "@/lib/sqlite-store";

type StoreKey = "editable-content" | "quote-requests" | "admin-settings" | "media-library";

const localFileNameByKey: Record<StoreKey, string> = {
  "editable-content": "editable-content.json",
  "quote-requests": "quote-requests.json",
  "admin-settings": "admin-settings.json",
  "media-library": "media-library.json",
};

export async function readStoreJson<T>(key: StoreKey, fallback: T): Promise<T> {
  const sqliteValue = readKvJson<T>(key);

  if (sqliteValue !== null) {
    return sqliteValue;
  }

  try {
    const [{ readFile }, { join }] = await Promise.all([import("node:fs/promises"), import("node:path")]);
    const filePath = join(/* turbopackIgnore: true */ process.cwd(), "src", "data", localFileNameByKey[key]);
    const fileContent = await readFile(filePath, "utf8");
    return JSON.parse(fileContent) as T;
  } catch {
    return fallback;
  }
}

export async function writeStoreJson<T>(key: StoreKey, value: T) {
  writeKvJson(key, value);
}
