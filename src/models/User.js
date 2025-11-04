/**
 * User Model - PostgreSQL
 * Handles user database operations
 */

import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  /**
   * Create a new user
   * @param {string} username - Username
   * @param {string} password - Plain text password
   * @returns {Object} Created user (without password)
   */
  static async create(username, password) {
    try {
      // Hash password with salt rounds of 10
      const password_hash = await bcrypt.hash(password, 10);
      
      const result = await query(
        'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username',
        [username, password_hash]
      );
      
      return result.rows[0];
    } catch (error) {
      throw new Error('User creation failed: ' + error.message);
    }
  }

  /**
   * Find user by username
   * @param {string} username - Username to search for
   * @returns {Object|null} User object or null
   */
  static async findByUsername(username) {
    const result = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0] || null;
  }

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Object|null} User object or null
   */
  static async findById(id) {
    const result = await query(
      'SELECT id, username, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  /**
   * Verify password
   * @param {string} plainPassword - Plain text password
   * @param {string} hashedPassword - Hashed password from database
   * @returns {boolean} True if password matches
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Get total user count
   * @returns {number} Number of users
   */
  static async count() {
    const result = await query('SELECT COUNT(*) as count FROM users');
    return parseInt(result.rows[0].count);
  }
}

export default User;
