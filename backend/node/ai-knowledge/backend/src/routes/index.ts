import { Router } from "express";
import authRoutes from "./auth.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ code: 0, message: "ok", data: { status: "up" } });
});

router.use("/auth", authRoutes);

export default router;
