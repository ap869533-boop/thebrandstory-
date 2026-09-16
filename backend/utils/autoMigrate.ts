import { getDbPool } from '../config/db';
import fs from 'fs';
import path from 'path';

export async function runAutoMigrations() {
  const pool = await getDbPool();
  if (!pool) return;

  try {
    console.log('🔄 Running database auto-migrations...');

    // 1. Run CREATE TABLE IF NOT EXISTS from schema.sql
    const schemaPath = path.resolve(__dirname, '../config/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      // Extract CREATE TABLE statements
      const createStatements = schemaSql.match(/CREATE TABLE IF NOT EXISTS [^;]+;/g);
      if (createStatements) {
        for (const stmt of createStatements) {
          await pool.query(stmt).catch(err => {
            if (err.code !== 'ER_TABLE_EXISTS_ERROR') {
              console.warn(`[AutoMigrate] Create Table Warning:`, err.message);
            }
          });
        }
      }
    }

    // 2. Add missing columns / remove deprecated columns safely
    const alterQueries = [
      `ALTER TABLE users ADD COLUMN gst_number VARCHAR(50) DEFAULT NULL`,
      `ALTER TABLE users ADD COLUMN approval_status VARCHAR(20) DEFAULT 'pending'`,
      `ALTER TABLE campaign_requirements ADD COLUMN approval_status VARCHAR(20) DEFAULT 'pending'`,
      `ALTER TABLE creator_profiles DROP COLUMN trust_score`,
      `ALTER TABLE creator_profiles DROP COLUMN trust_signals`
    ];

    for (const query of alterQueries) {
      try {
        await pool.query(query);
        console.log(`[AutoMigrate] Successfully executed: ${query}`);
      } catch (err: any) {
        // ER_DUP_FIELDNAME / ER_CANT_DROP_FIELD_OR_KEY are fine if column exists/already dropped
        if (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_CANT_DROP_FIELD_OR_KEY') {
          console.warn(`[AutoMigrate] Alter Table Notice:`, err.message);
        }
      }
    }

    console.log('✅ Database auto-migrations completed');
  } catch (error) {
    console.error('❌ Database auto-migration failed:', error);
  }
}
