import { pool } from "../db/mysql";
import { RowDataPacket } from "mysql2/promise";
import { redis } from "../db/redis";
import { HttpError } from "../utils/http-error";

// 行类型需实现 RowDataPacket，才能用于 mysql2 的 query<T> 泛型
export interface ArticleRow extends RowDataPacket {
  id: number;
  author_id: number;
  title: string;
  content: string | null;
  view_count: number;
  created_at: Date;
  updated_at: Date;
}

const listCacheKey = "articles:list";
const articleCacheKey = (id: number) => `article:${id}`;

// 列表：先查 Redis 缓存，未命中再查 MySQL 并回写（缓存 60s）
export async function listArticles(page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize;

  const cached = await redis.get(listCacheKey);
  if (cached) {
    return { source: "cache", data: JSON.parse(cached) };
  }

  const [rows] = await pool.query<ArticleRow[]>(
    "SELECT id, author_id, title, content, view_count, created_at, updated_at FROM articles ORDER BY id DESC LIMIT ? OFFSET ?",
    [pageSize, offset]
  );

  await redis.set(listCacheKey, JSON.stringify(rows), "EX", 60);
  return { source: "db", data: rows };
}

// 详情：演示单条缓存（缓存 300s）
export async function getArticle(id: number) {
  const key = articleCacheKey(id);
  const cached = await redis.get(key);
  if (cached) {
    return { source: "cache", data: JSON.parse(cached) };
  }

  const [rows] = await pool.query<ArticleRow[]>(
    "SELECT id, author_id, title, content, view_count, created_at, updated_at FROM articles WHERE id = ?",
    [id]
  );
  const article = rows[0];
  if (!article) {
    throw new HttpError(404, "文章不存在");
  }
  await redis.set(key, JSON.stringify(article), "EX", 300);
  return { source: "db", data: article };
}

// 创建：写操作后失效列表缓存，保证缓存与数据库一致
export async function createArticle(authorId: number, title: string, content?: string) {
  const [result] = await pool.query(
    "INSERT INTO articles (author_id, title, content) VALUES (?, ?, ?)",
    [authorId, title, content ?? null]
  );
  const insertId = (result as any).insertId;
  await redis.del(listCacheKey);
  return { id: insertId };
}

// 更新：演示事务（BEGIN / COMMIT / ROLLBACK）+ 行锁（FOR UPDATE）
export async function updateArticle(id: number, title?: string, content?: string) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query<ArticleRow[]>(
      "SELECT id FROM articles WHERE id = ? FOR UPDATE",
      [id]
    );
    if (rows.length === 0) {
      await conn.rollback();
      throw new HttpError(404, "文章不存在");
    }

    const fields: string[] = [];
    const values: any[] = [];
    if (title !== undefined) { fields.push("title = ?"); values.push(title); }
    if (content !== undefined) { fields.push("content = ?"); values.push(content); }

    if (fields.length > 0) {
      values.push(id);
      await conn.query(`UPDATE articles SET ${fields.join(", ")} WHERE id = ?`, values);
    }

    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }

  await redis.del(articleCacheKey(id));
  await redis.del(listCacheKey);
  return { id };
}

// 删除：注意外键约束，先删文章再删会话缓存
export async function deleteArticle(id: number) {
  const [result] = await pool.query("DELETE FROM articles WHERE id = ?", [id]);
  const affected = (result as any).affectedRows;
  if (affected === 0) {
    throw new HttpError(404, "文章不存在");
  }
  await redis.del(articleCacheKey(id));
  await redis.del(listCacheKey);
}
