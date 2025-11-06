/**
 * Database Migration Script
 * Run this once to update the schema for global players support
 */

import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const { Client } = pg;

async function runMigration() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database');

    console.log('🔄 Running migration...');
    
    // Make team_id nullable
    await client.query(`
      ALTER TABLE players 
      ALTER COLUMN team_id DROP NOT NULL
    `);
    console.log('✅ Made team_id nullable');

    // Update foreign key constraint
    await client.query(`
      ALTER TABLE players
      DROP CONSTRAINT IF EXISTS players_team_id_fkey
    `);
    console.log('✅ Dropped old foreign key constraint');

    await client.query(`
      ALTER TABLE players
      ADD CONSTRAINT players_team_id_fkey 
      FOREIGN KEY (team_id) 
      REFERENCES teams(id) 
      ON DELETE SET NULL
    `);
    console.log('✅ Added new foreign key constraint');

    // Verify
    const result = await client.query(`
      SELECT column_name, is_nullable, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'players' AND column_name = 'team_id'
    `);
    
    console.log('\n📊 Migration Verification:');
    console.log(result.rows[0]);
    
    if (result.rows[0].is_nullable === 'YES') {
      console.log('\n✅ Migration completed successfully!');
      console.log('   You can now create global players without a team.');
    } else {
      console.log('\n⚠️ Warning: team_id might still be NOT NULL');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

runMigration();

