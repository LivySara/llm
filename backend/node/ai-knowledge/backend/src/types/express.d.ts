import "express";

// 扩展 Express 的 Request 类型：鉴权中间件解析会话后挂载用户信息
declare global {
  namespace Express {
    interface Request {
      userId?: number;
      token?: string;
    }
  }
}
