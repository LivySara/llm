import { Request, Response, NextFunction } from "express";
import { getSessionUserId } from "../services/session.service";
import { HttpError } from "../utils/http-error";

// 从 Authorization: Bearer <token> 解析 Redis 会话，挂到 req.userId
export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new HttpError(401, "未登录");
    }
    const token = header.slice(7);
    const userId = await getSessionUserId(token);
    if (!userId) {
      throw new HttpError(401, "会话已过期，请重新登录");
    }
    req.userId = userId;
    next();
  } catch (e) {
    next(e);
  }
}
