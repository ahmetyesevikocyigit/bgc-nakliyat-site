type StoreKey = "editable-content" | "quote-requests" | "admin-settings";

const localFileNameByKey: Record<StoreKey, string> = {
  "editable-content": "editable-content.json",
  "quote-requests": "quote-requests.json",
  "admin-settings": "admin-settings.json",
};

function getRedisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  return url && token ? { url, token } : null;
}

async function redisCommand<T>(command: unknown[]) {
  const config = getRedisConfig();

  if (!config) {
    return null;
  }

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`KV request failed: ${response.status}`);
  }

  const payload = (await response.json()) as { result?: T };

  return payload.result ?? null;
}

export function hasRemoteStore() {
  return Boolean(getRedisConfig());
}

export async function readStoreJson<T>(key: StoreKey, fallback: T): Promise<T> {
  const redisValue = await redisCommand<string>(["GET", `bgc:${key}`]);

  if (typeof redisValue === "string") {
    return JSON.parse(redisValue) as T;
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
  if (hasRemoteStore()) {
    await redisCommand(["SET", `bgc:${key}`, JSON.stringify(value)]);
    return;
  }

  if (process.env.VERCEL) {
    throw new Error("Kalıcı storage env değişkenleri tanımlı değil.");
  }

  const [{ writeFile, mkdir }, { dirname, join }] = await Promise.all([
    import("node:fs/promises"),
    import("node:path"),
  ]);
  const filePath = join(/* turbopackIgnore: true */ process.cwd(), "src", "data", localFileNameByKey[key]);
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
