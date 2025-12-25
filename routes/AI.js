import express from 'express';
const router = express.Router();
import aiController from '../controllers/aiController.js';
import { verifyAuth } from '../middleware/authMiddleware.js';

// Tous les endpoints IA sont protégés
router.post('/analyze-profile', verifyAuth, aiController.analyzeProfile);
router.post('/pitch', verifyAuth, aiController.generatePitch);

export default router;
