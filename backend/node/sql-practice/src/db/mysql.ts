import mysql from "mysql2/promise";
import { env } from "../config/env";

// 连接池：复用 TCP 连接，避免每次请求都建立/断开连接带来的开销。
// 生产环境务必使用连接池，单连接无法支撑并发。
export const pool = mysql.createPool({
  host: env.mysql.host,
  port: env.mysql.port,
  user: env.mysql.user,
  password: env.mysql.password,
  database: env.mysql.database,
  waitForConnections: true, // 连接不够时排队，而不是直接报错
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
});

// 应用启动时调用，验证 MySQL 连通性
export async function testMysql(): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.query("SELECT 1");
    console.log("[mysql] 连接成功");
  } finally {
    conn.release();
  }
}
