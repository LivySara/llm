import { redis } from "../db/redis";
import { env } from "../config/env";
import { randomUUID } from "crypto";

const SESSION_PREFIX = "sess:";

// 登录成功 → 生成 token 并写入 Redis（value=userId，带过期时间）
// 用 Redis 存会话的好处：可水平扩展（多实例共享）、可主动销毁、有过期自动清理
export async function createSession(userId: number): Promise<string> {
  const token = randomUUID();
  await redis.set(`${SESSION_PREFIX}${token}`, String(userId), "EX", env.sessionTtl);
  return token;
}

export async function getSessionUserId(token: string): Promise<number | null> {
  const userId = await redis.get(`${SESSION_PREFIX}${token}`);
  return userId ? Number(userId) : null;
}

export async function destroySession(token: string): Promise<void> {
  await redis.del(`${SESSION_PREFIX}${token}`);
}
