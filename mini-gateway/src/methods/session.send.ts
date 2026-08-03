// methods/session.send.ts
// 这个方法是 Gateway「连接 channel」的闭环演示：
// 客户端调用 session.send，Gateway 把消息作为事件广播给所有带 read scope 的连接。
// （真实 OpenClaw 里这里会路由到具体渠道插件，例如 telegram / whatsapp。）
import { MethodError, type Router, type MethodContext } from "../router";
import type { EventBus } from "../events";

export function registerSessionSend(router: Router, bus: EventBus): void {
  router.register("session.send", ["write"], (ctx: MethodContext, params) => {
    const p = params as { sessionKey?: string; text?: string } | null;
    if (!p || typeof p.text !== "string") {
      throw new MethodError("INVALID_PARAMS", "params require { sessionKey, text }");
    }
    const sessionKey = p.sessionKey ?? "default";

    // 定向投递：只发给 join 了同一 sessionKey 的订阅者（ChannelRegistry 隔离）。
    bus.publish(sessionKey, "session.message", { sessionKey, text: p.text });

    return { delivered: true, sessionKey };
  });
}
