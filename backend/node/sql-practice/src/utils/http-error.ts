// 业务错误：携带 HTTP 状态码，交给统一错误处理中间件转换为响应
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
}
