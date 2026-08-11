import express from "express";
import cors from "cors";
import helmet from "helmet";
import router from "./routes";
import { errorHandler, notFound } from "./middleware/errorHandler";
import { testMysql } from "./db/mysql";
import { testRedis } from "./db/redis";
import { env } from "./config/env";

async function bootstrap() {
  // 启动前先确保 MySQL / Redis 可用，避免“带着坏依赖运行”
  await testMysql();
  await testRedis();

  const app = express();
  app.use(helmet());          // 基础安全响应头
  app.use(cors());            // 跨域（学习用，生产应限制来源）
  app.use(express.json());    // 解析 JSON 请求体

  app.use("/api", router);

  // 兜底中间件必须放在路由注册之后
  app.use(notFound);
  app.use(errorHandler);

  app.listen(env.port, () => {
    console.log(`[server] 监听 http://localhost:${env.port}`);
  });
}

bootstrap().catch((err) => {
  console.error("启动失败:", err);
  process.exit(1);
});
