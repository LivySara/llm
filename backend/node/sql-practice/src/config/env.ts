import dotenv from "dotenv";

dotenv.config();

function required(name: string, value: string | undefined): string {
  if (value === undefined || value === "") {
    throw new Error(`缺少环境变量: ${name}`);
  }
  return value;
}

// 集中管理配置，避免散落各处的 process.env 读取
export const env = {
  port: Number(process.env.PORT ?? 3000),
  mysql: {
    host: required("MYSQL_HOST", process.env.MYSQL_HOST),
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: required("MYSQL_USER", process.env.MYSQL_USER),
    password: process.env.MYSQL_PASSWORD ?? "",
    database: required("MYSQL_DATABASE", process.env.MYSQL_DATABASE),
  },
  redis: {
    host: required("REDIS_HOST", process.env.REDIS_HOST),
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  sessionTtl: Number(process.env.SESSION_TTL ?? 604800),
};
