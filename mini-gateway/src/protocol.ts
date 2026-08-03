// protocol.ts
// 帧（frame）是 Gateway 线上协议的基本单位。
// 设计要点（来自 OpenClaw 哲学）：用「判别式联合类型」让不可能的状态无法表达。

export const PROTOCOL_VERSION = 1 as const;
export type ProtocolVersion = number;

export type Role = "client" | "node" | "admin";
// scope 决定你能调用哪些方法；caps（能力）只是「声明支持」，不等于「被授权」。
export type Scope = "connect" | "read" | "write" | "admin";

export interface RpcError {
  code: string;
  message: string;
  details?: unknown;
}

// ---- 客户端 → 服务端 ----
export interface ConnectFrame {
  type: "connect";
  minProtocol: ProtocolVersion;
  maxProtocol: ProtocolVersion;
  caps: string[];
  role: Role;
  scopes: Scope[];
  token?: string; // 启用 token 认证时由客户端携带
  sessionKey?: string; // 要加入的事件 channel；缺省为 "default"
}

export interface RequestFrame {
  type: "request";
  id: string; // 调用方生成的请求 id，响应必须原样带回
  method: string;
  params?: unknown;
}

export type ClientFrame = ConnectFrame | RequestFrame;

// ---- 服务端 → 客户端 ----
export interface HelloOkFrame {
  type: "hello-ok";
  protocol: ProtocolVersion;
  sessionId: string; // 不透明存储实例 id；区别于 sessionKey（路由身份）/ key（逻辑选择器）
  caps: string[];
}

export interface HelloErrFrame {
  type: "hello-err";
  error: RpcError;
}

export interface ResponseFrame {
  type: "response";
  id: string;
  result?: unknown;
  error?: RpcError;
}

export interface EventFrame {
  type: "event";
  event: string;
  seq: number; // 自增序号，客户端可据此判断丢帧/乱序
  payload: unknown;
}

export type ServerFrame = HelloOkFrame | HelloErrFrame | ResponseFrame | EventFrame;

// ---- 帧守卫（分层校验的第一层：先校验信封类型） ----
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function isConnectFrame(f: unknown): f is ConnectFrame {
  if (!isRecord(f)) return false;
  return (
    f.type === "connect" &&
    typeof f.minProtocol === "number" &&
    typeof f.maxProtocol === "number" &&
    Array.isArray(f.caps) &&
    typeof f.role === "string" &&
    Array.isArray(f.scopes)
  );
}

export function isRequestFrame(f: unknown): f is RequestFrame {
  if (!isRecord(f)) return false;
  return f.type === "request" && typeof f.id === "string" && typeof f.method === "string";
}
