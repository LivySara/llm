import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import * as sessionService from "../services/session.service";
import { resetLoginLimit } from "../middleware/rateLimit";
import { env } from "../config/env";
import { ok, fail } from "../utils/response";
import { isValidEmail, isValidPassword, isValidUsername } from "../utils/validate";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password, email } = req.body ?? {};

    if (!isValidUsername(username)) {
      return fail(res, 400, "用户名需为 3~20 位字母、数字或下划线");
    }
    if (!isValidPassword(password)) {
      return fail(res, 400, "密码需为 8~64 位，且同时包含字母和数字");
    }
    if (email !== undefined && email !== "" && !isValidEmail(email)) {
      return fail(res, 400, "邮箱格式不正确");
    }

    const user = await authService.register(username, password, email || undefined);
    ok(res, user, "注册成功", 201);
  } catch (e) {
    next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body ?? {};

    // 账号/密码错误统一提示，避免暴露“用户是否存在”（防用户名枚举）
    if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
      return fail(res, 400, "用户名和密码不能为空");
    }

    const user = await authService.verifyLogin(username, password);
    const token = await sessionService.createSession(user.id);

    // 登录成功：清零失败计数 + 记录登录时间（后者失败不影响登录结果）
    await resetLoginLimit(req);
    void authService.touchLogin(user.id).catch((e) => console.error("[login] 更新登录时间失败:", e));

    ok(res, {
      token,
      expiresIn: env.sessionTtl,
      user: { id: user.id, username: user.username, email: user.email },
    }, "登录成功");
  } catch (e) {
    next(e);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.token) {
      await sessionService.destroySession(req.token);
    }
    ok(res, null, "已退出登录");
  } catch (e) {
    next(e);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await authService.getProfile(req.userId!);
    ok(res, profile);
  } catch (e) {
    next(e);
  }
}

// 主动续期：前端可在临近过期时调用，避免用户被强制登出
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    await sessionService.renewSession(req.token!);
    ok(res, { expiresIn: env.sessionTtl }, "已续期");
  } catch (e) {
    next(e);
  }
}
