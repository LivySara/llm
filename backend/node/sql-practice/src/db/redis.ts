import Redis from "ioredis";
import { env } from "../config/env";

// lazyConnect: 先不立即连接，等 testRedis() 显式 connect，方便在启动阶段捕获错误
export const redis = new Redis({
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password,
  retryStrategy: (times) => Math.min(times * 200, 2000), // 指数退避重连
  lazyConnect: true,
});

export async function testRedis(): Promise<void> {
  await redis.connect();
  await redis.ping();
  console.log("[redis] 连接成功");
}
