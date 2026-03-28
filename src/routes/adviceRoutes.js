import { Router } from "express";
import { getDailyAdvice } from "../controllers/adviceController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/", authMiddleware, getDailyAdvice);

export default router;