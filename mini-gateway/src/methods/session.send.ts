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

    // 广播：所有订阅者都会收到 session.message 事件（含发起方）。
    bus.publish("session.message", { sessionKey, text: p.text });

    // ===== 练习点（你自己落地）=====
    // 现在是「全局广播」。改成「只投递到指定 channel」：
    //   1. 新建一个 ChannelRegistry，按 sessionKey 分组保存订阅者；
    //   2. 这里改为 bus 按 sessionKey 定向 publish；
    //   3. client.ts 可开两个连接，验证只有同 sessionKey 的才收到。
    return { delivered: true, sessionKey };
  });
}
