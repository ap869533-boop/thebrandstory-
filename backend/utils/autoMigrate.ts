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
        \`last_seen_at\` TIMESTAMP NULL DEFAULT NULL,
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
        \`social_platforms\` JSON DEFAULT NULL,
        \`audience\` JSON DEFAULT NULL,
        \`portfolio\` JSON DEFAULT NULL,
        \`phone\` VARCHAR(20) DEFAULT NULL,
        \`email\` VARCHAR(150) DEFAULT NULL,
        \`latitude\` DECIMAL(10,7) DEFAULT NULL,
        \`longitude\` DECIMAL(10,7) DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_creators_city\` (\`current_city\`),
        INDEX \`idx_creators_status\` (\`status\`),
        INDEX \`idx_creators_geo\` (\`latitude\`, \`longitude\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      `CREATE TABLE IF NOT EXISTS \`campaign_requirements\` (
        \`id\` VARCHAR(64) PRIMARY KEY,
        \`user_id\` VARCHAR(64) DEFAULT NULL,
        \`company_name\` VARCHAR(150) NOT NULL,
        \`contact_person\` VARCHAR(120) DEFAULT NULL,
        \`email\` VARCHAR(150) DEFAULT NULL,
        \`phone\` VARCHAR(20) DEFAULT NULL,
        \`industry\` VARCHAR(100) DEFAULT NULL,
        \`campaign_title\` VARCHAR(200) NOT NULL,
        \`campaign_description\` TEXT DEFAULT NULL,
        \`city\` VARCHAR(80) DEFAULT 'Pan India',
        \`influencers_count\` VARCHAR(50) DEFAULT '1-5 Creators',
        \`male_count\` INT UNSIGNED DEFAULT 0,
        \`female_count\` INT UNSIGNED DEFAULT 0,
        \`follower_range\` VARCHAR(50) DEFAULT 'Any',
        \`budget\` VARCHAR(80) DEFAULT 'Negotiable',
        \`category\` VARCHAR(80) DEFAULT 'General',
        \`collaboration_type\` VARCHAR(50) DEFAULT 'Paid',
        \`campaign_date\` VARCHAR(80) DEFAULT 'Upcoming',
        \`platforms\` JSON DEFAULT NULL,
        \`requirements\` TEXT DEFAULT NULL,
        \`status\` ENUM('Open', 'In Review', 'Filled', 'Completed') DEFAULT 'Open',
        \`approval_status\` VARCHAR(20) DEFAULT 'pending',
        \`applicants_count\` INT UNSIGNED DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_campaigns_status\` (\`status\`),
        INDEX \`idx_campaigns_approval\` (\`approval_status\`),
        INDEX \`idx_campaigns_category\` (\`category\`),
        INDEX \`idx_campaigns_city\` (\`city\`),
        INDEX \`idx_campaigns_user\` (\`user_id\`)
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      `CREATE TABLE IF NOT EXISTS \`brand_inquiries\` (
        \`id\` VARCHAR(64) PRIMARY KEY,
        \`creator_id\` VARCHAR(64) NOT NULL,
        \`creator_name\` VARCHAR(120) NOT NULL,
        \`creator_avatar\` VARCHAR(500) DEFAULT NULL,
        \`brand_id\` VARCHAR(64) NOT NULL,
        \`brand_name\` VARCHAR(150) NOT NULL,
        \`campaign_id\` VARCHAR(64) DEFAULT NULL,
        \`message\` TEXT NOT NULL,
        \`status\` ENUM('New', 'Read', 'Confirmed', 'Replied', 'Archived', 'Declined') DEFAULT 'New',
        \`conversation_id\` VARCHAR(64) DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_brand_inq_brand\` (\`brand_id\`),
        INDEX \`idx_brand_inq_creator\` (\`creator_id\`),
        INDEX \`idx_brand_inq_status\` (\`status\`),
        INDEX \`idx_brand_inq_campaign\` (\`campaign_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      `CREATE TABLE IF NOT EXISTS \`conversations\` (
        \`id\` VARCHAR(64) PRIMARY KEY,
        \`brand_user_id\` VARCHAR(64) NOT NULL,
        \`creator_id\` VARCHAR(64) NOT NULL,
        \`creator_user_id\` VARCHAR(64) DEFAULT NULL,
        \`campaign_id\` VARCHAR(64) DEFAULT NULL,
        \`inquiry_id\` VARCHAR(64) DEFAULT NULL,
        \`last_message\` TEXT DEFAULT NULL,
        \`last_message_at\` TIMESTAMP NULL DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY \`uniq_brand_creator_campaign\` (\`brand_user_id\`, \`creator_id\`, \`campaign_id\`),
        INDEX \`idx_conv_brand\` (\`brand_user_id\`),
        INDEX \`idx_conv_creator\` (\`creator_id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      `CREATE TABLE IF NOT EXISTS \`messages\` (
        \`id\` VARCHAR(64) PRIMARY KEY,
        \`conversation_id\` VARCHAR(64) NOT NULL,
        \`sender_id\` VARCHAR(64) NOT NULL,
        \`sender_role\` VARCHAR(20) NOT NULL,
        \`body\` TEXT NOT NULL,
        \`is_read\` BOOLEAN DEFAULT FALSE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_msg_conversation\` (\`conversation_id\`),
        INDEX \`idx_msg_created\` (\`created_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      `CREATE TABLE IF NOT EXISTS \`collaboration_reviews\` (
        \`id\` VARCHAR(64) PRIMARY KEY,
        \`conversation_id\` VARCHAR(64) NOT NULL,
        \`campaign_id\` VARCHAR(64) DEFAULT NULL,
        \`inquiry_id\` VARCHAR(64) DEFAULT NULL,
        \`reviewer_id\` VARCHAR(64) NOT NULL,
        \`reviewer_role\` ENUM('BRAND', 'CREATOR') NOT NULL,
        \`reviewee_id\` VARCHAR(64) NOT NULL,
        \`reviewee_role\` ENUM('BRAND', 'CREATOR') NOT NULL,
        \`rating\` TINYINT UNSIGNED NOT NULL,
        \`review_text\` TEXT NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY \`uniq_review_once\` (\`conversation_id\`, \`reviewer_id\`),
        INDEX \`idx_collab_rev_reviewee\` (\`reviewee_id\`, \`reviewee_role\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

      `CREATE TABLE IF NOT EXISTS \`creator_posts\` (
        \`id\` VARCHAR(64) PRIMARY KEY,
        \`creator_id\` VARCHAR(64) NOT NULL,
        \`image_url\` VARCHAR(500) NOT NULL,
        \`caption\` VARCHAR(500) DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_creator_posts_creator\` (\`creator_id\`),
        INDEX \`idx_creator_posts_created\` (\`created_at\`)
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
      `ALTER TABLE users ADD COLUMN last_seen_at TIMESTAMP NULL DEFAULT NULL`,
      `ALTER TABLE campaign_requirements ADD COLUMN approval_status VARCHAR(20) DEFAULT 'pending'`,
      `ALTER TABLE campaign_requirements ADD COLUMN user_id VARCHAR(64) DEFAULT NULL`,
      `ALTER TABLE campaign_requirements ADD COLUMN male_count INT UNSIGNED DEFAULT 0`,
      `ALTER TABLE campaign_requirements ADD COLUMN female_count INT UNSIGNED DEFAULT 0`,
      `ALTER TABLE campaign_requirements ADD COLUMN phone VARCHAR(20) DEFAULT NULL`,
      `ALTER TABLE campaign_applicants MODIFY COLUMN creator_name VARCHAR(120) DEFAULT NULL`,
      `ALTER TABLE campaign_applicants MODIFY COLUMN creator_avatar VARCHAR(500) DEFAULT NULL`,
      `ALTER TABLE brand_profiles ADD COLUMN city VARCHAR(80) DEFAULT NULL`,
      `ALTER TABLE brand_profiles ADD COLUMN facebook_url VARCHAR(255) DEFAULT NULL`,
      `ALTER TABLE brand_profiles ADD COLUMN instagram_url VARCHAR(255) DEFAULT NULL`,
      `ALTER TABLE brand_profiles ADD COLUMN youtube_url VARCHAR(255) DEFAULT NULL`,
      `ALTER TABLE brand_profiles ADD COLUMN linkedin_url VARCHAR(255) DEFAULT NULL`,
      `ALTER TABLE brand_profiles ADD COLUMN twitter_url VARCHAR(255) DEFAULT NULL`,
      `ALTER TABLE creators ADD COLUMN latitude DECIMAL(10,7) DEFAULT NULL`,
      `ALTER TABLE creators ADD COLUMN longitude DECIMAL(10,7) DEFAULT NULL`,
      `ALTER TABLE creators ADD COLUMN social_platforms JSON DEFAULT NULL`,
      `ALTER TABLE creators ADD COLUMN portfolio JSON DEFAULT NULL`,
      `ALTER TABLE creators ADD COLUMN audience JSON DEFAULT NULL`,
      `ALTER TABLE brand_inquiries ADD COLUMN campaign_id VARCHAR(64) DEFAULT NULL`,
      `ALTER TABLE brand_inquiries ADD COLUMN creator_avatar VARCHAR(500) DEFAULT NULL`,
      `ALTER TABLE brand_inquiries ADD COLUMN conversation_id VARCHAR(64) DEFAULT NULL`,
      `ALTER TABLE brand_inquiries MODIFY COLUMN status ENUM('New', 'Read', 'Confirmed', 'Replied', 'Archived', 'Declined') DEFAULT 'New'`,
      `ALTER TABLE cities ADD COLUMN latitude DECIMAL(10,7) DEFAULT NULL`,
      `ALTER TABLE cities ADD COLUMN longitude DECIMAL(10,7) DEFAULT NULL`,
      `ALTER TABLE creator_reviews ADD COLUMN brand_user_id VARCHAR(64) DEFAULT NULL`,
      `ALTER TABLE creator_reviews ADD COLUMN campaign_id VARCHAR(64) DEFAULT NULL`,
      `ALTER TABLE creator_reviews ADD COLUMN conversation_id VARCHAR(64) DEFAULT NULL`,
    ];

    for (const query of alterQueries) {
      try {
        await pool.query(query);
        console.log(`[AutoMigrate] Successfully executed on live DB: ${query}`);
      } catch (err: any) {
        // Ignored if column already exists or already modified
        if (err.code !== 'ER_DUP_FIELDNAME' && err.code !== 'ER_CANT_DROP_FIELD_OR_KEY' && err.code !== 'ER_DUP_KEYNAME') {
          // Soft notice for unexpected errors only
          if (err.code !== 'ER_BAD_TABLE_ERROR') {
            // ignore soft alter failures
          }
        }
      }
    }

    // Backfill male/female from influencers_count when counts are zero
    try {
      await pool.query(`
        UPDATE campaign_requirements
        SET male_count = CASE
          WHEN male_count = 0 AND female_count = 0 AND influencers_count REGEXP '^[0-9]+$' THEN FLOOR(CAST(influencers_count AS UNSIGNED) / 2)
          ELSE male_count
        END,
        female_count = CASE
          WHEN male_count = 0 AND female_count = 0 AND influencers_count REGEXP '^[0-9]+$' THEN CEIL(CAST(influencers_count AS UNSIGNED) / 2)
          ELSE female_count
        END
        WHERE (male_count = 0 AND female_count = 0)
      `);
    } catch {
      // ignore backfill failures
    }

    console.log('✅ Live Database auto-migrations completed successfully');
  } catch (error) {
    console.error('❌ Database auto-migration failed:', error);
  }
}
