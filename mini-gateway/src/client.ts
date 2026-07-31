// client.ts
// 演示客户端：握手 → 调 echo → 调 session.send → 收到服务端推送的事件。
import { WebSocket } from "ws";

const port = Number(process.env.PORT ?? 8787);
const ws = new WebSocket(`ws://127.0.0.1:${port}`);

ws.on("open", () => {
  ws.send(
    JSON.stringify({
      type: "connect",
      minProtocol: 1,
      maxProtocol: 1,
      caps: ["TOOL_EVENTS"],
      role: "client",
      scopes: ["connect", "read", "write"],
      token: process.env.TOKEN,
    }),
  );
});

ws.on("message", (d) => {
  const f = JSON.parse(d.toString());
  console.log("[recv]", JSON.stringify(f));

  if (f.type === "event" && f.event === "session.message") {
    console.log("[done] received server push, closing");
    ws.close();
    return;
  }

  if (f.type === "hello-ok") {
    // 握手成功后再发请求
    ws.send(JSON.stringify({ type: "request", id: "1", method: "echo", params: "hello gateway" }));
    ws.send(
      JSON.stringify({ type: "request", id: "2", method: "session.send", params: { sessionKey: "demo", text: "hi from client" } }),
    );
  }
});

ws.on("error", (e) => console.error("[error]", e.message));
