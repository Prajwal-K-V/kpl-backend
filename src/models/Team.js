/**
 * Team Model - PostgreSQL
 * Handles team database operations
 */

import { query } from '../config/database.js';

class Team {
  /**
   * Create a new team
   * @param {string} teamName - Team's name
   * @param {string} teamLogo - Team logo emoji or icon
   * @param {string} teamColor - Team color (hex)
   * @param {string} description - Team description
   * @param {number} userId - ID of the user creating the team
   * @returns {Object} Created team
   */
  static async create(teamName, teamLogo, teamColor, description, userId) {
    const result = await query(
      'INSERT INTO teams (team_name, team_logo, team_color, description, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [teamName, teamLogo, teamColor, description, userId]
    );
    
    return result.rows[0];
  }

  /**
   * Get all teams for a user
   * @param {number} userId - User ID
   * @returns {Array} Array of teams
   */
  static async findAllByUserId(userId) {
    const result = await query(
      'SELECT id, team_name, team_logo, team_color, description, created_at, updated_at FROM teams WHERE user_id = $1 ORDER BY team_name ASC',
      [userId]
    );
    return result.rows;
  }

  /**
   * Get a single team by ID
   * @param {number} id - Team ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Object|null} Team object or null
   */
  static async findById(id, userId) {
    const result = await query(
      'SELECT id, team_name, team_logo, team_color, description, created_at, updated_at FROM teams WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0] || null;
  }

  /**
   * Get team with player count
   * @param {number} id - Team ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Object|null} Team with player count
   */
  static async findByIdWithPlayerCount(id, userId) {
    const result = await query(`
      SELECT 
        t.id, 
        t.team_name, 
        t.team_logo, 
        t.team_color, 
        t.description, 
        t.created_at, 
        t.updated_at,
        COUNT(p.id) as player_count
      FROM teams t
      LEFT JOIN players p ON t.id = p.team_id
      WHERE t.id = $1 AND t.user_id = $2
      GROUP BY t.id
    `, [id, userId]);
    
    if (result.rows[0]) {
      result.rows[0].player_count = parseInt(result.rows[0].player_count);
    }
    return result.rows[0] || null;
  }

  /**
   * Get all teams with player counts
   * @param {number} userId - User ID
   * @returns {Array} Array of teams with player counts
   */
  static async findAllWithPlayerCounts(userId) {
    const result = await query(`
      SELECT 
        t.id, 
        t.team_name, 
        t.team_logo, 
        t.team_color, 
        t.description, 
        t.created_at, 
        t.updated_at,
        COUNT(p.id) as player_count
      FROM teams t
      LEFT JOIN players p ON t.id = p.team_id
      WHERE t.user_id = $1
      GROUP BY t.id
      ORDER BY t.team_name ASC
    `, [userId]);
    
    // Convert player_count to integer
    return result.rows.map(row => ({
      ...row,
      player_count: parseInt(row.player_count)
    }));
  }

  /**
   * Update a team
   * @param {number} id - Team ID
   * @param {string} teamName - Updated team name
   * @param {string} teamLogo - Updated team logo
   * @param {string} teamColor - Updated team color
   * @param {string} description - Updated description
   * @param {number} userId - User ID (for authorization)
   * @returns {boolean} True if update successful
   */
  static async update(id, teamName, teamLogo, teamColor, description, userId) {
    const result = await query(
      'UPDATE teams SET team_name = $1, team_logo = $2, team_color = $3, description = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 AND user_id = $6',
      [teamName, teamLogo, teamColor, description, id, userId]
    );
    
    return result.rowCount > 0;
  }

  /**
   * Delete a team
   * @param {number} id - Team ID
   * @param {number} userId - User ID (for authorization)
   * @returns {boolean} True if deletion successful
   */
  static async delete(id, userId) {
    const result = await query(
      'DELETE FROM teams WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    
    return result.rowCount > 0;
  }

  /**
   * Get team count for a user
   * @param {number} userId - User ID
   * @returns {number} Number of teams
   */
  static async countByUserId(userId) {
    const result = await query(
      'SELECT COUNT(*) as count FROM teams WHERE user_id = $1',
      [userId]
    );
    return parseInt(result.rows[0].count);
  }

  /**
   * Get team hierarchy (team with all players)
   * @param {number} teamId - Team ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Object|null} Team with players array
   */
  static async getTeamHierarchy(teamId, userId) {
    // Get team info
    const team = await this.findById(teamId, userId);
    if (!team) return null;

    // Get all players for this team
    const playersResult = await query(`
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
    
    return {
      ...team,
      players: playersResult.rows
    };
  }
}

export default Team;
