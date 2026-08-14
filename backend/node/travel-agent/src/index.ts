// CLI 入口（对应 Python 版 agent.py 的 main 函数）：
// 连接多个 MCP server -> 恢复/新建记忆 -> 交互循环（规划 + ReAct + 压缩 + 自检 + 持久化）。
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import fs from "node:fs";
import OpenAI from "openai";
import {
  DEEPSEEK_API_KEY,
  DEEPSEEK_BASE_URL,
  MEMORY_FILE,
  SERVER_PATHS,
  SERVER_COMMAND,
} from "./config.js";
import { Memory } from "./memory.js";
import { connectServers, type McpConnection } from "./mcpClient.js";
import { react } from "./agent.js";
import { decompose, reviewPlan, summarizeDialogue } from "./planner.js";
import type { PlanNode } from "./types.js";

const SYSTEM_PROMPT = `你是一个北京环球影城旅行规划助手。
你可以调用工具查询门票价格（含按票种、按日期、按关键词检索），以及获取游玩攻略（贴士、必玩、餐饮、最佳日期、拥挤度）。
当用户询问票价、预算、行程时，请先用工具获取准确数据，再进行计算和回答。
请用简体中文、清晰分步地回答，必要时列出计算过程。`;

/** 把分层节点树拍平成目标字符串列表，供 reviewPlan 等扁平接口使用。 */
function flattenPlan(nodes: PlanNode[]): string[] {
  const out: string[] = [];
  for (const n of nodes) {
    out.push(n.goal);
    if (n.sub) out.push(...flattenPlan(n.sub));
  }
  return out;
}

/** 递归打印分层规划（缩进表示层级）。 */
function printPlan(nodes: PlanNode[], indent = 0): void {
  if (!nodes.length) {
    console.log("（暂无规划）");
    return;
  }
  if (indent === 0) console.log("📋 当前规划：");
  nodes.forEach((n, i) => {
    const prefix = "  ".repeat(indent) + `${i + 1}. `;
    const sub = n.sub ? " ▸" : "";
    console.log(`${prefix}${n.goal}${sub}`);
    if (n.sub) printPlan(n.sub, indent + 1);
  });
}

async function main(): Promise<void> {
  const client = new OpenAI({
    apiKey: DEEPSEEK_API_KEY,
    baseURL: DEEPSEEK_BASE_URL,
  });

  // 尝试恢复上次会话（跨会话记忆）
  let memory: Memory;
  if (fs.existsSync(MEMORY_FILE)) {
    const loaded = Memory.load(MEMORY_FILE);
    if (loaded) {
      memory = loaded;
      console.log(
        `[记忆] 已恢复上次会话（${memory.messages.length} 条消息，${memory.plan.length} 个规划步骤）`,
      );
    } else {
      memory = new Memory(SYSTEM_PROMPT);
    }
  } else {
    memory = new Memory(SYSTEM_PROMPT);
  }

  // 连接多个 MCP server（每个以独立子进程 stdio 启动）
  const conn: McpConnection = await connectServers(SERVER_PATHS, SERVER_COMMAND);

  console.log("=".repeat(50));
  console.log("北京环球影城旅行规划 Agent（Node.js + TypeScript 重写）");
  console.log(
    `已连接 ${conn.clients.length} 个 MCP server，可用工具：`,
    conn.functions.map((f) => f.function.name),
  );
  console.log("命令：/new 清空会话 | /plan 查看规划 | exit 退出");
  console.log("=".repeat(50));
  if (memory.plan.length) printPlan(memory.plan);

  const rl = readline.createInterface({ input, output });

  const cleanup = async (): Promise<void> => {
    for (const c of conn.clients) {
      try {
        await c.close();
      } catch {
        /* 忽略关闭错误 */
      }
    }
  };

  try {
    while (true) {
      let q: string;
      try {
        q = (await rl.question("\n你：")).trim();
      } catch {
        break;
      }
      if (!q) continue;
      if (["exit", "quit", "q", "退出"].includes(q.toLowerCase())) break;
      if (q.toLowerCase() === "/new") {
        memory = new Memory(SYSTEM_PROMPT);
        console.log("[记忆] 已清空，开始新会话。");
        continue;
      }
      if (q.toLowerCase() === "/plan") {
        printPlan(memory.plan);
        continue;
      }

      memory.add("user", q);

      // ① 规划：把需求递归拆成多层子目标（Plan-and-Execute 的 Plan 阶段）
      const nodes = await decompose(client, q, conn.functions);
      if (nodes.length) {
        memory.setPlan(nodes);
        printPlan(nodes);
      }

      // ② 执行：进入 ReAct 循环完成规划（工具按名路由到对应 server）
      await react(client, conn.toolSessionMap, conn.functions, memory);

      // ③ 上下文压缩：超出窗口的早期对话摘要化，而非硬截断
      await memory.compress((newText, prev) =>
        summarizeDialogue(client, newText, prev),
      );

      // ④ 自检：规划完成度（扁平化后与对话记录比对）
      const flat = flattenPlan(memory.plan);
      if (flat.length) {
        const review = await reviewPlan(client, flat, () => memory.export());
        console.log("\n✅ 已完成：", review.completed.join("、") || "无");
        console.log("⏳ 未完成：", review.remaining.join("、") || "无");
        if (review.all_done) console.log("🎉 规划已全部完成。");
      }

      // ⑤ 持久化：把对话、规划与摘要存盘，下次可恢复
      memory.save(MEMORY_FILE);
      console.log(`[记忆] 已保存到 ${MEMORY_FILE}`);
    }
  } finally {
    rl.close();
    await cleanup();
  }
  console.log("\n再见！");
}

main().catch((err) => {
  console.error("运行出错：", err);
  process.exit(1);
});
