import { Router } from "express";
import { register, login, getProfile, updateProfile, changePassword, forgotPassword, resetPassword} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// Públicas
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);

// Protegidas
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);


export default router;