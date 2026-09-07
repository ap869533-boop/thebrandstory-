import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import {
  INITIAL_CREATORS,
  CATEGORIES_LIST,
  CITIES_LIST,
  INITIAL_CAMPAIGNS,
  BLOG_POSTS,
} from '../../src/data/initialData';

dotenv.config();

async function runSeed() {
  console.log('🌱 Starting Database Seeding for thebrandsstory....');

  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'social_cults_db';
  const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

  let connection;

  try {
    // 1. Connect to MySQL Server (Without DB first to ensure DB exists)
    connection = await mysql.createConnection({
      host,
      user,
      password,
      port,
    });

    console.log(`📡 Connected to MySQL Server at ${host}:${port}`);

    // 2. Create Database
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${database}\`;`);
    console.log(`📁 Database \`${database}\` verified and selected.`);

    // 3. Create Tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('GUEST', 'BRAND', 'CREATOR', 'ADMIN', 'SALES') DEFAULT 'BRAND',
        phone VARCHAR(20) DEFAULT NULL,
        company_name VARCHAR(150) DEFAULT NULL,
        avatar VARCHAR(500) DEFAULT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS creators (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) DEFAULT NULL,
        name VARCHAR(120) NOT NULL,
        username VARCHAR(80) NOT NULL UNIQUE,
        avatar VARCHAR(500) DEFAULT NULL,
        cover_image VARCHAR(500) DEFAULT NULL,
        bio TEXT DEFAULT NULL,
        current_city VARCHAR(80) NOT NULL,
        state VARCHAR(80) DEFAULT 'Delhi',
        preferred_cities JSON DEFAULT NULL,
        primary_category VARCHAR(80) NOT NULL,
        sub_categories JSON DEFAULT NULL,
        languages JSON DEFAULT NULL,
        gender VARCHAR(20) DEFAULT 'Female',
        age_group VARCHAR(20) DEFAULT '22-29',
        followers INT UNSIGNED DEFAULT 0,
        engagement_rate DECIMAL(4, 2) DEFAULT 0.00,
        avg_views INT UNSIGNED DEFAULT 0,
        avg_likes INT UNSIGNED DEFAULT 0,
        avg_comments INT UNSIGNED DEFAULT 0,
        brand_collaborations_count INT UNSIGNED DEFAULT 0,
        trust_score TINYINT UNSIGNED DEFAULT 85,
        trust_signals JSON DEFAULT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        verification_requested BOOLEAN DEFAULT FALSE,
        is_top20 BOOLEAN DEFAULT FALSE,
        is_rising BOOLEAN DEFAULT FALSE,
        is_featured BOOLEAN DEFAULT FALSE,
        is_trending BOOLEAN DEFAULT FALSE,
        status ENUM('active', 'pending', 'suspended') DEFAULT 'active',
        starting_price INT UNSIGNED DEFAULT 5000,
        reel_price INT UNSIGNED DEFAULT 8000,
        story_price INT UNSIGNED DEFAULT 3000,
        post_price INT UNSIGNED DEFAULT 6000,
        ugc_price INT UNSIGNED DEFAULT 7000,
        is_negotiable BOOLEAN DEFAULT TRUE,
        is_barter_available BOOLEAN DEFAULT FALSE,
        collaboration_types JSON DEFAULT NULL,
        social_platforms JSON DEFAULT NULL,
        audience JSON DEFAULT NULL,
        portfolio JSON DEFAULT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        email VARCHAR(150) DEFAULT NULL,
        profile_views INT UNSIGNED DEFAULT 0,
        saved_count INT UNSIGNED DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_creators_category (primary_category),
        INDEX idx_creators_city (current_city),
        INDEX idx_creators_followers (followers),
        INDEX idx_creators_trust (trust_score),
        INDEX idx_creators_price (starting_price),
        INDEX idx_creators_engagement (engagement_rate),
        INDEX idx_creators_verified (is_verified),
        INDEX idx_creators_top20 (is_top20),
        INDEX idx_creators_rising (is_rising),
        INDEX idx_creators_featured (is_featured),
        INDEX idx_creators_trending (is_trending),
        INDEX idx_creators_status (status),
        INDEX idx_creators_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(80) NOT NULL,
        slug VARCHAR(80) NOT NULL UNIQUE,
        icon_name VARCHAR(50) DEFAULT 'Sparkles',
        image VARCHAR(500) DEFAULT NULL,
        description TEXT DEFAULT NULL,
        count INT UNSIGNED DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS cities (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(80) NOT NULL,
        slug VARCHAR(80) NOT NULL UNIQUE,
        state VARCHAR(80) NOT NULL,
        tier TINYINT UNSIGNED DEFAULT 1,
        image VARCHAR(500) DEFAULT NULL,
        count INT UNSIGNED DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS campaign_requirements (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) DEFAULT NULL,
        company_name VARCHAR(150) NOT NULL,
        contact_person VARCHAR(120) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        industry VARCHAR(80) DEFAULT 'General',
        campaign_title VARCHAR(200) NOT NULL,
        campaign_description TEXT NOT NULL,
        city VARCHAR(80) DEFAULT 'Pan India',
        influencers_count VARCHAR(50) DEFAULT '1-5 Creators',
        follower_range VARCHAR(50) DEFAULT 'Any',
        budget VARCHAR(80) DEFAULT 'Flexible',
        category VARCHAR(80) DEFAULT 'Lifestyle',
        collaboration_type VARCHAR(50) DEFAULT 'Paid',
        campaign_date VARCHAR(80) DEFAULT 'Upcoming',
        platforms JSON DEFAULT NULL,
        requirements TEXT DEFAULT NULL,
        status ENUM('Open', 'In Review', 'Filled', 'Completed') DEFAULT 'Open',
        applicants_count INT UNSIGNED DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS enquiry_leads (
        id VARCHAR(64) PRIMARY KEY,
        creator_id VARCHAR(64) NOT NULL,
        creator_name VARCHAR(120) NOT NULL,
        creator_username VARCHAR(80) NOT NULL,
        creator_avatar VARCHAR(500) DEFAULT NULL,
        brand_name VARCHAR(150) NOT NULL,
        contact_person VARCHAR(120) NOT NULL,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        campaign_type VARCHAR(80) NOT NULL,
        campaign_description TEXT DEFAULT NULL,
        city VARCHAR(80) DEFAULT 'Delhi NCR',
        budget VARCHAR(80) NOT NULL,
        influencers_required INT UNSIGNED DEFAULT 1,
        preferred_date VARCHAR(80) DEFAULT 'Upcoming',
        message TEXT DEFAULT NULL,
        status ENUM('New', 'Contacted', 'Qualified', 'Negotiation', 'Converted', 'Closed', 'Lost') DEFAULT 'New',
        assigned_team_member VARCHAR(100) DEFAULT NULL,
        creator_reply TEXT DEFAULT NULL,
        is_read_by_creator BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS creator_reviews (
        id VARCHAR(64) PRIMARY KEY,
        creator_id VARCHAR(64) NOT NULL,
        brand_name VARCHAR(150) NOT NULL,
        rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
        review_text TEXT NOT NULL,
        campaign_type VARCHAR(100) DEFAULT 'Instagram Reel Campaign',
        verified_collaboration BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS saved_folders (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) DEFAULT NULL,
        name VARCHAR(120) NOT NULL,
        creator_ids JSON DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        excerpt TEXT NOT NULL,
        content LONGTEXT NOT NULL,
        cover_image VARCHAR(500) DEFAULT NULL,
        author_name VARCHAR(120) DEFAULT 'thebrandsstory. Editorial',
        author_avatar VARCHAR(500) DEFAULT NULL,
        category VARCHAR(80) DEFAULT 'Trends',
        read_time VARCHAR(30) DEFAULT '5 min read',
        published_at VARCHAR(50) DEFAULT 'Feb 2026',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    console.log('✅ Database tables created successfully.');

    // 4. Seed Users
    const adminPass = await bcrypt.hash('admin123', 10);
    const brandPass = await bcrypt.hash('brand123', 10);
    const creatorPass = await bcrypt.hash('creator123', 10);

    const usersData = [
      ['user_admin_1', 'thebrandsstory. Admin', 'admin@thebrandsstory..in', adminPass, 'ADMIN', '+91 99999 88888', 'thebrandsstory. HQ', true],
      ['user_brand_1', 'Nykaa Marketing Team', 'brand@nykaa.com', brandPass, 'BRAND', '+91 98111 22334', 'Nykaa Beauty', true],
      ['user_creator_1', 'Priya Sharma', 'creator@thebrandsstory..in', creatorPass, 'CREATOR', '+91 98765 43210', 'Priya Sharma Studio', true],
    ];

    for (const u of usersData) {
      await connection.query(
        `INSERT INTO users (id, name, email, password_hash, role, phone, company_name, is_verified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), password_hash=VALUES(password_hash), role=VALUES(role);`,
        u
      );
    }
    console.log(`👤 Seeded ${usersData.length} initial user accounts (Admin, Brand, Creator).`);

    // 5. Seed Categories
    for (const cat of CATEGORIES_LIST) {
      await connection.query(
        `INSERT INTO categories (id, name, slug, icon_name, image, description, count)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), count=VALUES(count), image=VALUES(image);`,
        [cat.id, cat.name, cat.slug, cat.iconName || 'Sparkles', cat.image, cat.description, cat.count]
      );
    }
    console.log(`🏷️ Seeded ${CATEGORIES_LIST.length} categories.`);

    // 6. Seed Cities
    for (const city of CITIES_LIST) {
      await connection.query(
        `INSERT INTO cities (id, name, slug, state, tier, image, count)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), count=VALUES(count), image=VALUES(image);`,
        [city.id, city.name, city.slug, city.state, city.tier, city.image, city.count]
      );
    }
    console.log(`🏙️ Seeded ${CITIES_LIST.length} Indian cities.`);

    // 7. Seed Creators (Deep Profile Data)
    for (const c of INITIAL_CREATORS) {
      await connection.query(
        `INSERT INTO creators (
          id, name, username, avatar, cover_image, bio, current_city, state, preferred_cities,
          primary_category, sub_categories, languages, gender, age_group, followers, engagement_rate,
          avg_views, avg_likes, avg_comments, brand_collaborations_count, trust_score, trust_signals,
          is_verified, is_top20, is_rising, is_featured, is_trending, status, starting_price,
          reel_price, story_price, post_price, ugc_price, is_negotiable, is_barter_available,
          collaboration_types, social_platforms, audience, portfolio, phone, email, profile_views, saved_count
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?
        ) ON DUPLICATE KEY UPDATE
          name=VALUES(name), followers=VALUES(followers), engagement_rate=VALUES(engagement_rate),
          trust_score=VALUES(trust_score), starting_price=VALUES(starting_price), reel_price=VALUES(reel_price);`,
        [
          c.id,
          c.name,
          c.username,
          c.avatar,
          c.coverImage,
          c.bio,
          c.currentCity,
          c.state || 'Delhi',
          JSON.stringify(c.preferredCities || [c.currentCity]),
          c.primaryCategory,
          JSON.stringify(c.subCategories || []),
          JSON.stringify(c.languages || ['Hindi', 'English']),
          c.gender || 'Female',
          c.ageGroup || '22-29',
          c.followers,
          c.engagementRate,
          c.avgViews || 15000,
          c.avgLikes || 1500,
          c.avgComments || 90,
          c.brandCollaborationsCount || 5,
          c.trustScore || 88,
          JSON.stringify(c.trustSignals || {}),
          c.isVerified || false,
          c.isTop20 || false,
          c.isRising || false,
          c.isFeatured || false,
          c.isTrending || false,
          c.status || 'active',
          c.startingPrice || 5000,
          c.pricing?.reelPrice || (c.startingPrice || 5000) * 1.5,
          c.pricing?.storyPrice || (c.startingPrice || 5000) * 0.5,
          c.pricing?.postPrice || c.startingPrice || 5000,
          c.pricing?.ugcPrice || (c.startingPrice || 5000) * 1.2,
          c.pricing?.isNegotiable !== false,
          c.pricing?.isBarterAvailable || false,
          JSON.stringify(c.collaborationTypes || ['Paid', 'UGC']),
          JSON.stringify(c.socialPlatforms || []),
          JSON.stringify(c.audience || {}),
          JSON.stringify(c.portfolio || []),
          c.phone || '+91 98765 43210',
          c.email || `${c.username}@thebrandsstory..in`,
          c.profileViews || 150,
          c.savedCount || 5,
        ]
      );
    }
    console.log(`✨ Seeded ${INITIAL_CREATORS.length} Influencer Profiles with full metrics & rate cards.`);

    // 8. Seed Campaigns
    for (const camp of INITIAL_CAMPAIGNS) {
      await connection.query(
        `INSERT INTO campaign_requirements (
          id, company_name, contact_person, email, phone, industry, campaign_title,
          campaign_description, city, influencers_count, follower_range, budget, category,
          collaboration_type, campaign_date, platforms, requirements, status, applicants_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE company_name=VALUES(company_name), campaign_title=VALUES(campaign_title);`,
        [
          camp.id,
          camp.companyName,
          camp.contactPerson,
          camp.email,
          camp.phone,
          camp.industry,
          camp.campaignTitle,
          camp.campaignDescription,
          camp.city,
          camp.influencersCount,
          camp.followerRange,
          camp.budget,
          camp.category,
          camp.collaborationType,
          camp.campaignDate,
          JSON.stringify(camp.platforms || ['instagram']),
          camp.requirements,
          camp.status,
          camp.applicantsCount || 0,
        ]
      );
    }
    console.log(`📢 Seeded ${INITIAL_CAMPAIGNS.length} Live Campaign Briefs.`);

    // 9. Seed Direct Enquiries
    const sampleEnquiries = [
      [
        'SC-ENQ-849201',
        'c1',
        'Priya Sharma',
        'priyasharma',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        'Nykaa Beauty',
        'Meera Kapur',
        'meera.k@nykaa.com',
        '+91 98111 22334',
        'Instagram Reel + 2 Stories',
        'Promote our upcoming Monsoon Skincare serum line with a 45-second aesthetic reel.',
        'Delhi NCR',
        '₹15,000',
        1,
        'Next Week',
        'We love your authentic skin tone styling and would like to send our PR kit.',
        'New',
        false
      ]
    ];

    for (const enq of sampleEnquiries) {
      await connection.query(
        `INSERT INTO enquiry_leads (
          id, creator_id, creator_name, creator_username, creator_avatar, brand_name,
          contact_person, email, phone, campaign_type, campaign_description, city,
          budget, influencers_required, preferred_date, message, status, is_read_by_creator
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE brand_name=VALUES(brand_name);`,
        enq
      );
    }
    console.log(`📩 Seeded initial Direct Booking Enquiry Leads.`);

    // 10. Seed Blog Posts
    for (const blog of BLOG_POSTS) {
      await connection.query(
        `INSERT INTO blog_posts (
          id, title, slug, excerpt, content, cover_image, author_name, category, read_time, published_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE title=VALUES(title);`,
        [
          blog.id,
          blog.title,
          blog.slug,
          blog.excerpt,
          blog.content,
          blog.coverImage,
          blog.author,
          blog.category,
          blog.readTime,
          blog.date,
        ]
      );
    }
    console.log(`📰 Seeded ${BLOG_POSTS.length} Industry Insights Articles.`);

    console.log('🎉 Database seeding finished successfully! All data is populated in MySQL.');
  } catch (error: any) {
    console.error('❌ Database Seeding Error:', error.message || error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runSeed();
