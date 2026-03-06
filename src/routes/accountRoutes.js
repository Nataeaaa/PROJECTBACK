import { Router } from "express";
import { getAccounts, getAccountById, createAccount, updateAccount, deleteAccount } from "../controllers/accountController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// Todas protegidas con JWT
router.get("/", authMiddleware, getAccounts);
router.get("/:id", authMiddleware, getAccountById);
router.post("/", authMiddleware, createAccount);
router.put("/:id", authMiddleware, updateAccount);
router.delete("/:id", authMiddleware, deleteAccount);

export default router;