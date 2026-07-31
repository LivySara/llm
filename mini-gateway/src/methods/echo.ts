// methods/echo.ts
// 回显方法：需要 read scope；演示「参数校验失败 → 结构化错误」。
import { MethodError, type Router } from "../router";

export function registerEcho(router: Router): void {
  router.register("echo", ["read"], (_ctx, params) => {
    if (typeof params !== "string") {
      throw new MethodError("INVALID_PARAMS", "params must be a string");
    }
    return { echo: params };
  });
}
