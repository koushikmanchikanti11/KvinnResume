import { redis } from "./client";

export async function acquireLock(
  key: string,
  ttlSeconds = 120
): Promise<boolean> {
  if (!redis) return true; // Fail open if Redis is not configured during dev
  
  const result = await redis.set(key, "locked", {
    nx: true,
    ex: ttlSeconds,
  });

  return result === "OK";
}

export async function releaseLock(key: string): Promise<void> {
  if (redis) {
    await redis.del(key);
  }
}
