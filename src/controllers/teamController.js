/**
 * Team Controller
 * Handles team CRUD operations
 */

import Team from '../models/Team.js';

/**
 * Get all teams for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.findAllWithPlayerCounts(req.user.id);
    
    res.json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching teams.' 
    });
  }
};

/**
 * Get a single team by ID with player count
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findByIdWithPlayerCount(req.params.id, req.user.id);
    
    if (!team) {
      return res.status(404).json({ 
        success: false, 
        message: 'Team not found.' 
      });
    }

    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching team.' 
    });
  }
};

/**
 * Get team hierarchy (team with all players)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getTeamHierarchy = async (req, res) => {
  try {
    const teamHierarchy = await Team.getTeamHierarchy(req.params.id, req.user.id);
    
    if (!teamHierarchy) {
      return res.status(404).json({ 
        success: false, 
        message: 'Team not found.' 
      });
    }

    res.json({
      success: true,
      data: teamHierarchy
    });
  } catch (error) {
    console.error('Get team hierarchy error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching team hierarchy.' 
    });
  }
};

/**
 * Create a new team
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createTeam = async (req, res) => {
  try {
    const { team_name, team_logo, team_color, description } = req.body;

    // Validate input
    if (!team_name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Team name is required.' 
      });
    }

    // Trim whitespace
    const cleanTeamName = team_name.trim();
    const cleanDescription = description ? description.trim() : '';
    const cleanTeamLogo = team_logo ? team_logo.trim() : '⚽';
    const cleanTeamColor = team_color || '#0ea5e9';

    if (cleanTeamName.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Team name cannot be empty.' 
      });
    }

    // Create team
    const team = await Team.create(
      cleanTeamName, 
      cleanTeamLogo, 
      cleanTeamColor, 
      cleanDescription,
      req.user.id
    );

    res.status(201).json({
      success: true,
      message: 'Team created successfully.',
      data: team
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating team.' 
    });
  }
};

/**
 * Update a team
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateTeam = async (req, res) => {
  try {
    const { team_name, team_logo, team_color, description } = req.body;

    // Validate input
    if (!team_name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Team name is required.' 
      });
    }

    // Trim whitespace
    const cleanTeamName = team_name.trim();
    const cleanDescription = description ? description.trim() : '';
    const cleanTeamLogo = team_logo ? team_logo.trim() : '⚽';
    const cleanTeamColor = team_color || '#0ea5e9';

    if (cleanTeamName.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Team name cannot be empty.' 
      });
    }

    // Update team
    const success = await Team.update(
      req.params.id, 
      cleanTeamName, 
      cleanTeamLogo, 
      cleanTeamColor, 
      cleanDescription,
      req.user.id
    );

    if (!success) {
      return res.status(404).json({ 
        success: false, 
        message: 'Team not found or update failed.' 
      });
    }

    // Fetch updated team
    const updatedTeam = await Team.findById(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'Team updated successfully.',
      data: updatedTeam
    });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating team.' 
    });
  }
};

/**
 * Delete a team
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteTeam = async (req, res) => {
  try {
    const success = await Team.delete(req.params.id, req.user.id);

    if (!success) {
      return res.status(404).json({ 
        success: false, 
        message: 'Team not found or deletion failed.' 
      });
    }

    res.json({
      success: true,
      message: 'Team and all associated players deleted successfully.'
    });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting team.' 
    });
  }
};

