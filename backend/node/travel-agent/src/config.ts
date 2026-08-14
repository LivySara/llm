// 读取 .env 中的运行配置（对应 Python 版 config.py）。
import dotenv from "dotenv";

dotenv.config();

export const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
export const DEEPSEEK_BASE_URL =
  process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";
export const MODEL = process.env.MODEL || "deepseek-chat";

/** 启动 MCP server 子进程所用的命令（python / python3）。 */
export const SERVER_COMMAND = process.env.SERVER_COMMAND || "python";
export const MEMORY_FILE = process.env.MEMORY_FILE || "memory_store.json";

// 支持同时连接多个 MCP server（逗号分隔）。
// 兼容旧配置：若只配了 SERVER_PATH，则当作单 server 使用。
const serverPaths = (process.env.SERVER_PATHS || "")
  .split(",")
  .map((p) => p.trim())
  .filter(Boolean);
const single = process.env.SERVER_PATH?.trim();
export const SERVER_PATHS: string[] = serverPaths.length
  ? serverPaths
  : single
    ? [single]
    : [];

if (!DEEPSEEK_API_KEY || DEEPSEEK_API_KEY.startsWith("sk-XXXX")) {
  throw new Error("请在 .env 中配置真实的 DEEPSEEK_API_KEY");
}
if (!SERVER_PATHS.length) {
  throw new Error(
    "请在 .env 中配置 SERVER_PATHS（逗号分隔的多个 mcp server.py 绝对路径），或配置 SERVER_PATH",
  );
}
