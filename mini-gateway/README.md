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
| 按 sessionKey 分组定向投递 | `events.ts` 的 `ChannelRegistry` + `EventBus` 定向 `publish` |
| 绑定/认证模式 | `server.ts` 的 `GatewayConfig` + 启动期安全默认 |
| healthz / readyz | `server.ts` 的 `handleHttp` |
| Gateway 连接 channel 闭环 | `methods/session.send.ts`（按 sessionKey 定向投递 session.message） |

## 为什么要 Gateway（它解决什么问题）

一句话：**当「很多客户端」要跟「很多后端/能力」通信，并且需要统一认证、能力协商、版本管理、事件分发时，N×N 的直接连接会崩，所以中间长出一层控制面。**

### 出现动机

1. **连接与鉴权集中化**：不希望每个后端服务都各自实现一遍登录、token 校验、限流。Gateway 作为唯一入口，先做握手（handshake = 能力声明 caps + 授权 scope），后端只认 Gateway 转发的请求。
2. **能力声明 + 版本协商**：客户端和后端协议会演进。本仓库的 `negotiateProtocol`（v1）就在连接时先协商「你我都说哪个版本的帧」，避免新旧客户端直接错乱。
3. **事件定向推送（fan-out）**：`events.ts` 的 `EventBus` + `ChannelRegistry` 在做——后端产生一个事件，只投给属于某个 sessionKey 的订阅者，而非全局广播。没有中央总线，每个后端都得自己维护连接列表。
4. **安全默认**：`server.ts` 里 `bind=lan` 但 `auth=none` 直接拒绝启动——把「容易配错的危险组合」在入口处就挡掉，而不是散落各处。

### 如果没有 Gateway，会发生什么（退化成客户端直连后端）

- **认证碎片化**：每个后端都得自己写鉴权，容易漏掉某个老服务，出现「忘了校验 token」的漏洞。
- **N×N 连接爆炸**：10 客户端 × 20 服务 = 200 条连接关系要各自维护、重连、保活。
- **版本地狱**：后端升级协议，所有客户端必须同时改，无法在中间做兼容/协商；旧的 `BAD_FRAME` 会到处冒出来。
- **事件无法定向投递**：想「只把 roomA 的消息给 alice」，每个后端都得自己记录「谁在哪个房间」，且无法跨进程/跨节点复用。本仓库 `session.send.ts` 的按 sessionKey 投递能力会丢失。
- **安全默认形同虚设**：没人统一拦截「对外网暴露却无认证」的危险配置，出事概率陡增。

本质：**没有控制面，系统从「可治理」退回「野蛮生长」。**

### 真实例子

最贴合本模型的是 **Slack 的实时网关（RTM / Events Gateway）**：

- Slack 的 Web、桌面、移动端以及海量第三方 bot/集成，不是直接连一个个业务服务，而是**统一通过网关建立长连接**。
- 网关在握手阶段做认证（token/scope），之后把「消息、presence、频道变更」等事件**按渠道/会话定向推送给对应连接**——与 `EventBus.publish(sessionKey, ...)` 只投给同 channel 订阅者的设计几乎是同一思路。
- 若没有这层网关，每个客户端得自己轮询每个服务、自己维护鉴权和重连、自己判断哪些消息属于自己，根本扛不住千万级并发与海量集成。

再广义一点，**API Gateway** 在业界是标配：Netflix 用 Zuul、AWS 有 API Gateway、Kong 是开源方案。它们解决的是同一个本质问题——**在客户端和一堆后端之间，放一个统一负责入口、鉴权、路由、限流、协议转换的控制面**。本练习项目就是把这一抽象最小可运行地复刻了一遍。

## 请求是怎么流转的（浏览器 → Gateway → 服务）

### 通用 API Gateway（HTTP 转发模型）

```
浏览器
  │  HTTP 请求 (Host: api.x.com, /orders/123, Authorization: Bearer xxx)
  ▼
[Gateway / 反向代理]
  1. 接请求，终止 TLS（https → 内部 http）
  2. 路由匹配（按 Host / path / header 决定去哪个后端）
  3. 统一鉴权（校验 token/session，失败直接 401，不进后端）
  4. 限流 / 熔断 / 改写（加 x-request-id、剥离内部头、补默认头）
  5. 协议转换（HTTP→gRPC / 版本 body 改写）并转发
  ▼
[后端服务 A / B / C]  →  返回响应
  ▼
[Gateway]  6. 收响应、改写、统一加 CORS/缓存头 → 回浏览器
```

浏览器只认 Gateway 一个地址，永远不直接知道后端 A/B/C 在哪。Gateway 把入口、鉴权、路由、限流、协议转换全部收口。

### 本仓库的模型（WebSocket RPC，不是 HTTP 转发）

对照 `server.ts`，HTTP 部分**不是反向代理**——`handleHttp` 只处理探活，其余一律 404：

```ts
private handleHttp(req, res) {
  if (req.url === "/healthz") { /* 200 alive */ }
  if (req.url === "/readyz") { /* 200 ready / 503 not-ready */ }
  res.writeHead(404); res.end();
}
```

所以真正的「浏览器 → Gateway → 服务」走的是 **WebSocket 帧**：

```
浏览器(client.ts)
  │ ① 先 HTTP 升级握手 → 建立 WebSocket 长连接 (wss)
  ▼
[Gateway]
  │ ② handleConnect：校验 token → negotiateProtocol 协商版本
  │    → normalizeScopes 算出 scope → 按 sessionKey 订阅 channel
  │ ③ 之后全部是 WS 帧（不再走 HTTP）：
  │    - 请求帧 → router.dispatch(method, params, ctx)（scope 门控）
  │    - 响应帧 → 回浏览器
  │    - 服务端事件 → EventBus.publish(sessionKey, ...) 定向推回
  ▼
[方法实现 = 这里的「后端服务」, 如 echo / session.send / health]
```

即：**HTTP 在本仓库只负责「建立连接 + 探活」，`healthz` / `readyz`；真正的请求→服务流转发生在 WebSocket 帧上**，由 `Router` 把方法名分发到对应实现，再由 `EventBus` 做服务端事件回推。

| 形态 | 浏览器 → Gateway | Gateway → 服务 |
|---|---|---|
| 通用 API Gateway | HTTP 请求转发 | HTTP/HTTPS 转发到后端 |
| **本仓库 mini-gateway** | HTTP 仅握手/探活 | **WebSocket 帧 → Router 分发 → 方法实现** |

## Gateway 的五项职责（及本仓库覆盖情况）

Gateway 作为控制面，通常要承担下面五项职责。下面逐项标注本仓库**已实现 / 部分 / 未实现**，以区分「通用职责」与「本练习覆盖的边界」。

### 1. 路由（Routing）
决定「请求去哪」。
- 通用：按 Host / path / header 把请求转到对应后端服务（如 `/orders/*` → 订单服务）。
- 本仓库：`router.ts` 做 **RPC 方法路由**，按 `method` 名（`echo` / `session.send` / `health`）dispatch 到对应实现；`server.ts` 收到请求帧 → `router.dispatch(method, params, ctx)`。
- 状态：**✅ 已实现**（粒度是方法名，不是 HTTP path）。

### 2. 认证（Auth）
入口统一校验身份与权限，不让未授权请求进后端。
- 通用：校验 JWT/session，失败直接 401；再按角色/租户决定可访问接口。
- 本仓库：两层——`handleConnect` 校验 `token`（开 `AUTH=token` 时 `UNAUTHORIZED` 直接断连）；`router.register("method", [scope], ...)` 声明所需 scope，`dispatch` 时统一门控，无权限返回错误。
- 状态：**✅ 已实现**（caps≠授权，scope 才是门控依据）。

### 3. 限流（Rate Limiting）
防止单客户端打爆后端，常见令牌桶 / 滑动窗口。
- 通用：如「每 IP 每秒 100 请求」，超限返回 429。
- 本仓库：**❌ 未实现**，无任何配额/计数逻辑（可在 `onMessage` 入口加计数器练手）。
- 状态：**未覆盖**。

### 4. 日志（Logging）
记录「谁、何时、调了什么、结果如何」，用于审计与排查。
- 通用：结构化访问日志（request-id、延迟、状态码）、错误日志、审计日志。
- 本仓库：**⚠️ 仅启动期**——`listen` 时 `console.log` 端口/方法列表，`BIND=lan AUTH=none` 时抛错；运行期无「每请求」结构化访问日志。
- 状态：**部分（仅启动期）**。

### 5. 负载均衡（Load Balancing）
把流量分摊到多个后端实例，避免单点。
- 通用：Gateway 后挂 N 个相同服务，轮询/最少连接/一致性哈希选一个转发。
- 本仓库：**❌ 未实现**——方法是**进程内直接调用**（`router.dispatch` 走内存函数），无「多后端实例」概念；`EventBus` 也是单进程内存，多实例需外部 pub/sub（见练习点 4）。
- 状态：**未覆盖**（单进程练习，不需要）。

| 职责 | 通用 Gateway | 本仓库 mini-gateway |
|---|---|---|
| 路由 | path/host 转发 | ✅ RPC 方法名路由（`router.ts`） |
| 认证 | JWT/session + 权限 | ✅ token 校验 + scope 门控 |
| 限流 | 令牌桶/窗口 | ❌ 未实现 |
| 日志 | 结构化访问日志 | ⚠️ 仅启动期 console.log |
| 负载均衡 | 多实例转发 | ❌ 单进程内调用 |

要点：本仓库把**认证 + 路由 + 事件定向**这三个最核心、最易出错的职责跑通了；限流、负载均衡、请求级日志属于「生产级 Gateway」的增量能力，也是 README 练习点里留的空位。

## 反向代理（Nginx）—— 最易理解的 Gateway 实现

### 正向 vs 反向代理
- **正向代理**：客户端知道目标，借代理出去（如公司翻墙代理）——代理**代表客户端**。
- **反向代理**：客户端以为在跟 `api.x.com` 直接对话，实际是 Nginx 把请求转发给一群后端——代理**代表服务端**。

Gateway 绝大多数就是反向代理（或站在反向代理之上），所以 **Reverse Proxy = 最朴素的 Gateway**。

### 最小 Nginx 反向代理（示意，非本项目文件）

```nginx
http {
  upstream orders { server 10.0.0.1:8080; server 10.0.0.2:8080; }  # 负载均衡
  server {
    listen 443 ssl;
    location /orders/ { proxy_pass http://orders; }                # 路由
    location /healthz { return 200 'alive'; }                      # 探活
    limit_req_zone $binary_remote_addr zone=rl:10m rate=100r/s;    # 限流
    location / { limit_req zone=rl; proxy_pass http://orders; }
  }
}
```

这几行就覆盖了：路由（`location`/`upstream`）、认证（可加 `auth_request`）、限流（`limit_req`）、负载均衡（upstream 多 server 轮询）。

### 映射到本仓库 mini-gateway

| Gateway 职责 | Nginx 反向代理 | 本仓库 mini-gateway |
|---|---|---|
| 入口/监听 | `listen 443` | `http.listen(port, host)`（`server.ts`） |
| 路由 | `location` + `proxy_pass` | `router.dispatch(method, ...)`（`router.ts`） |
| 认证 | `auth_request` / `allow/deny` | token 校验 + scope 门控（`handshake.ts`/`router.ts`） |
| 限流 | `limit_req` | ❌ 未实现 |
| 负载均衡 | `upstream` 多 server | ❌ 单进程内调用 |
| 探活 | `location /healthz` | `handleHttp` 的 `/healthz` `/readyz` |
| 安全默认 | 需手写，易漏 | ✅ `BIND=lan AUTH=none` 直接拒启 |

### 关键差异：为什么要写 mini-gateway，而不只用 Nginx
- **Nginx 是无状态、HTTP 层的转发器**：把请求「搬运」到后端就完了，不理解业务语义，也不持有连接上下文。
- **本仓库是有状态、应用层的控制面**：维护 WebSocket 长连接；握手做协议协商（`negotiateProtocol`）与能力声明（caps）；服务端能按 sessionKey 定向推送事件（`EventBus.publish`）——Nginx 做不了「服务端推」，需 WebSocket 穿透或额外方案。

一句话：**Nginx 是 Gateway 的「外壳」（入口/路由/限流/均衡），mini-gateway 练的是 Gateway 的「内核」（有状态连接、协议协商、事件定向）**。真实生产常叠用：Nginx 做边缘接入/LB，应用 Gateway 做业务语义层。

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

1. **定向投递（已完成 ✅）**：`methods/session.send.ts` 已从「全局广播」改为按 `sessionKey` 分组投递。
   - 新增 `events.ts` 的 `ChannelRegistry`：按 sessionKey 分组保存订阅者；
   - `EventBus.subscribe(sessionKey, fn)` 让连接握手后加入对应 channel，`publish(sessionKey, event, payload)` 只投递给同 channel 的订阅者；
   - `protocol.ts` 的 `ConnectFrame` 增加 `sessionKey`，`server.ts` 在 `handleConnect` 后按 sessionKey 订阅；
   - `client.ts` 现开两个连接（alice→roomA、bob→roomB）验证：向 roomA 发消息只有 alice 收到。`npm run client` 看 PASS/FAIL。

2. **加一个 RPC 方法**：在 `methods/` 里新建文件，`router.register("your.method", ["write"], ...)`，
   并在 `server.ts` 的构造函数里 `registerXxx(this.router)` 注册即可，无需改其他代码。

3. **params 校验 hooks**：当前 `router.ts` 只做 scope 门控。给每个方法加一层
   `validate(params)` 钩子（复用 `protocol.ts` 的守卫思路），让「畸形入参」在分发前就被拦下。

4. **多节点 / 水平扩展**：当前 `EventBus` 是单进程内存。思考若 Gateway 多实例，
   事件如何跨进程广播（提示：接一个外部 pub/sub）。

> 哲学提醒：每个动作都要有可见结果或可被记录的「不动作」——不要写出「调用了却什么都没发生、也没报错」的路径。
