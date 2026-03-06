import { Router } from "express";
import { register, login, getProfile, updateProfile, changePassword } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// Públicas
router.post("/register", register);
router.post("/login", login);

// Protegidas
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);

export default router;