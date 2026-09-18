import { Request, Response, NextFunction } from "express";
import { getSession, renewSession } from "../services/session.service";
import { env } from "../config/env";
import { HttpError } from "../utils/http-error";

// 解析 Authorization: Bearer <token> → 查 Redis 会话 → 挂载 userId / token
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new HttpError(401, "未登录");
    }

    const token = header.slice(7).trim();
    if (!token) {
      throw new HttpError(401, "未登录");
    }

    const session = await getSession(token);
    if (!session) {
      throw new HttpError(401, "会话已过期，请重新登录");
    }

    req.userId = session.userId;
    req.token = token;

    // 滑动续期：剩余时间不足一半时才续期，避免每个请求都写 Redis
    if (session.ttl > 0 && session.ttl < env.sessionTtl / 2) {
      await renewSession(token);
    }

    next();
  } catch (e) {
    next(e);
  }
}
