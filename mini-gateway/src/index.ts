// index.ts
// 启动入口。默认 loopback + 无认证（本地开发最顺手的安全默认）。
// 体验「拒绝公网」：BIND=lan AUTH=none 启动会直接抛错退出。
import { Gateway, type GatewayConfig } from "./server";

const bind = process.env.BIND === "lan" || process.env.BIND === "custom" ? process.env.BIND : "loopback";
const auth = process.env.AUTH === "token" ? "token" : "none";

const cfg: GatewayConfig = {
  bind,
  host: process.env.HOST ?? "127.0.0.1",
  port: Number(process.env.PORT ?? 8787),
  auth,
  token: process.env.TOKEN,
  requireReady: process.env.READY === "1",
};

const gw = new Gateway(cfg);
gw.start();
