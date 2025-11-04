/**
 * Player Routes
 * Defines routes for player CRUD operations
 */

import express from 'express';
import {
  getAllPlayers,
  getGlobalPlayers,
  getPlayerById,
  createPlayer,
  updatePlayer,
  assignPlayerToTeam,
  unassignPlayerFromTeam,
  deletePlayer,
  searchPlayers
} from '../controllers/playerController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication middleware to all player routes
router.use(authenticateToken);

// GET /api/players - Get all players
router.get('/', getAllPlayers);

// GET /api/players/global - Get global (unassigned) players
router.get('/global', getGlobalPlayers);

// GET /api/players/search - Search players (must be before /:id route)
router.get('/search', searchPlayers);

// GET /api/players/:id - Get single player
router.get('/:id', getPlayerById);

// POST /api/players - Create new player
router.post('/', createPlayer);

// PUT /api/players/:id - Update player
router.put('/:id', updatePlayer);

// PUT /api/players/:id/assign - Assign player to team
router.put('/:id/assign', assignPlayerToTeam);

// PUT /api/players/:id/unassign - Unassign player from team
router.put('/:id/unassign', unassignPlayerFromTeam);

// DELETE /api/players/:id - Delete player
router.delete('/:id', deletePlayer);

export default router;

