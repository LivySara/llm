import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import * as sessionService from "../services/session.service";
import { ok, fail } from "../utils/response";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password, email } = req.body ?? {};
    if (!username || !password) {
      return fail(res, 400, "username 和 password 必填");
    }
    const user = await authService.register(username, password, email);
    ok(res, user, "注册成功");
  } catch (e) { next(e); }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body ?? {};
    if (!username || !password) {
      return fail(res, 400, "username 和 password 必填");
    }
    const user = await authService.verifyLogin(username, password);
    const token = await sessionService.createSession(user.id);
    ok(res, { token, userId: user.id, username: user.username });
  } catch (e) { next(e); }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
      await sessionService.destroySession(header.slice(7));
    }
    ok(res, null, "已退出登录");
  } catch (e) { next(e); }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    ok(res, { userId: req.userId });
  } catch (e) { next(e); }
}
