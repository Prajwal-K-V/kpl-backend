/**
 * Player Model - PostgreSQL
 * Handles player database operations
 */

import { query } from '../config/database.js';

class Player {
  /**
   * Create a new player
   * @param {string} playerName - Player's name
   * @param {string} position - Player position
   * @param {number} jerseyNumber - Jersey number
   * @param {number|null} teamId - Team ID (null for global players)
   * @param {number} userId - ID of the user creating the player
   * @returns {Object} Created player
   */
  static async create(playerName, position, jerseyNumber, teamId, userId) {
    const result = await query(
      'INSERT INTO players (player_name, position, jersey_number, team_id, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [playerName, position, jerseyNumber, teamId || null, userId]
    );
    
    return result.rows[0];
  }

  /**
   * Get all players for a user with team info
   * @param {number} userId - User ID
   * @returns {Array} Array of players with team names
   */
  static async findAllByUserId(userId) {
    const result = await query(`
      SELECT 
        p.id, 
        p.player_name, 
        p.position, 
        p.jersey_number,
        p.team_id,
        t.team_name,
        t.team_color,
        t.team_logo,
        p.created_at, 
        p.updated_at 
      FROM players p
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE p.user_id = $1 
      ORDER BY 
        CASE WHEN p.team_id IS NULL THEN 0 ELSE 1 END,
        t.team_name ASC NULLS FIRST, 
        p.player_name ASC
    `, [userId]);
    
    return result.rows;
  }

  /**
   * Get all global players (without team assignment)
   * @param {number} userId - User ID
   * @returns {Array} Array of unassigned players
   */
  static async findGlobalPlayers(userId) {
    const result = await query(`
      SELECT 
        id, 
        player_name, 
        position, 
        jersey_number,
        created_at, 
        updated_at 
      FROM players 
      WHERE user_id = $1 AND team_id IS NULL
      ORDER BY player_name ASC
    `, [userId]);
    
    return result.rows;
  }

  /**
   * Get all players for a specific team
   * @param {number} teamId - Team ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Array} Array of players
   */
  static async findAllByTeamId(teamId, userId) {
    const result = await query(`
      SELECT id, player_name, position, jersey_number, created_at, updated_at 
      FROM players 
      WHERE team_id = $1 AND user_id = $2 
      ORDER BY 
        CASE 
          WHEN position IS NULL THEN 1 
          ELSE 0 
        END,
        position ASC,
        player_name ASC
    `, [teamId, userId]);
    
    return result.rows;
  }

  /**
   * Get a single player by ID with team info
   * @param {number} id - Player ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Object|null} Player object or null
   */
  static async findById(id, userId) {
    const result = await query(`
      SELECT 
        p.id, 
        p.player_name, 
        p.position, 
        p.jersey_number,
        p.team_id,
        t.team_name,
        t.team_color,
        p.created_at, 
        p.updated_at 
      FROM players p
      JOIN teams t ON p.team_id = t.id
      WHERE p.id = $1 AND p.user_id = $2
    `, [id, userId]);
    
    return result.rows[0] || null;
  }

  /**
   * Update a player
   * @param {number} id - Player ID
   * @param {string} playerName - Updated player name
   * @param {string} position - Updated position
   * @param {number} jerseyNumber - Updated jersey number
   * @param {number|null} teamId - Updated team ID (null to unassign)
   * @param {number} userId - User ID (for authorization)
   * @returns {boolean} True if update successful
   */
  static async update(id, playerName, position, jerseyNumber, teamId, userId) {
    const result = await query(
      'UPDATE players SET player_name = $1, position = $2, jersey_number = $3, team_id = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 AND user_id = $6',
      [playerName, position, jerseyNumber, teamId || null, id, userId]
    );
    
    return result.rowCount > 0;
  }

  /**
   * Assign player to a team
   * @param {number} playerId - Player ID
   * @param {number} teamId - Team ID
   * @param {number} userId - User ID (for authorization)
   * @returns {boolean} True if assignment successful
   */
  static async assignToTeam(playerId, teamId, userId) {
    const result = await query(
      'UPDATE players SET team_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3',
      [teamId, playerId, userId]
    );
    
    return result.rowCount > 0;
  }

  /**
   * Unassign player from team (make global)
   * @param {number} playerId - Player ID
   * @param {number} userId - User ID (for authorization)
   * @returns {boolean} True if unassignment successful
   */
  static async unassignFromTeam(playerId, userId) {
    const result = await query(
      'UPDATE players SET team_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2',
      [playerId, userId]
    );
    
    return result.rowCount > 0;
  }

  /**
   * Delete a player
   * @param {number} id - Player ID
   * @param {number} userId - User ID (for authorization)
   * @returns {boolean} True if deletion successful
   */
  static async delete(id, userId) {
    const result = await query(
      'DELETE FROM players WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    return result.rowCount > 0;
  }

  /**
   * Get player count for a user
   * @param {number} userId - User ID
   * @returns {number} Number of players
   */
  static async countByUserId(userId) {
    const result = await query(
      'SELECT COUNT(*) as count FROM players WHERE user_id = $1',
      [userId]
    );
    return parseInt(result.rows[0].count);
  }

  /**
   * Get player count for a specific team
   * @param {number} teamId - Team ID
   * @param {number} userId - User ID
   * @returns {number} Number of players
   */
  static async countByTeamId(teamId, userId) {
    const result = await query(
      'SELECT COUNT(*) as count FROM players WHERE team_id = $1 AND user_id = $2',
      [teamId, userId]
    );
    return parseInt(result.rows[0].count);
  }

  /**
   * Search players by name
   * @param {string} searchQuery - Search query
   * @param {number} userId - User ID
   * @returns {Array} Array of matching players
   */
  static async search(searchQuery, userId) {
    const result = await query(`
      SELECT 
        p.id, 
        p.player_name, 
        p.position, 
        p.jersey_number,
        p.team_id,
        t.team_name,
        t.team_color,
        t.team_logo,
        p.created_at, 
        p.updated_at 
      FROM players p
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE p.user_id = $1 AND (p.player_name ILIKE $2 OR t.team_name ILIKE $2) 
      ORDER BY 
        CASE WHEN p.team_id IS NULL THEN 0 ELSE 1 END,
        t.team_name ASC NULLS FIRST, 
        p.player_name ASC
    `, [userId, `%${searchQuery}%`]);
    
    return result.rows;
  }
}

export default Player;
