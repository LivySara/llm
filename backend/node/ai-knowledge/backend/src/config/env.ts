import dotenv from "dotenv";

dotenv.config();

function required(name: string, value: string | undefined): string {
  if (value === undefined || value === "") {
    throw new Error(`缺少环境变量: ${name}`);
  }
  return value;
}

function number(name: string, value: string | undefined, fallback: number): number {
  const n = Number(value ?? fallback);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`环境变量 ${name} 必须是正数，当前值: ${value}`);
  }
  return n;
}

// 集中管理配置，避免散落各处的 process.env 读取
export const env = {
  port: number("PORT", process.env.PORT, 3000),
  mysql: {
    host: required("MYSQL_HOST", process.env.MYSQL_HOST),
    port: number("MYSQL_PORT", process.env.MYSQL_PORT, 3306),
    user: required("MYSQL_USER", process.env.MYSQL_USER),
    password: process.env.MYSQL_PASSWORD ?? "",
    database: required("MYSQL_DATABASE", process.env.MYSQL_DATABASE),
  },
  redis: {
    host: required("REDIS_HOST", process.env.REDIS_HOST),
    port: number("REDIS_PORT", process.env.REDIS_PORT, 6379),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  // 会话有效期（秒）
  sessionTtl: number("SESSION_TTL", process.env.SESSION_TTL, 604800),
  // bcrypt 计算成本
  bcryptRounds: number("BCRYPT_ROUNDS", process.env.BCRYPT_ROUNDS, 10),
  // 登录失败限流：window 秒内最多 attempts 次失败
  loginMaxAttempts: number("LOGIN_MAX_ATTEMPTS", process.env.LOGIN_MAX_ATTEMPTS, 5),
  loginWindowSec: number("LOGIN_WINDOW_SEC", process.env.LOGIN_WINDOW_SEC, 900),
};
