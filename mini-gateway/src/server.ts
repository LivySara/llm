// server.ts
// 常驻控制面：WebSocket 服务 + HTTP 健康端点 + 绑定/认证模式。
// 复刻 OpenClaw 的安全默认：非 loopback 绑定且无认证 → 拒绝启动。
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";
import { randomUUID } from "node:crypto";
import { isConnectFrame, isRequestFrame, type ServerFrame, type Scope } from "./protocol";
import { negotiateProtocol, normalizeScopes } from "./handshake";
import { Router, type MethodContext } from "./router";
import { EventBus } from "./events";
import { registerHealth } from "./methods/health";
import { registerEcho } from "./methods/echo";
import { registerSessionSend } from "./methods/session.send";

export interface GatewayConfig {
  bind: "loopback" | "lan" | "custom";
  host: string;
  port: number;
  auth: "none" | "token";
  token?: string;
  requireReady: boolean; // 是否启用 readyz 等待插件/channel settle
}

interface ConnectionState {
  ws: WebSocket;
  scopes: Scope[];
  authed: boolean;
  helloDone: boolean;
  unsub?: () => void;
}

export class Gateway {
  private router = new Router();
  private bus = new EventBus();
  private ready = false;
  private connections = new Set<ConnectionState>();

  constructor(private cfg: GatewayConfig) {
    registerHealth(this.router);
    registerEcho(this.router);
    registerSessionSend(this.router, this.bus);
  }

  start(): void {
    // 安全默认：非 loopback 绑定且未设认证 → 拒绝启动（复刻 OpenClaw 安全默认）
    if (this.cfg.bind !== "loopback" && this.cfg.auth === "none") {
      throw new Error(`refusing to start: binding '${this.cfg.bind}' requires auth (set auth=token)`);
    }

    const http = createServer((req, res) => this.handleHttp(req, res));
    const wss = new WebSocketServer({ server: http });

    wss.on("connection", (ws) => this.onConnection(ws));

    http.listen(this.cfg.port, this.cfg.host, () => {
      console.log(`[gateway] listening on ${this.cfg.host}:${this.cfg.port} (bind=${this.cfg.bind}, auth=${this.cfg.auth})`);
      console.log(`[gateway] methods: ${this.router.methodList().join(", ")}`);
    });

    // 模拟 channel/plugin settle；真实场景会等所有插件就绪后才转绿。
    if (this.cfg.requireReady) {
      setTimeout(() => {
        this.ready = true;
        console.log("[gateway] readyz: green");
      }, 800);
    } else {
      this.ready = true;
    }
  }

  private handleHttp(req: IncomingMessage, res: ServerResponse): void {
    if (req.url === "/healthz") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ status: "alive" }));
      return;
    }
    if (req.url === "/readyz") {
      res.writeHead(this.ready ? 200 : 503, { "content-type": "application/json" });
      res.end(JSON.stringify({ status: this.ready ? "ready" : "not-ready" }));
      return;
    }
    res.writeHead(404);
    res.end();
  }

  private onConnection(ws: WebSocket): void {
    const state: ConnectionState = { ws, scopes: [], authed: this.cfg.auth === "none", helloDone: false };
    this.connections.add(state);

    // 订阅事件总线：服务端主动推送（event 帧）
    state.unsub = this.bus.subscribe((frame) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ type: "event", ...frame }));
      }
    });

    ws.on("message", (data) => this.onMessage(state, data.toString()));
    ws.on("close", () => {
      this.connections.delete(state);
      state.unsub?.();
    });
  }

  private async onMessage(state: ConnectionState, text: string): Promise<void> {
    let frame: unknown;
    try {
      frame = JSON.parse(text);
    } catch {
      this.send(state.ws, { type: "response", id: "0", error: { code: "BAD_JSON", message: "invalid json" } });
      return;
    }

    if (isConnectFrame(frame)) {
      this.handleConnect(state, frame);
      return;
    }
    if (isRequestFrame(frame)) {
      if (!state.helloDone) {
        this.send(state.ws, {
          type: "response",
          id: frame.id,
          error: { code: "NOT_HANDSHAKED", message: "send connect frame first" },
        });
        return;
      }
      await this.handleRequest(state, frame.id, frame.method, frame.params);
      return;
    }
    this.send(state.ws, { type: "response", id: "0", error: { code: "BAD_FRAME", message: "unknown frame type" } });
  }

  private handleConnect(state: ConnectionState, f: Parameters<typeof isConnectFrame>[0]): void {
    if (this.cfg.auth === "token" && f.token !== this.cfg.token) {
      this.send(state.ws, { type: "hello-err", error: { code: "UNAUTHORIZED", message: "bad token" } });
      state.ws.close();
      return;
    }
    const neg = negotiateProtocol(f.minProtocol, f.maxProtocol);
    if ("error" in neg) {
      this.send(state.ws, { type: "hello-err", error: neg.error });
      state.ws.close();
      return;
    }
    state.scopes = normalizeScopes(f.scopes);
    state.authed = true;
    state.helloDone = true;
    this.send(state.ws, {
      type: "hello-ok",
      protocol: neg.protocol,
      sessionId: randomUUID(),
      caps: f.caps,
    });
  }

  private async handleRequest(state: ConnectionState, id: string, method: string, params: unknown): Promise<void> {
    const ctx: MethodContext = {
      scopes: state.scopes,
      emit: (e, p) => this.bus.publish(e, p),
    };
    const out = await this.router.dispatch(id, method, params, ctx);
    this.send(state.ws, { type: "response", id, ...out });
  }

  private send(ws: WebSocket, frame: ServerFrame): void {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(frame));
  }
}
