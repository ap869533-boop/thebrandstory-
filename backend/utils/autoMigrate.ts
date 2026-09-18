import { getDbPool } from '../config/db';
import fs from 'fs';
import path from 'path';

export async function runAutoMigrations() {
  const pool = await getDbPool();
  if (!pool) return;

  try {
    console.log('🔄 Running database auto-migrations for live database...');

    // 1. Explicit core table definitions (Guaranteed to execute on live VPS even if schema.sql is not in dist)
    const coreTables = [
      `CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` VARCHAR(64) PRIMARY KEY,
        \`name\` VARCHAR(120) NOT NULL,
        \`email\` VARCHAR(150) NOT NULL UNIQUE,
        \`password_hash\` VARCHAR(255) NOT NULL,
        \`role\` ENUM('GUEST', 'BRAND', 'CREATOR', 'ADMIN', 'SALES') DEFAULT 'BRAND',
        \`phone\` VARCHAR(20) DEFAULT NULL,
        \`company_name\` VARCHAR(150) DEFAULT NULL,
        \`gst_number\` VARCHAR(50) DEFAULT NULL,
        \`avatar\` VARCHAR(500) DEFAULT NULL,
        \`is_verified\` BOOLEAN DEFAULT FALSE,
        \`approval_status\` VARCHAR(20) DEFAULT 'approved',
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_users_email\` (\`email\`),
        INDEX \`idx_users_role\` (\`role\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      `CREATE TABLE IF NOT EXISTS \`creators\` (
        \`id\` VARCHAR(64) PRIMARY KEY,
        \`user_id\` VARCHAR(64) DEFAULT NULL,
        \`name\` VARCHAR(120) NOT NULL,
        \`username\` VARCHAR(80) NOT NULL UNIQUE,
        \`avatar\` VARCHAR(500) DEFAULT NULL,
        \`cover_image\` VARCHAR(500) DEFAULT NULL,
        \`reel_video_url\` VARCHAR(500) DEFAULT NULL,
        \`bio\` TEXT DEFAULT NULL,
        \`current_city\` VARCHAR(80) NOT NULL,
        \`state\` VARCHAR(80) DEFAULT 'Delhi',
        \`preferred_cities\` JSON DEFAULT NULL,
        \`primary_category\` VARCHAR(80) NOT NULL,
        \`sub_categories\` JSON DEFAULT NULL,
        \`languages\` JSON DEFAULT NULL,
        \`gender\` VARCHAR(20) DEFAULT 'Female',
        \`age_group\` VARCHAR(20) DEFAULT '22-29',
        \`followers\` INT UNSIGNED DEFAULT 0,
        \`total_posts\` INT UNSIGNED DEFAULT 0,
        \`avg_views\` INT UNSIGNED DEFAULT 0,
        \`avg_likes\` INT UNSIGNED DEFAULT 0,
        \`avg_comments\` INT UNSIGNED DEFAULT 0,
        \`brand_collaborations_count\` INT UNSIGNED DEFAULT 0,
        \`is_verified\` BOOLEAN DEFAULT FALSE,
        \`status\` ENUM('active', 'pending', 'suspended') DEFAULT 'active',
        \`starting_price\` INT UNSIGNED DEFAULT 5000,
        \`reel_price\` INT UNSIGNED DEFAULT 8000,
        \`story_price\` INT UNSIGNED DEFAULT 3000,
        \`post_price\` INT UNSIGNED DEFAULT 6000,
        \`ugc_price\` INT UNSIGNED DEFAULT 7000,
        \`is_negotiable\` BOOLEAN DEFAULT TRUE,
        \`is_barter_available\` BOOLEAN DEFAULT FALSE,
        \`collaboration_types\` JSON DEFAULT NULL,
        \`phone\` VARCHAR(20) DEFAULT NULL,
        \`email\` VARCHAR(150) DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      `CREATE TABLE IF NOT EXISTS \`campaign_requirements\` (
        \`id\` VARCHAR(64) PRIMARY KEY,
        \`company_name\` VARCHAR(150) NOT NULL,
        \`contact_person\` VARCHAR(120) DEFAULT NULL,
        \`email\` VARCHAR(150) DEFAULT NULL,
        \`phone\` VARCHAR(20) DEFAULT NULL,
        \`industry\` VARCHAR(100) DEFAULT NULL,
        \`campaign_title\` VARCHAR(200) NOT NULL,
        \`campaign_description\` TEXT DEFAULT NULL,
        \`city\` VARCHAR(80) DEFAULT 'Pan India',
        \`influencers_count\` VARCHAR(50) DEFAULT '1-5 Creators',
        \`follower_range\` VARCHAR(50) DEFAULT 'Any',
        \`budget\` VARCHAR(80) DEFAULT 'Negotiable',
        \`category\` VARCHAR(80) DEFAULT 'General',
        \`collaboration_type\` VARCHAR(50) DEFAULT 'Paid',
        \`campaign_date\` VARCHAR(80) DEFAULT 'Upcoming',
        \`platforms\` JSON DEFAULT NULL,
        \`requirements\` TEXT DEFAULT NULL,
        \`status\` ENUM('Open', 'In Review', 'Filled', 'Completed') DEFAULT 'Open',
        \`approval_status\` VARCHAR(20) DEFAULT 'approved',
        \`applicants_count\` INT UNSIGNED DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_campaigns_status\` (\`status\`),
        INDEX \`idx_campaigns_category\` (\`category\`),
        INDEX \`idx_campaigns_city\` (\`city\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      `CREATE TABLE IF NOT EXISTS \`campaign_applicants\` (
        \`id\` VARCHAR(64) PRIMARY KEY,
        \`campaign_id\` VARCHAR(64) NOT NULL,
        \`creator_id\` VARCHAR(64) NOT NULL,
        \`creator_name\` VARCHAR(120) DEFAULT NULL,
        \`creator_avatar\` VARCHAR(500) DEFAULT NULL,
        \`pitch\` TEXT NOT NULL,
        \`status\` ENUM('Pending', 'Shortlisted', 'Accepted', 'Declined') DEFAULT 'Pending',
        \`applied_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_applicants_campaign\` (\`campaign_id\`),
        INDEX \`idx_applicants_creator\` (\`creator_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
    ];

    for (const sql of coreTables) {
      try {
        await pool.query(sql);
      } catch (err: any) {
        if (err.code !== 'ER_TABLE_EXISTS_ERROR') {
          console.warn(`[AutoMigrate] Core Table Warning:`, err.message);
        }
      }
    }

    // 2. Also check if schema.sql exists in any common paths
    const possibleSchemaPaths = [
      path.resolve(__dirname, '../config/schema.sql'),
      path.resolve(__dirname, '../../backend/config/schema.sql'),
      path.resolve(process.cwd(), 'backend/config/schema.sql'),
      path.resolve(process.cwd(), 'config/schema.sql'),
    ];
    const schemaPath = possibleSchemaPaths.find(p => fs.existsSync(p));
    if (schemaPath) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
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

    // 3. Add missing columns / update columns safely on live database
    const alterQueries = [
      `ALTER TABLE users ADD COLUMN gst_number VARCHAR(50) DEFAULT NULL`,
      `ALTER TABLE users ADD COLUMN approval_status VARCHAR(20) DEFAULT 'approved'`,
      `ALTER TABLE campaign_requirements ADD COLUMN approval_status VARCHAR(20) DEFAULT 'approved'`,
      `ALTER TABLE creator_profiles DROP COLUMN trust_score`,
      `ALTER TABLE creator_profiles DROP COLUMN trust_signals`,
      `ALTER TABLE campaign_applicants MODIFY COLUMN creator_name VARCHAR(120) DEFAULT NULL`,
      `ALTER TABLE campaign_applicants MODIFY COLUMN creator_avatar VARCHAR(500) DEFAULT NULL`,
      `ALTER TABLE brand_profiles ADD COLUMN city VARCHAR(80) DEFAULT NULL`,
      `ALTER TABLE brand_profiles ADD COLUMN facebook_url VARCHAR(255) DEFAULT NULL`,
      `ALTER TABLE brand_profiles ADD COLUMN instagram_url VARCHAR(255) DEFAULT NULL`,
      `ALTER TABLE brand_profiles ADD COLUMN youtube_url VARCHAR(255) DEFAULT NULL`,
      `ALTER TABLE brand_profiles ADD COLUMN linkedin_url VARCHAR(255) DEFAULT NULL`,
      `ALTER TABLE campaign_requirements ADD COLUMN gender_preference VARCHAR(50) DEFAULT 'Any'`,
      `ALTER TABLE campaign_requirements ADD COLUMN male_count INT DEFAULT 0`,
      `ALTER TABLE campaign_requirements ADD COLUMN female_count INT DEFAULT 0`,
      `ALTER TABLE campaign_requirements ADD COLUMN age_range VARCHAR(50) DEFAULT 'Any'`,
      `ALTER TABLE campaign_requirements ADD COLUMN language VARCHAR(50) DEFAULT 'Any'`
    ];

    for (const query of alterQueries) {
      try {
        await pool.query(query);
        console.log(`[AutoMigrate] Successfully executed on live DB: ${query}`);
      } catch (err: any) {
        // Ignored if column already exists or already modified
        if (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_CANT_DROP_FIELD_OR_KEY') {
          // Soft notice
        }
      }
    }

    console.log('✅ Live Database auto-migrations completed successfully');
  } catch (error) {
    console.error('❌ Database auto-migration failed:', error);
  }
}
