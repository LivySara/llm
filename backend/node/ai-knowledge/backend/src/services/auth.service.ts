import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2/promise";
import { pool } from "../db/mysql";
import { env } from "../config/env";
import { HttpError } from "../utils/http-error";

// 行类型需实现 RowDataPacket，才能用于 mysql2 的 query<T> 泛型
export interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  password: string;
  email: string | null;
  status: number;
  last_login_at: Date | null;
  created_at: Date;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
}

// 用户不存在时也要做一次 bcrypt 比对（耗时与真实比对接近），
// 防止攻击者通过响应耗时差异判断用户名是否存在（时序侧信道）
const DUMMY_HASH = bcrypt.hashSync("__dummy_password__", env.bcryptRounds);

// 注册：参数化查询（? 占位符）防 SQL 注入 + bcrypt 哈希存储密码
export async function register(username: string, password: string, email?: string) {
  const hash = await bcrypt.hash(password, env.bcryptRounds);
  try {
    const [result] = await pool.query(
      "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
      [username, hash, email ?? null]
    );
    const insertId = (result as { insertId: number }).insertId;
    return { id: insertId, username, email: email ?? null };
  } catch (e) {
    // 并发下唯一索引才是可靠保障，这里兜住 1062 重复键错误
    if ((e as { errno?: number }).errno === 1062) {
      throw new HttpError(409, "用户名已存在");
    }
    throw e;
  }
}

// 登录校验：查用户 → bcrypt.compare 比对 → 检查账号状态
export async function verifyLogin(username: string, password: string): Promise<UserRow> {
  const [rows] = await pool.query<UserRow[]>(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );
  const user = rows[0];

  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH); // 抹平响应耗时
    throw new HttpError(401, "用户名或密码错误");
  }

  const matched = await bcrypt.compare(password, user.password);
  if (!matched) {
    throw new HttpError(401, "用户名或密码错误");
  }

  // 先校验密码再校验状态，避免暴露“账号存在但被禁用”
  if (user.status !== 1) {
    throw new HttpError(403, "账号已被禁用，请联系管理员");
  }

  return user;
}

// 登录成功后写回最近登录时间（失败不影响主流程）
export async function touchLogin(userId: number): Promise<void> {
  await pool.query("UPDATE users SET last_login_at = NOW() WHERE id = ?", [userId]);
}

export async function getProfile(userId: number): Promise<UserProfile> {
  const [rows] = await pool.query<UserRow[]>(
    "SELECT id, username, email, last_login_at, created_at FROM users WHERE id = ?",
    [userId]
  );
  const user = rows[0];
  if (!user) {
    throw new HttpError(401, "会话已失效，请重新登录");
  }
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    lastLoginAt: user.last_login_at,
    createdAt: user.created_at,
  };
}
