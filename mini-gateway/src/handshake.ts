// handshake.ts
// 握手做两件事：(1) 协议版本协商  (2) 把 role/scopes 规整出来。
// 安全哲学：握手本身不决定「能否绑定公网」——那发生在服务启动期（见 server.ts）。
// 握手决定「这个连接被授权做什么」。

import { PROTOCOL_VERSION, type ProtocolVersion, type RpcError, type Scope } from "./protocol";

// 协议版本协商：取客户端窗口与服务端窗口的交集，additive-first 选最高可用版本。
export function negotiateProtocol(
  min: number,
  max: number,
): { protocol: ProtocolVersion } | { error: RpcError } {
  const serverMin = 1;
  const serverMax = PROTOCOL_VERSION;
  const lo = Math.max(min, serverMin);
  const hi = Math.min(max, serverMax);
  if (lo > hi) {
    return {
      error: {
        code: "PROTOCOL_UNSUPPORTED",
        message: `no protocol overlap: client [${min},${max}] server [${serverMin},${serverMax}]`,
      },
    };
  }
  return { protocol: hi };
}

const VALID_SCOPES: Scope[] = ["connect", "read", "write", "admin"];

// 规整 scopes：只保留合法值，缺省给最低 connect，避免「假设性畸形输入」污染运行时。
export function normalizeScopes(raw: unknown): Scope[] {
  if (!Array.isArray(raw)) return ["connect"];
  const out = raw.filter((s): s is Scope => typeof s === "string" && (VALID_SCOPES as string[]).includes(s));
  return out.length ? out : ["connect"];
}
