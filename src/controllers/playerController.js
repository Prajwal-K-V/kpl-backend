/**
 * Player Controller
 * Handles player CRUD operations including global players
 */

import Player from '../models/Player.js';

/**
 * Get all players for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllPlayers = async (req, res) => {
  try {
    const players = await Player.findAllByUserId(req.user.id);
    
    res.json({
      success: true,
      count: players.length,
      data: players
    });
  } catch (error) {
    console.error('Get players error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching players.' 
    });
  }
};

/**
 * Get all global players (unassigned)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getGlobalPlayers = async (req, res) => {
  try {
    const players = await Player.findGlobalPlayers(req.user.id);
    
    res.json({
      success: true,
      count: players.length,
      data: players
    });
  } catch (error) {
    console.error('Get global players error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching global players.' 
    });
  }
};

/**
 * Get a single player by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getPlayerById = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id, req.user.id);
    
    if (!player) {
      return res.status(404).json({ 
        success: false, 
        message: 'Player not found.' 
      });
    }

    res.json({
      success: true,
      data: player
    });
  } catch (error) {
    console.error('Get player error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching player.' 
    });
  }
};

/**
 * Create a new player
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createPlayer = async (req, res) => {
  try {
    const { player_name, position, jersey_number, team_id } = req.body;

    // Validate input - team_id is now optional for global players
    if (!player_name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Player name is required.' 
      });
    }

    // Trim whitespace
    const cleanPlayerName = player_name.trim();
    const cleanPosition = position ? position.trim() : null;
    const cleanJerseyNumber = jersey_number || null;

    if (cleanPlayerName.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Player name cannot be empty.' 
      });
    }

    // Create player (team_id can be null for global players)
    const player = await Player.create(
      cleanPlayerName, 
      cleanPosition, 
      cleanJerseyNumber, 
      team_id || null, 
      req.user.id
    );

    res.status(201).json({
      success: true,
      message: team_id ? 'Player created successfully.' : 'Global player created successfully.',
      data: player
    });
  } catch (error) {
    console.error('Create player error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating player.' 
    });
  }
};

/**
 * Update a player
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updatePlayer = async (req, res) => {
  try {
    const { player_name, position, jersey_number, team_id } = req.body;

    // Validate input - team_id is now optional
    if (!player_name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Player name is required.' 
      });
    }

    // Trim whitespace
    const cleanPlayerName = player_name.trim();
    const cleanPosition = position ? position.trim() : null;
    const cleanJerseyNumber = jersey_number || null;

    if (cleanPlayerName.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Player name cannot be empty.' 
      });
    }

    // Update player (team_id can be null to make player global)
    const success = await Player.update(
      req.params.id, 
      cleanPlayerName, 
      cleanPosition, 
      cleanJerseyNumber, 
      team_id || null,
      req.user.id
    );

    if (!success) {
      return res.status(404).json({ 
        success: false, 
        message: 'Player not found or update failed.' 
      });
    }

    // Fetch updated player
    const updatedPlayer = await Player.findById(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'Player updated successfully.',
      data: updatedPlayer
    });
  } catch (error) {
    console.error('Update player error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating player.' 
    });
  }
};

/**
 * Assign player to a team
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const assignPlayerToTeam = async (req, res) => {
  try {
    const { team_id } = req.body;
    const playerId = req.params.id;

    if (!team_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Team ID is required.' 
      });
    }

    const success = await Player.assignToTeam(playerId, team_id, req.user.id);

    if (!success) {
      return res.status(404).json({ 
        success: false, 
        message: 'Player not found or assignment failed.' 
      });
    }

    const updatedPlayer = await Player.findById(playerId, req.user.id);

    res.json({
      success: true,
      message: 'Player assigned to team successfully.',
      data: updatedPlayer
    });
  } catch (error) {
    console.error('Assign player error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while assigning player.' 
    });
  }
};

/**
 * Unassign player from team (make global)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const unassignPlayerFromTeam = async (req, res) => {
  try {
    const playerId = req.params.id;

    const success = await Player.unassignFromTeam(playerId, req.user.id);

    if (!success) {
      return res.status(404).json({ 
        success: false, 
        message: 'Player not found or unassignment failed.' 
      });
    }

    res.json({
      success: true,
      message: 'Player removed from team successfully.'
    });
  } catch (error) {
    console.error('Unassign player error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while unassigning player.' 
    });
  }
};

/**
 * Delete a player
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deletePlayer = async (req, res) => {
  try {
    const success = await Player.delete(req.params.id, req.user.id);

    if (!success) {
      return res.status(404).json({ 
        success: false, 
        message: 'Player not found or deletion failed.' 
      });
    }

    res.json({
      success: true,
      message: 'Player deleted successfully.'
    });
  } catch (error) {
    console.error('Delete player error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting player.' 
    });
  }
};

/**
 * Search players by name or team
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const searchPlayers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Search query is required.' 
      });
    }

    const players = await Player.search(q.trim(), req.user.id);

    res.json({
      success: true,
      count: players.length,
      data: players
    });
  } catch (error) {
    console.error('Search players error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while searching players.' 
    });
  }
};
