import { Router } from 'express';
import { getChallenges, createChallenge, deleteChallenge } from '../controllers/challengeController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get("/", authMiddleware, getChallenges);
router.post("/", authMiddleware, createChallenge);
router.delete("/:id", authMiddleware, deleteChallenge);

export default router;