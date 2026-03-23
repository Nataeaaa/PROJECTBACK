import { Router } from "express";
import { getSavings, getSavingById, createSaving, updateSaving, deleteSaving } from "../controllers/savingController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// Todas protegidas con JWT
router.get("/", authMiddleware, getSavings);
router.get("/:id", authMiddleware, getSavingById);
router.post("/", authMiddleware, createSaving);
router.put("/:id", authMiddleware, updateSaving);
router.delete("/:id", authMiddleware, deleteSaving);

export default router;