/**
 * Authentication Routes
 * Defines routes for user authentication
 */

import express from 'express';
import { login, logout, verifyToken } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/auth/login - User login
router.post('/login', login);

// POST /api/auth/logout - User logout
router.post('/logout', authenticateToken, logout);

// GET /api/auth/verify - Verify token and get user info
router.get('/verify', authenticateToken, verifyToken);

export default router;

