-- =========================================================
-- Social Cults - India's Biggest Influencer Platform
-- MySQL Database Production Schema
-- =========================================================

CREATE DATABASE IF NOT EXISTS `social_cults_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `social_cults_db`;

-- 1. Users & Authentication Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('GUEST', 'BRAND', 'CREATOR', 'ADMIN', 'SALES') DEFAULT 'BRAND',
  `phone` VARCHAR(20) DEFAULT NULL,
  `company_name` VARCHAR(150) DEFAULT NULL,
  `gst_number` VARCHAR(20) DEFAULT NULL,
  `avatar` VARCHAR(500) DEFAULT NULL,
  `is_verified` BOOLEAN DEFAULT FALSE,
  `approval_status` ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_approval` (`approval_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1b. Brand Profiles Table (extended profile for BRAND users)
CREATE TABLE IF NOT EXISTS `brand_profiles` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL UNIQUE,
  `brand_name` VARCHAR(150) NOT NULL,
  `gst_number` VARCHAR(20) DEFAULT NULL,
  `logo_url` VARCHAR(500) DEFAULT NULL,
  `cover_url` VARCHAR(500) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `website` VARCHAR(255) DEFAULT NULL,
  `industry` VARCHAR(100) DEFAULT NULL,
  `city` VARCHAR(80) DEFAULT NULL,
  `contact_person` VARCHAR(120) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `approval_status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `rejection_reason` TEXT DEFAULT NULL,
  `is_featured` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_brand_profiles_user` (`user_id`),
  INDEX `idx_brand_profiles_status` (`approval_status`),
  INDEX `idx_brand_profiles_featured` (`is_featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Creators Profile Table
CREATE TABLE IF NOT EXISTS `creators` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` VARCHAR(64) DEFAULT NULL,
  `name` VARCHAR(120) NOT NULL,
  `username` VARCHAR(80) NOT NULL UNIQUE,
  `avatar` VARCHAR(500) DEFAULT NULL,
  `cover_image` VARCHAR(500) DEFAULT NULL,
  `reel_video_url` VARCHAR(500) DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  `current_city` VARCHAR(80) NOT NULL,
  `state` VARCHAR(80) DEFAULT 'Delhi',
  `preferred_cities` JSON DEFAULT NULL,
  `primary_category` VARCHAR(80) NOT NULL,
  `sub_categories` JSON DEFAULT NULL,
  `languages` JSON DEFAULT NULL,
  `gender` VARCHAR(20) DEFAULT 'Female',
  `age_group` VARCHAR(20) DEFAULT '22-29',
  
  -- Metrics
  `followers` INT UNSIGNED DEFAULT 0,
  `total_posts` INT UNSIGNED DEFAULT 0,
  `avg_views` INT UNSIGNED DEFAULT 0,
  `avg_likes` INT UNSIGNED DEFAULT 0,
  `avg_comments` INT UNSIGNED DEFAULT 0,
  `brand_collaborations_count` INT UNSIGNED DEFAULT 0,
  
  -- Badges & Status
  `is_verified` BOOLEAN DEFAULT FALSE,
  `verification_requested` BOOLEAN DEFAULT FALSE,
  `is_top20` BOOLEAN DEFAULT FALSE,
  `is_rising` BOOLEAN DEFAULT FALSE,
  `is_featured` BOOLEAN DEFAULT FALSE,
  `is_trending` BOOLEAN DEFAULT FALSE,
  `status` ENUM('active', 'pending', 'suspended') DEFAULT 'active',
  
  -- Commercial Pricing
  `starting_price` INT UNSIGNED DEFAULT 5000,
  `reel_price` INT UNSIGNED DEFAULT 8000,
  `story_price` INT UNSIGNED DEFAULT 3000,
  `post_price` INT UNSIGNED DEFAULT 6000,
  `ugc_price` INT UNSIGNED DEFAULT 7000,
  `event_price` INT UNSIGNED DEFAULT 10000,
  `is_negotiable` BOOLEAN DEFAULT TRUE,
  `is_barter_available` BOOLEAN DEFAULT FALSE,
  `collaboration_types` JSON DEFAULT NULL,
  
  -- Social Platforms, Portfolio & Audience
  `social_platforms` JSON DEFAULT NULL,
  `audience` JSON DEFAULT NULL,
  `portfolio` JSON DEFAULT NULL,
  
  -- Contact details (Private)
  `phone` VARCHAR(20) DEFAULT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `profile_views` INT UNSIGNED DEFAULT 0,
  `saved_count` INT UNSIGNED DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_creators_category` (`primary_category`),
  INDEX `idx_creators_city` (`current_city`),
  INDEX `idx_creators_followers` (`followers`),
  INDEX `idx_creators_price` (`starting_price`),
  INDEX `idx_creators_verified` (`is_verified`),
  INDEX `idx_creators_top20` (`is_top20`),
  INDEX `idx_creators_rising` (`is_rising`),
  INDEX `idx_creators_featured` (`is_featured`),
  INDEX `idx_creators_trending` (`is_trending`),
  INDEX `idx_creators_status` (`status`),
  INDEX `idx_creators_created` (`created_at`),
  INDEX `idx_creators_composite_cat_city` (`primary_category`, `current_city`, `status`),
  INDEX `idx_creators_composite_rank` (`followers`, `is_verified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Live Campaign Requirements / Briefs Table
CREATE TABLE IF NOT EXISTS `campaign_requirements` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` VARCHAR(64) DEFAULT NULL,
  `company_name` VARCHAR(150) NOT NULL,
  `contact_person` VARCHAR(120) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `industry` VARCHAR(80) DEFAULT 'General',
  `campaign_title` VARCHAR(200) NOT NULL,
  `campaign_description` TEXT NOT NULL,
  `city` VARCHAR(80) DEFAULT 'Pan India',
  `influencers_count` VARCHAR(50) DEFAULT '1-5 Creators',
  `follower_range` VARCHAR(50) DEFAULT 'Any',
  `budget` VARCHAR(80) DEFAULT 'Flexible',
  `category` VARCHAR(80) DEFAULT 'Lifestyle',
  `collaboration_type` VARCHAR(50) DEFAULT 'Paid',
  `campaign_date` VARCHAR(80) DEFAULT 'Upcoming',
  `platforms` JSON DEFAULT NULL,
  `requirements` TEXT DEFAULT NULL,
  `status` ENUM('Open', 'In Review', 'Filled', 'Completed') DEFAULT 'Open',
  `approval_status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `applicants_count` INT UNSIGNED DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_campaigns_status` (`status`),
  INDEX `idx_campaigns_category` (`category`),
  INDEX `idx_campaigns_city` (`city`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Campaign Applicants Table
CREATE TABLE IF NOT EXISTS `campaign_applicants` (
  `id` VARCHAR(64) PRIMARY KEY,
  `campaign_id` VARCHAR(64) NOT NULL,
  `creator_id` VARCHAR(64) NOT NULL,
  `creator_name` VARCHAR(120) NOT NULL,
  `creator_avatar` VARCHAR(500) DEFAULT NULL,
  `pitch` TEXT NOT NULL,
  `status` ENUM('Pending', 'Shortlisted', 'Accepted', 'Declined') DEFAULT 'Pending',
  `applied_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_applicants_campaign` (`campaign_id`),
  INDEX `idx_applicants_creator` (`creator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Direct Booking Enquiries & Leads Table
CREATE TABLE IF NOT EXISTS `enquiry_leads` (
  `id` VARCHAR(64) PRIMARY KEY,
  `creator_id` VARCHAR(64) NOT NULL,
  `creator_name` VARCHAR(120) NOT NULL,
  `creator_username` VARCHAR(80) NOT NULL,
  `creator_avatar` VARCHAR(500) DEFAULT NULL,
  `brand_name` VARCHAR(150) NOT NULL,
  `contact_person` VARCHAR(120) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `campaign_type` VARCHAR(80) NOT NULL,
  `campaign_description` TEXT DEFAULT NULL,
  `city` VARCHAR(80) DEFAULT 'Delhi NCR',
  `budget` VARCHAR(80) NOT NULL,
  `influencers_required` INT UNSIGNED DEFAULT 1,
  `preferred_date` VARCHAR(80) DEFAULT 'Upcoming',
  `message` TEXT DEFAULT NULL,
  `status` ENUM('New', 'Contacted', 'Qualified', 'Negotiation', 'Converted', 'Closed', 'Lost') DEFAULT 'New',
  `assigned_team_member` VARCHAR(100) DEFAULT NULL,
  `creator_reply` TEXT DEFAULT NULL,
  `is_read_by_creator` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_enquiries_creator` (`creator_id`),
  INDEX `idx_enquiries_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Creator Verified Reviews & Ratings Table
CREATE TABLE IF NOT EXISTS `creator_reviews` (
  `id` VARCHAR(64) PRIMARY KEY,
  `creator_id` VARCHAR(64) NOT NULL,
  `brand_name` VARCHAR(150) NOT NULL,
  `rating` TINYINT UNSIGNED NOT NULL DEFAULT 5,
  `review_text` TEXT NOT NULL,
  `campaign_type` VARCHAR(100) DEFAULT 'Instagram Reel Deliverable',
  `verified_collaboration` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_reviews_creator` (`creator_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Saved Shortlists / Folders Table
CREATE TABLE IF NOT EXISTS `saved_folders` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` VARCHAR(64) DEFAULT NULL,
  `name` VARCHAR(120) NOT NULL,
  `creator_ids` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_folders_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Blog & Industry Insights Table
CREATE TABLE IF NOT EXISTS `blog_posts` (
  `id` VARCHAR(64) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `excerpt` TEXT NOT NULL,
  `content` LONGTEXT NOT NULL,
  `cover_image` VARCHAR(500) DEFAULT NULL,
  `author_name` VARCHAR(120) DEFAULT 'Social Cults Editorial',
  `author_avatar` VARCHAR(500) DEFAULT NULL,
  `category` VARCHAR(80) DEFAULT 'Trends',
  `read_time` VARCHAR(30) DEFAULT '5 min read',
  `published_at` VARCHAR(50) DEFAULT 'Feb 2026',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Categories Table
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(80) NOT NULL,
  `slug` VARCHAR(80) NOT NULL UNIQUE,
  `icon_name` VARCHAR(50) DEFAULT 'Sparkles',
  `image` VARCHAR(500) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `count` INT UNSIGNED DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Cities Table
CREATE TABLE IF NOT EXISTS `cities` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(80) NOT NULL,
  `slug` VARCHAR(80) NOT NULL UNIQUE,
  `state` VARCHAR(80) NOT NULL,
  `tier` TINYINT UNSIGNED DEFAULT 1,
  `image` VARCHAR(500) DEFAULT NULL,
  `count` INT UNSIGNED DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Partner Brands Table
CREATE TABLE IF NOT EXISTS `partner_brands` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `category` VARCHAR(100) DEFAULT 'Brand Partner',
  `logo_url` VARCHAR(500) NOT NULL,
  `website` VARCHAR(255) DEFAULT NULL,
  `sort_order` INT DEFAULT 0,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Industries Table
CREATE TABLE IF NOT EXISTS `industries` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `slug` VARCHAR(120) NOT NULL UNIQUE,
  `icon_name` VARCHAR(50) DEFAULT 'Briefcase',
  `description` TEXT DEFAULT NULL,
  `recommended_categories` JSON DEFAULT NULL,
  `image` VARCHAR(500) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Platform Stats Table
CREATE TABLE IF NOT EXISTS `platform_stats` (
  `id` VARCHAR(64) PRIMARY KEY,
  `creators_display` VARCHAR(50) NOT NULL DEFAULT '50,000+',
  `cities_display` VARCHAR(50) NOT NULL DEFAULT '500+',
  `categories_display` VARCHAR(50) NOT NULL DEFAULT '100+',
  `brand_connections_display` VARCHAR(50) NOT NULL DEFAULT '10,000+',
  `custom_override` BOOLEAN DEFAULT FALSE,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
