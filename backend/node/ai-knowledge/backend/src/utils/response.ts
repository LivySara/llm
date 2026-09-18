import { Response } from "express";

// 统一响应格式：{ code, message, data }
export function ok<T>(res: Response, data: T, message = "ok", status = 200) {
  res.status(status).json({ code: 0, message, data });
}

export function fail(res: Response, status: number, message: string) {
  res.status(status).json({ code: status, message, data: null });
}
