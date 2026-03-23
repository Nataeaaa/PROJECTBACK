import { Router } from 'express';
import { getTransactions, getTransactionById, createTransaction, updateTransaction, deleteTransaction } from '../controllers/transactionController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Todas protegidas con JWT
router.get("/", authMiddleware, getTransactions);
router.get("/:id", authMiddleware, getTransactionById);
router.post("/", authMiddleware, createTransaction);
router.put("/:id", authMiddleware, updateTransaction);
router.delete("/:id", authMiddleware, deleteTransaction);

export default router;