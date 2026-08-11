import { Router } from "express";
import * as articleController from "../controllers/article.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", articleController.list);
router.get("/:id", articleController.getOne);
router.post("/", requireAuth, articleController.create);
router.put("/:id", requireAuth, articleController.update);
router.delete("/:id", requireAuth, articleController.remove);

export default router;
