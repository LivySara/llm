import { Request, Response, NextFunction } from "express";
import * as articleService from "../services/article.service";
import { ok, fail } from "../utils/response";

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 10);
    const result = await articleService.listArticles(page, pageSize);
    ok(res, result);
  } catch (e) { next(e); }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const result = await articleService.getArticle(id);
    ok(res, result);
  } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, content } = req.body ?? {};
    if (!title) {
      return fail(res, 400, "title 必填");
    }
    const result = await articleService.createArticle(req.userId!, title, content);
    ok(res, result, "创建成功");
  } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { title, content } = req.body ?? {};
    const result = await articleService.updateArticle(id, title, content);
    ok(res, result, "更新成功");
  } catch (e) { next(e); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    await articleService.deleteArticle(id);
    ok(res, null, "删除成功");
  } catch (e) { next(e); }
}
