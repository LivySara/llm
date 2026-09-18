import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";
import { loginRateLimit } from "../middleware/rateLimit";

const router = Router();

router.post("/register", authController.register);
router.post("/login", loginRateLimit, authController.login);
router.post("/logout", requireAuth, authController.logout);
router.post("/refresh", requireAuth, authController.refresh);
router.get("/me", requireAuth, authController.me);

export default router;
