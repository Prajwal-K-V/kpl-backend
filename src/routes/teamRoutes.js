/**
 * Team Routes
 * Defines routes for team CRUD operations
 */

import express from 'express';
import {
  getAllTeams,
  getTeamById,
  getTeamHierarchy,
  createTeam,
  updateTeam,
  deleteTeam
} from '../controllers/teamController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all team routes
router.use(authenticateToken);

// GET /api/teams - Get all teams
router.get('/', getAllTeams);

// GET /api/teams/:id - Get single team
router.get('/:id', getTeamById);

// GET /api/teams/:id/hierarchy - Get team with all players
router.get('/:id/hierarchy', getTeamHierarchy);

// POST /api/teams - Create new team
router.post('/', createTeam);

// PUT /api/teams/:id - Update team
router.put('/:id', updateTeam);

// DELETE /api/teams/:id - Delete team
router.delete('/:id', deleteTeam);

export default router;

