import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/http-error";

// 统一错误处理中间件，必须放在所有路由之后注册
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ code: err.status, message: err.message, data: null });
    return;
  }
  console.error("[error]", err);
  res.status(500).json({ code: 500, message: "服务器内部错误", data: null });
}

// 兜底 404
export function notFound(_req: Request, res: Response) {
  res.status(404).json({ code: 404, message: "资源不存在", data: null });
}
