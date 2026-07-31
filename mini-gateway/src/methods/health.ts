// methods/health.ts
// 健康检查 RPC：只需 connect scope，任何人连上来都能探活。
import type { Router } from "../router";

export function registerHealth(router: Router): void {
  router.register("health", ["connect"], () => ({
    status: "ok",
    uptimeMs: Math.round(process.uptime() * 1000),
  }));
}
