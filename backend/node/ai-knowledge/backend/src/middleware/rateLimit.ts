import { Request, Response, NextFunction } from "express";
import { redis } from "../db/redis";
import { env } from "../config/env";
import { HttpError } from "../utils/http-error";

// 登录限流：防暴力破解。按「IP + 用户名」维度计数，
// 只按 IP 会被撞库绕过，只按用户名会被同一账号的分布式爆破绕过。
export function loginLimitKey(req: Request): string {
  const username = typeof req.body?.username === "string" ? req.body.username : "";
  return `rl:login:${req.ip ?? "unknown"}:${username}`;
}

export async function loginRateLimit(req: Request, _res: Response, next: NextFunction) {
  try {
    const key = loginLimitKey(req);
    // INCR + EXPIRE 不是原子操作，用 Lua 保证“首次设置过期时间”不会因并发漏掉
    const count = await redis.eval(
      `local c = redis.call('INCR', KEYS[1])
       if c == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
       return c`,
      1,
      key,
      String(env.loginWindowSec)
    );

    if (Number(count) > env.loginMaxAttempts) {
      throw new HttpError(429, "登录尝试过于频繁，请稍后再试");
    }
    next();
  } catch (e) {
    next(e);
  }
}

// 登录成功后清零计数
export async function resetLoginLimit(req: Request): Promise<void> {
  await redis.del(loginLimitKey(req));
}
