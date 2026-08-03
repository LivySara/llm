// router.ts
// 方法注册表 + 分发 + scope 门控。
// 关键设计：每个方法声明「需要哪些 scope 才能调用」，分发时统一校验。
// 这体现了「能力 ≠ 授权」：client 声明 caps，但真正能不能调由 scope 决定。

import type { Scope, RpcError } from "./protocol";

export interface MethodContext {
  scopes: Scope[];
  // 定向发布事件到指定 sessionKey 的 channel
  emit(channel: string, event: string, payload: unknown): void;
}

export type MethodHandler = (ctx: MethodContext, params: unknown) => unknown | Promise<unknown>;

// 抛这个错误即可向调用方返回结构化错误（code/message 会原样传回）。
export class MethodError extends Error {
  code: string;
  details?: unknown;
  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export class Router {
  private handlers = new Map<string, { scopes: Scope[]; handler: MethodHandler }>();

  register(method: string, requiredScopes: Scope[], handler: MethodHandler): void {
    this.handlers.set(method, { scopes: requiredScopes, handler });
  }

  methodList(): string[] {
    return [...this.handlers.keys()];
  }

  async dispatch(
    id: string,
    method: string,
    params: unknown,
    ctx: MethodContext,
  ): Promise<{ result?: unknown; error?: RpcError }> {
    const entry = this.handlers.get(method);
    if (!entry) {
      return { error: { code: "METHOD_NOT_FOUND", message: `unknown method: ${method}` } };
    }
    // scope 门控：所需 scope 必须是调用方已授权 scope 的超集
    const ok = entry.scopes.every((s) => ctx.scopes.includes(s));
    if (!ok) {
      return {
        error: { code: "FORBIDDEN", message: `method '${method}' requires scopes [${entry.scopes.join(", ")}]` },
      };
    }
    try {
      const result = await entry.handler(ctx, params);
      return { result: result ?? null };
    } catch (e) {
      if (e instanceof MethodError) {
        return { error: { code: e.code, message: e.message, details: e.details } };
      }
      return { error: { code: "INTERNAL", message: e instanceof Error ? e.message : String(e) } };
    }
  }
}
