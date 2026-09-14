import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbQuery } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { creatorsStore, mapDbRowToCreator } from './creatorController';
import { Creator } from '../types';
import { sendOtpEmail, sendWelcomeEmail } from '../utils/mailer';

const JWT_SECRET = process.env.JWT_SECRET || 'social_cults_super_secret_jwt_key_2026';

// OTP Cache
const otpCache = new Map<string, { otp: string; expires: number }>();

// In-Memory fallback store for users
interface UserRecord {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'GUEST' | 'BRAND' | 'CREATOR' | 'ADMIN' | 'SALES';
  phone?: string;
  company_name?: string;
  avatar?: string;
  created_at: string;
}

const memoryUsers: UserRecord[] = [
  {
    id: 'user_admin_1',
    name: 'thebrandsstory. Admin',
    email: 'admin@thebrandsstory.in',
    password_hash: bcrypt.hashSync('admin123', 10),
    role: 'ADMIN',
    created_at: new Date().toISOString(),
  },
  {
    id: 'user_admin_2',
    name: 'thebrandsstory. Admin',
    email: 'admin@thebrandsstory.com',
    password_hash: bcrypt.hashSync('admin123', 10),
    role: 'ADMIN',
    created_at: new Date().toISOString(),
  },
  {
    id: 'user_brand_1',
    name: 'Nykaa Marketing Team',
    email: 'brand@nykaa.com',
    password_hash: bcrypt.hashSync('brand123', 10),
    role: 'BRAND',
    company_name: 'Nykaa Beauty',
    created_at: new Date().toISOString(),
  },
  {
    id: 'user_creator_1',
    name: 'Priya Sharma',
    email: 'creator@thebrandsstory.in',
    password_hash: bcrypt.hashSync('creator123', 10),
    role: 'CREATOR',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
  }
];

export async function signup(req: Request, res: Response) {
  try {
    const {
      name,
      email,
      password,
      role = 'BRAND',
      phone,
      companyName,
      username,
      category = '',
      city = '',
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = (username || '').toLowerCase().replace(/^@/, '').trim();
    const instagramUrl = typeof (req.body as any).instagramUrl === 'string'
      ? (req.body as any).instagramUrl.trim()
      : (cleanUsername ? `https://instagram.com/${cleanUsername}` : '');

    // Check if user already exists (MySQL or Memory)
    const sqlCheck = 'SELECT id FROM users WHERE email = ? LIMIT 1';
    const existingDb = await dbQuery(sqlCheck, [cleanEmail]);

    if (existingDb && existingDb.length > 0) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists' });
    }

    if (!existingDb && memoryUsers.some((u) => u.email === cleanEmail)) {
      return res.status(409).json({ success: false, error: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `usr_${Date.now()}`;
    const userAvatar = '';

    // 1. Insert in MySQL users table
    await dbQuery(
      `INSERT INTO users (id, name, email, password_hash, role, phone, company_name, avatar, is_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name,
        cleanEmail,
        hashedPassword,
        role,
        phone || null,
        companyName || null,
        userAvatar,
        1
      ]
    ).catch(err => console.warn('MySQL insert notice:', err));

    // Save in memory store
    const newUser: UserRecord = {
      id: userId,
      name,
      email: cleanEmail,
      password_hash: hashedPassword,
      role: role as any,
      phone,
      company_name: companyName,
      avatar: userAvatar,
      created_at: new Date().toISOString(),
    };
    memoryUsers.push(newUser);

    // 2. If Creator, automatically insert full creator profile into MySQL `creators` table
    let createdCreatorProfile: Creator | null = null;
    if (role === 'CREATOR') {
      const creatorId = `c_${Date.now()}`;
      createdCreatorProfile = {
        id: creatorId,
        name,
        username: cleanUsername,
        avatar: userAvatar,
        coverImage: '',
        bio: '',
        currentCity: city,
        state: '',
        preferredCities: city ? [city] : [],
        primaryCategory: category,
        subCategories: [],
        languages: [],
        gender: undefined,
        ageGroup: '',
        followers: 0,
        engagementRate: 0,
        avgViews: 0,
        avgLikes: 0,
        avgComments: 0,
        brandCollaborationsCount: 0,
        trustScore: 0,
        trustSignals: {
          profileCompleteness: 0,
          phoneVerified: Boolean(phone),
          emailVerified: true,
          socialVerified: false,
          engagementQuality: 0,
          audienceQuality: 0,
          collaborationHistoryScore: 0,
          verifiedReviewsCount: 0,
          responseRate: 0,
          campaignReliability: 0,
          accountActivityScore: 0,
        },
        isVerified: false,
        verificationRequested: false,
        verificationStepsCompleted: [],
        isTop20: false,
        isRising: false,
        isFeatured: false,
        isTrending: false,
        status: 'pending',
        startingPrice: 0,
        pricing: {
          reelPrice: 0,
          storyPrice: 0,
          postPrice: 0,
          ugcPrice: 0,
          isNegotiable: false,
          isBarterAvailable: false,
          pricingDisplayType: 'starting',
        },
        collaborationTypes: [],
        socialPlatforms: [
          {
            platform: 'instagram',
            username: cleanUsername,
            url: instagramUrl,
            followers: 0,
            avgViews: 0,
            engagementRate: 0,
            verified: false,
          }
        ],
        audience: {
          topCities: [],
          topCountries: [],
          ageGroups: [],
          genderSplit: [],
          topInterests: [],
          avgReach: 0,
          avgImpressions: 0,
        },
        portfolio: [],
        previousCollaborations: [],
        reviews: [],
        phone: phone || '',
        email: cleanEmail,
        profileViews: 0,
        savedCount: 0,
        createdAt: new Date().toISOString(),
      };

      creatorsStore.unshift(createdCreatorProfile);

      // Insert into MySQL creators table
      await dbQuery(
        `INSERT INTO creators (
          id, user_id, name, username, avatar, cover_image, bio, current_city, primary_category,
          followers, engagement_rate, starting_price, reel_price, story_price, post_price,
          ugc_price, is_barter_available, collaboration_types, preferred_cities, sub_categories,
          languages, trust_score, phone, email
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          createdCreatorProfile.id,
          userId,
          createdCreatorProfile.name,
          createdCreatorProfile.username,
          createdCreatorProfile.avatar,
          createdCreatorProfile.coverImage,
          createdCreatorProfile.bio,
          createdCreatorProfile.currentCity,
          createdCreatorProfile.primaryCategory,
          createdCreatorProfile.followers,
          createdCreatorProfile.engagementRate,
          createdCreatorProfile.startingPrice,
          createdCreatorProfile.pricing.reelPrice,
          createdCreatorProfile.pricing.storyPrice,
          createdCreatorProfile.pricing.postPrice,
          createdCreatorProfile.pricing.ugcPrice,
          createdCreatorProfile.pricing.isBarterAvailable,
          JSON.stringify(createdCreatorProfile.collaborationTypes),
          JSON.stringify(createdCreatorProfile.preferredCities),
          JSON.stringify(createdCreatorProfile.subCategories),
          JSON.stringify(createdCreatorProfile.languages),
          createdCreatorProfile.trustScore,
          createdCreatorProfile.phone,
          createdCreatorProfile.email,
        ]
      );
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: userId, email: cleanEmail, name, role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: userId,
        name,
        email: cleanEmail,
        role,
        companyName,
        avatar: userAvatar,
        creatorProfile: createdCreatorProfile,
      },
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
}

export async function fetchOrCreateCreatorProfile(user: any): Promise<Creator | null> {
  if (!user || user.role !== 'CREATOR') return null;

  const cleanEmail = (user.email || '').toLowerCase().trim();

  // 1. Check in MySQL creators table
  try {
    const sqlCreator = 'SELECT * FROM creators WHERE user_id = ? OR LOWER(email) = ? LIMIT 1';
    const rows = await dbQuery(sqlCreator, [user.id, cleanEmail]);
    if (rows && rows.length > 0) {
      const creator = mapDbRowToCreator(rows[0]);
      // Sync into memory store
      const idx = creatorsStore.findIndex(c => c.id === creator.id || c.email?.toLowerCase() === cleanEmail);
      if (idx >= 0) {
        creatorsStore[idx] = creator;
      } else {
        creatorsStore.unshift(creator);
      }
      return creator;
    }
  } catch (err) {
    console.warn('Error querying creator by user_id/email:', err);
  }

  // 2. Check in memory creatorsStore
  const memCreator = creatorsStore.find(
    c => (c.email && c.email.toLowerCase() === cleanEmail) || c.id === user.id
  );
  if (memCreator) return memCreator;

  // 3. Not found anywhere — auto-create in MySQL & creatorsStore!
  const cleanUsername = '';
  const creatorId = `c_${Date.now()}`;
  const newCreator: Creator = {
    id: creatorId,
    name: user.name || '',
    username: cleanUsername,
    avatar: user.avatar || '',
    coverImage: '',
    reelVideoUrl: '',
    bio: '',
    currentCity: '',
    state: '',
    preferredCities: [],
    primaryCategory: '',
    subCategories: [],
    languages: [],
    gender: undefined,
    ageGroup: '',
    followers: 0,
    engagementRate: 0,
    avgViews: 0,
    avgLikes: 0,
    avgComments: 0,
    brandCollaborationsCount: 0,
    trustScore: 0,
    trustSignals: {
      profileCompleteness: 0,
      phoneVerified: Boolean(user.phone),
      emailVerified: true,
      socialVerified: false,
      engagementQuality: 0,
      audienceQuality: 0,
      collaborationHistoryScore: 0,
      verifiedReviewsCount: 0,
      responseRate: 0,
      campaignReliability: 0,
      accountActivityScore: 0,
    },
    isVerified: false,
    verificationRequested: false,
    verificationStepsCompleted: [],
    isTop20: false,
    isRising: false,
    isFeatured: false,
    isTrending: false,
    status: 'pending',
    startingPrice: 0,
    pricing: {
      reelPrice: 0,
      storyPrice: 0,
      postPrice: 0,
      ugcPrice: 0,
      isNegotiable: false,
      isBarterAvailable: false,
      pricingDisplayType: 'starting',
    },
    collaborationTypes: [],
    socialPlatforms: [
      {
        platform: 'instagram',
        username: cleanUsername,
        url: `https://instagram.com/${cleanUsername}`,
        followers: 0,
        avgViews: 0,
        engagementRate: 0,
        verified: false,
      }
    ],
    audience: {
      topCities: [],
      topCountries: [],
      ageGroups: [],
      genderSplit: [],
      topInterests: [],
      avgReach: 0,
      avgImpressions: 0,
    },
    portfolio: [],
    previousCollaborations: [],
    reviews: [],
    phone: user.phone || '',
    email: cleanEmail,
    profileViews: 0,
    savedCount: 0,
    createdAt: new Date().toISOString(),
  };

  creatorsStore.unshift(newCreator);

  try {
    await dbQuery(
      `INSERT INTO creators (
        id, user_id, name, username, avatar, cover_image, reel_video_url, bio, current_city, primary_category,
        followers, engagement_rate, starting_price, reel_price, story_price, post_price,
        ugc_price, is_barter_available, collaboration_types, preferred_cities, sub_categories,
        languages, trust_score, phone, email, is_verified, verification_requested, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [
        newCreator.id,
        user.id,
        newCreator.name,
        newCreator.username,
        newCreator.avatar,
        newCreator.coverImage,
        newCreator.reelVideoUrl || null,
        newCreator.bio,
        newCreator.currentCity,
        newCreator.primaryCategory,
        newCreator.followers,
        newCreator.engagementRate,
        newCreator.startingPrice,
        newCreator.pricing.reelPrice,
        newCreator.pricing.storyPrice,
        newCreator.pricing.postPrice,
        newCreator.pricing.ugcPrice,
        newCreator.pricing.isBarterAvailable ? 1 : 0,
        JSON.stringify(newCreator.collaborationTypes),
        JSON.stringify(newCreator.preferredCities),
        JSON.stringify(newCreator.subCategories),
        JSON.stringify(newCreator.languages),
        newCreator.trustScore,
        newCreator.phone || null,
        newCreator.email || null,
        0,
        0,
        'pending'
      ]
    );
  } catch (err) {
    console.warn('Auto insert creator error in fetchOrCreateCreatorProfile:', err);
  }

  return newCreator;
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check in MySQL first
    const sqlUser = 'SELECT * FROM users WHERE email = ? LIMIT 1';
    const dbUsers = await dbQuery(sqlUser, [cleanEmail]);

    let user: any = null;
    if (dbUsers && dbUsers.length > 0) {
      user = dbUsers[0];
    } else {
      user = memoryUsers.find((u) => u.email === cleanEmail);
    }

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // If role is CREATOR, fetch their genuine creator profile
    let creatorProfile: Creator | null = null;
    if (user.role === 'CREATOR') {
      creatorProfile = await fetchOrCreateCreatorProfile(user);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.company_name,
        avatar: user.avatar,
        creatorProfile: creatorProfile || undefined,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const sqlUser = 'SELECT id, name, email, role, phone, company_name, avatar, created_at FROM users WHERE id = ? LIMIT 1';
  const dbUsers = await dbQuery(sqlUser, [req.user.id]);

  let user = dbUsers?.[0];
  if (!user) {
    user = memoryUsers.find((u) => u.id === req.user?.id);
  }

  const effectiveUser = user || req.user;
  let creatorProfile: Creator | null = null;
  if (effectiveUser && effectiveUser.role === 'CREATOR') {
    creatorProfile = await fetchOrCreateCreatorProfile(effectiveUser);
  }

  res.json({
    success: true,
    user: {
      ...effectiveUser,
      creatorProfile: creatorProfile || undefined,
    },
  });
}

// --------------------------------------------------------------------------
// OTP Based Authentication Flow
// --------------------------------------------------------------------------

export async function requestOtp(req: Request, res: Response) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Valid for 5 minutes
    const expires = Date.now() + 5 * 60 * 1000;

    otpCache.set(cleanEmail, { otp, expires });

    // Send email
    await sendOtpEmail(cleanEmail, otp);

    res.json({ success: true, message: 'OTP sent successfully to your email.' });
  } catch (error: any) {
    console.error('Request OTP error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to send OTP' });
  }
}

export async function verifyOtp(req: Request, res: Response) {
  try {
    const { email, otp, name, role, phone, companyName, username, category, city, password } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, error: 'Email and OTP are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cachedData = otpCache.get(cleanEmail);

    if (!cachedData) {
      return res.status(400).json({ success: false, error: 'OTP expired or not requested' });
    }

    if (Date.now() > cachedData.expires) {
      otpCache.delete(cleanEmail);
      return res.status(400).json({ success: false, error: 'OTP has expired' });
    }

    if (cachedData.otp !== otp.toString()) {
      return res.status(400).json({ success: false, error: 'Invalid OTP' });
    }

    // OTP Verified. Clear it.
    otpCache.delete(cleanEmail);

    // Check if user exists
    const sqlUser = 'SELECT * FROM users WHERE email = ? LIMIT 1';
    const dbUsers = await dbQuery(sqlUser, [cleanEmail]);

    let user: any = null;
    let isNewUser = false;

    if (dbUsers && dbUsers.length > 0) {
      user = dbUsers[0];
    } else {
      user = memoryUsers.find((u) => u.email === cleanEmail);
    }

    // If user doesn't exist, we sign them up (auto-registration)
    if (!user) {
      if (!name || !role) {
        return res.status(400).json({ success: false, error: 'Name and role are required for new registration.' });
      }

      isNewUser = true;
      const instagramUrl = typeof req.body.instagramUrl === 'string'
        ? req.body.instagramUrl.trim()
        : '';
      const usernameFromUrl = instagramUrl
        ? instagramUrl.replace(/\/+$/, '').split('/').pop() || ''
        : '';
      const cleanUsername = (usernameFromUrl || username || '')
        .replace(/^@/, '')
        .toLowerCase()
        .trim();
      const userId = `usr_${Date.now()}`;
      const userAvatar = '';

      if (!password) {
        return res.status(400).json({ success: false, error: 'Password is required for registration' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      await dbQuery(
        `INSERT INTO users (id, name, email, password_hash, role, phone, company_name, avatar)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, name, cleanEmail, hashedPassword, role, phone || null, companyName || null, userAvatar || null]
      ).catch(err => console.warn('MySQL user insert notice:', err));

      const newUser: UserRecord = {
        id: userId,
        name,
        email: cleanEmail,
        password_hash: hashedPassword,
        role: role as any,
        phone,
        company_name: companyName,
        avatar: userAvatar,
        created_at: new Date().toISOString(),
      };
      memoryUsers.push(newUser);
      user = newUser;

      // Auto Creator Profile setup if CREATOR
      if (role === 'CREATOR') {
        const creatorId = `c_${Date.now()}`;
        const createdCreatorProfile: Creator = {
          id: creatorId,
          name,
          username: cleanUsername,
          avatar: userAvatar,
          coverImage: '',
          bio: '',
          currentCity: city || '',
          state: '',
          preferredCities: city ? [city] : [],
          primaryCategory: category || '',
          subCategories: [],
          languages: [],
          gender: undefined,
          ageGroup: '',
          followers: 0,
          engagementRate: 0,
          avgViews: 0,
          avgLikes: 0,
          avgComments: 0,
          brandCollaborationsCount: 0,
          trustScore: 0,
          trustSignals: {
            profileCompleteness: 0,
            phoneVerified: Boolean(phone),
            emailVerified: true,
            socialVerified: false,
            engagementQuality: 0,
            audienceQuality: 0,
            collaborationHistoryScore: 0,
            verifiedReviewsCount: 0,
            responseRate: 0,
            campaignReliability: 0,
            accountActivityScore: 0,
          },
          isVerified: false,
          verificationRequested: false,
          verificationStepsCompleted: [],
          isTop20: false,
          isRising: false,
          isFeatured: false,
          isTrending: false,
          status: 'pending',
          startingPrice: 0,
          pricing: {
            reelPrice: 0,
            storyPrice: 0,
            postPrice: 0,
            ugcPrice: 0,
            isNegotiable: false,
            isBarterAvailable: false,
            pricingDisplayType: 'starting',
          },
          collaborationTypes: [],
          socialPlatforms: [
            {
              platform: 'instagram',
              username: cleanUsername,
              url: instagramUrl,
              followers: 0,
              avgViews: 0,
              engagementRate: 0,
              verified: false,
            }
          ],
          audience: {
            topCities: [],
            topCountries: [],
            ageGroups: [],
            genderSplit: [],
            topInterests: [],
            avgReach: 0,
            avgImpressions: 0,
          },
          portfolio: [],
          previousCollaborations: [],
          reviews: [],
          phone: phone || '',
          email: cleanEmail,
          profileViews: 0,
          savedCount: 0,
          createdAt: new Date().toISOString(),
        };

        creatorsStore.unshift(createdCreatorProfile);
        user.creatorProfile = createdCreatorProfile;

        // DB Insert
        const creatorInsertResult = await dbQuery(
          `INSERT INTO creators (
            id, user_id, name, username, avatar, cover_image, reel_video_url, bio, current_city, primary_category,
            followers, engagement_rate, starting_price, reel_price, story_price, post_price,
            ugc_price, is_barter_available, collaboration_types, preferred_cities, sub_categories,
            languages, trust_score, phone, email, is_verified, verification_requested, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
          [
            createdCreatorProfile.id,
            userId,
            createdCreatorProfile.name,
            createdCreatorProfile.username,
            createdCreatorProfile.avatar,
            createdCreatorProfile.coverImage,
            createdCreatorProfile.reelVideoUrl || null,
            createdCreatorProfile.bio,
            createdCreatorProfile.currentCity,
            createdCreatorProfile.primaryCategory,
            createdCreatorProfile.followers,
            createdCreatorProfile.engagementRate,
            createdCreatorProfile.startingPrice,
            createdCreatorProfile.pricing.reelPrice,
            createdCreatorProfile.pricing.storyPrice,
            createdCreatorProfile.pricing.postPrice,
            createdCreatorProfile.pricing.ugcPrice,
            createdCreatorProfile.pricing.isBarterAvailable ? 1 : 0,
            JSON.stringify(createdCreatorProfile.collaborationTypes),
            JSON.stringify(createdCreatorProfile.preferredCities),
            JSON.stringify(createdCreatorProfile.subCategories),
            JSON.stringify(createdCreatorProfile.languages),
            createdCreatorProfile.trustScore,
            createdCreatorProfile.phone || null,
            createdCreatorProfile.email || null,
            0,
            1,
            'pending'
          ]
        );
        if (creatorInsertResult === null) {
          throw new Error('Creator profile could not be saved to the database');
        }
      }

      // Send Welcome Email
      // Note: We don't await this so it doesn't block the request
      sendWelcomeEmail(cleanEmail, role, name);
    }

    if (user.role === 'CREATOR' && !user.creatorProfile) {
      user.creatorProfile = await fetchOrCreateCreatorProfile(user);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: isNewUser ? 'Account created successfully' : 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.company_name,
        avatar: user.avatar,
        creatorProfile: user.creatorProfile || undefined,
      },
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ success: false, error: 'OTP verification failed' });
  }
}

export async function changePassword(req: AuthenticatedRequest, res: Response) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Current password and new password are required' });
    }

    // Get user from DB
    const sqlUser = 'SELECT * FROM users WHERE id = ? LIMIT 1';
    const dbUsers = await dbQuery(sqlUser, [req.user.id]);

    let user = dbUsers?.[0];
    if (!user) {
      user = memoryUsers.find((u) => u.id === req.user?.id);
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Check old password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Incorrect current password' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update in MySQL
    await dbQuery('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, req.user.id])
      .catch(err => console.warn('MySQL password update notice:', err));

    // Update in memory if fallback is used
    if (user) {
      user.password_hash = hashedPassword;
      const memUser = memoryUsers.find(u => u.id === req.user?.id);
      if (memUser) memUser.password_hash = hashedPassword;
    }

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, error: 'Failed to change password' });
  }
}
