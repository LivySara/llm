import { pool } from "../db/mysql";
import { RowDataPacket } from "mysql2/promise";
import bcrypt from "bcryptjs";
import { HttpError } from "../utils/http-error";

// 行类型需实现 RowDataPacket，才能用于 mysql2 的 query<T> 泛型
export interface UserRow extends RowDataPacket {
  id: number;
  username: string;
  password: string;
  email: string | null;
  created_at: Date;
}

// 注册：演示参数化查询（? 占位符）防止 SQL 注入、bcrypt 哈希密码
export async function register(username: string, password: string, email?: string) {
  const conn = await pool.getConnection();
  try {
    const [exists] = await conn.query<UserRow[]>(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );
    if (exists.length > 0) {
      throw new HttpError(409, "用户名已存在");
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await conn.query(
      "INSERT INTO users (username, password, email) VALUES (?, ?, ?)",
      [username, hash, email ?? null]
    );
    const insertId = (result as any).insertId;
    return { id: insertId, username, email: email ?? null };
  } finally {
    conn.release();
  }
}

// 登录校验：查用户 → bcrypt.compare 比对密码
export async function verifyLogin(username: string, password: string): Promise<UserRow> {
  const [rows] = await pool.query<UserRow[]>(
    "SELECT * FROM users WHERE username = ?",
    [username]
  );
  const user = rows[0];
  if (!user) {
    throw new HttpError(401, "用户名或密码错误");
  }
  const matched = await bcrypt.compare(password, user.password);
  if (!matched) {
    throw new HttpError(401, "用户名或密码错误");
  }
  return user;
}
