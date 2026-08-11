import "express";

// 扩展 Express 的 Request 类型，支持在鉴权中间件里挂载 userId
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}
