import { randomUUID } from "crypto";
import { redis } from "../db/redis";
import { env } from "../config/env";

const SESSION_PREFIX = "sess:";

export interface SessionInfo {
  userId: number;
  ttl: number; // 剩余有效期（秒）；-1 表示永不过期，-2 表示 key 不存在
}

// 登录成功 → 生成随机 token 写入 Redis（value = userId，带过期时间）
// 用 Redis 存会话的好处：多实例共享（可水平扩展）、可主动销毁、过期自动清理
export async function createSession(userId: number): Promise<string> {
  const token = randomUUID();
  await redis.set(`${SESSION_PREFIX}${token}`, String(userId), "EX", env.sessionTtl);
  return token;
}

// 一次性拿到 userId 和剩余 TTL，避免 get + ttl 两次串行往返
export async function getSession(token: string): Promise<SessionInfo | null> {
  const key = `${SESSION_PREFIX}${token}`;
  const [userId, ttl] = await Promise.all([redis.get(key), redis.ttl(key)]);
  if (userId === null) return null;
  return { userId: Number(userId), ttl };
}

// 滑动续期：把 TTL 重置为完整周期
export async function renewSession(token: string): Promise<void> {
  await redis.expire(`${SESSION_PREFIX}${token}`, env.sessionTtl);
}

// 登出 / 踢下线：直接删除会话 key
export async function destroySession(token: string): Promise<void> {
  await redis.del(`${SESSION_PREFIX}${token}`);
}
