# mini-gateway

一个最小可运行的 **Gateway（控制面）** 练习项目，用来内化 OpenClaw 里 Gateway 的核心概念。
它复刻了 OpenClaw Gateway 的三个关键抽象：**带版本的 WebSocket RPC 协议**、**握手即能力声明 + 授权**、**服务端事件推送**，以及其安全默认。

## 概念 → 代码 对照

| 概念（来自 OpenClaw） | 本仓库落点 |
|---|---|
| 带版本的 WebSocket RPC（v4） | `protocol.ts` 帧定义 + `handshake.ts` 版本协商（这里用 v1） |
| 分层帧校验 | `protocol.ts` 的 `isConnectFrame` / `isRequestFrame` 守卫 |
| 握手 = 能力声明(caps) + 授权(scope) | `handshake.ts`（caps≠授权，scope 才是门控依据） |
| 方法注册表 + scope 门控 | `router.ts`（`register` 声明所需 scope，分发时统一校验） |
| 服务端事件推送（seq 自增） | `events.ts` 的 `EventBus` |
| 绑定/认证模式 | `server.ts` 的 `GatewayConfig` + 启动期安全默认 |
| healthz / readyz | `server.ts` 的 `handleHttp` |
| Gateway 连接 channel 闭环 | `methods/session.send.ts`（广播 session.message 事件） |

## 运行

```bash
cd mini-gateway
npm install        # 或 pnpm install
npm start          # 启动 gateway（默认 127.0.0.1:8787, loopback + 无认证）
```

另开一个终端跑演示客户端：

```bash
npm run client
```

你应该看到客户端：
1. 收到 `hello-ok`（握手成功，协商出的协议版本）
2. 收到 `echo` 的响应
3. 收到 `session.send` 的响应
4. 收到服务端主动推送的 `event: session.message`

也可单独探活：
```bash
curl http://127.0.0.1:8787/healthz
curl http://127.0.0.1:8787/readyz
```

## 体验安全默认

```bash
BIND=lan AUTH=none npm start
# → 抛出 refusing to start: binding 'lan' requires auth (set auth=token)
```

```bash
BIND=lan AUTH=token TOKEN=secret npm start
# → 正常启动；此时客户端必须带 token 才能握手
TOKEN=secret npm run client
```

## 给你自己落地的练习点

1. **定向投递（核心练习）**：`methods/session.send.ts` 现在是全局广播。
   改成按 `sessionKey` 分组投递——新建 `ChannelRegistry` 按 sessionKey 保存订阅者，
   只有同 sessionKey 的连接才收到 `session.message`。开两个 client 验证。

2. **加一个 RPC 方法**：在 `methods/` 里新建文件，`router.register("your.method", ["write"], ...)`，
   并在 `server.ts` 的构造函数里 `registerXxx(this.router)` 注册即可，无需改其他代码。

3. **params 校验 hooks**：当前 `router.ts` 只做 scope 门控。给每个方法加一层
   `validate(params)` 钩子（复用 `protocol.ts` 的守卫思路），让「畸形入参」在分发前就被拦下。

4. **多节点 / 水平扩展**：当前 `EventBus` 是单进程内存。思考若 Gateway 多实例，
   事件如何跨进程广播（提示：接一个外部 pub/sub）。

> 哲学提醒：每个动作都要有可见结果或可被记录的「不动作」——不要写出「调用了却什么都没发生、也没报错」的路径。
