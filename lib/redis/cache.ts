import { redis } from "./client";

export const CACHE_TTL = {
  parseResult: 60 * 60 * 24 * 7,      // 7 days
  resumeJson: 60 * 60 * 24 * 30,      // 30 days
  aiGeneration: 60 * 60 * 24 * 7,     // 7 days
  publicResume: 60 * 5,               // 5 minutes
  pdfExport: 60 * 60 * 24,            // 24 hours
  jobStatus: 60 * 60,                 // 1 hour
};

export async function getCache<T>(key: string): Promise<T | null> {
  const value = await redis?.get<T>(key);
  return value ?? null;
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  if (redis) {
    await redis.set(key, value, { ex: ttlSeconds });
  }
}

export async function deleteCache(key: string): Promise<void> {
  if (redis) {
    await redis.del(key);
  }
}

export async function getOrSetCache<T>(params: {
  key: string;
  ttlSeconds: number;
  fetcher: () => Promise<T>;
}): Promise<T> {
  const cached = await getCache<T>(params.key);

  if (cached) {
    return cached;
  }

  const fresh = await params.fetcher();
  await setCache(params.key, fresh, params.ttlSeconds);
  return fresh;
}
