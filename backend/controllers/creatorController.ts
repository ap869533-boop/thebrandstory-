import { Request, Response } from 'express';
import { dbQuery } from '../config/db';
import { INITIAL_CREATORS } from '../data/initialData';
import { Creator } from '../types';
import { sendApprovalEmail } from '../utils/mailer';
import { cleanInstagramHandle } from '../utils/sanitize';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { validateOptionalUrl } from '../utils/validation';

// In-Memory store initialized with seed data as resilient fallback
export let creatorsStore: Creator[] = [...INITIAL_CREATORS];

function normalizeMediaUrl(value?: string) {
  if (!value) return '';
  try {
    const parsed = new URL(value, 'https://thebrandsstory.com');
    if (parsed.pathname.startsWith('/api/uploads/')) return parsed.pathname;
    if (parsed.pathname.startsWith('/uploads/')) return `/api${parsed.pathname}`;
  } catch {
    // Keep non-URL media values unchanged.
  }
  return value;
}

export function mapDbRowToCreator(row: any): Creator {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    avatar: normalizeMediaUrl(row.avatar),
    coverImage: normalizeMediaUrl(row.cover_image),
    reelVideoUrl: normalizeMediaUrl(row.reel_video_url),
    bio: row.bio || '',
    currentCity: row.current_city,
    state: row.state || '',
    preferredCities: typeof row.preferred_cities === 'string' ? JSON.parse(row.preferred_cities) : (row.preferred_cities || []),
    primaryCategory: row.primary_category,
    subCategories: typeof row.sub_categories === 'string' ? JSON.parse(row.sub_categories) : (row.sub_categories || []),
    languages: typeof row.languages === 'string' ? JSON.parse(row.languages) : (row.languages || []),
    gender: row.gender || undefined,
    ageGroup: row.age_group || '',
    followers: Number(row.followers) || 0,
    totalPosts: Number(row.total_posts) || 0,
    avgViews: Number(row.avg_views) || 0,
    avgLikes: Number(row.avg_likes) || 0,
    avgComments: Number(row.avg_comments) || 0,
    brandCollaborationsCount: Number(row.brand_collaborations_count) || 0,
    isVerified: Boolean(row.is_verified),
    verificationRequested: Boolean(row.verification_requested),
    isTop20: Boolean(row.is_top20),
    isRising: Boolean(row.is_rising),
    isFeatured: Boolean(row.is_featured),
    isTrending: Boolean(row.is_trending),
    status: row.status || 'active',
    startingPrice: Number(row.starting_price) || 0,
    pricing: {
      startingPrice: Number(row.starting_price) || 0,
      reelPrice: Number(row.reel_price) || 0,
      storyPrice: Number(row.story_price) || 0,
      postPrice: Number(row.post_price) || 0,
      ugcPrice: Number(row.ugc_price) || 0,
      eventPrice: Number(row.event_price) || 0,
      isNegotiable: Boolean(row.is_negotiable),
      isBarterAvailable: Boolean(row.is_barter_available),
      pricingDisplayType: 'starting',
    },
    collaborationTypes: typeof row.collaboration_types === 'string' ? JSON.parse(row.collaboration_types) : (row.collaboration_types || []),
    socialPlatforms: typeof row.social_platforms === 'string'
      ? JSON.parse(row.social_platforms)
      : (row.social_platforms || (row.username ? [{
        platform: 'instagram',
        username: row.username,
        url: `https://instagram.com/${row.username}`,
        followers: Number(row.followers) || 0,
        avgViews: Number(row.avg_views) || 0,
        verified: false,
      }] : [])),
    audience: typeof row.audience === 'string' ? JSON.parse(row.audience) : (row.audience || {}),
    portfolio: typeof row.portfolio === 'string' ? JSON.parse(row.portfolio) : (row.portfolio || []),
    phone: row.phone,
    email: row.email,
    verificationStepsCompleted: [],
    previousCollaborations: [],
    reviews: [],
    profileViews: Number(row.profile_views) || 0,
    savedCount: Number(row.saved_count) || 0,
    createdAt: row.created_at,
  };
}

export async function getCreators(req: Request, res: Response) {
  try {
    const {
      category,
      city,
      searchQuery,
      minFollowers,
      maxFollowers,
      maxPrice,
      minEngagement,
      collaborationType,
      isVerified,
      isTop20,
      isRising,
      sortBy,
      limit,
      offset,
    } = req.query;

    // 1. Build Optimized Indexed SQL Query for MySQL
    const sqlConditions: string[] = [req.query.includePending === 'true' ? "status != 'suspended'" : "status = 'active'"];
    const sqlParams: any[] = [];

    if (category && category !== 'all') {
      sqlConditions.push('(LOWER(primary_category) = ? OR LOWER(sub_categories) LIKE ?)');
      const catLower = (category as string).toLowerCase();
      sqlParams.push(catLower, `%"${catLower}"%`);
    }

    if (city && city !== 'all') {
      sqlConditions.push('LOWER(current_city) LIKE ?');
      const cityLower = (city as string).toLowerCase().trim();
      sqlParams.push(`%${cityLower}%`);
    }

    if (searchQuery && typeof searchQuery === 'string' && searchQuery.trim()) {
      const q = `%${searchQuery.toLowerCase().trim()}%`;
      sqlConditions.push('(LOWER(name) LIKE ? OR LOWER(username) LIKE ? OR LOWER(primary_category) LIKE ? OR LOWER(current_city) LIKE ?)');
      sqlParams.push(q, q, q, q);
    }

    if (minFollowers) {
      sqlConditions.push('followers >= ?');
      sqlParams.push(parseInt(minFollowers as string, 10));
    }

    if (maxFollowers) {
      sqlConditions.push('followers <= ?');
      sqlParams.push(parseInt(maxFollowers as string, 10));
    }

    if (maxPrice) {
      sqlConditions.push('(starting_price <= ? OR is_barter_available = 1)');
      sqlParams.push(parseInt(maxPrice as string, 10));
    }



    if (collaborationType && collaborationType !== 'all') {
      sqlConditions.push('LOWER(collaboration_types) LIKE ?');
      sqlParams.push(`%"${(collaborationType as string).toLowerCase()}"%`);
    }

    if (isVerified === 'true') {
      sqlConditions.push('is_verified = 1');
    }

    if (isTop20 === 'true') {
      sqlConditions.push('is_top20 = 1');
    }

    if (isRising === 'true') {
      sqlConditions.push('is_rising = 1');
    }

    // SQL Index-backed Sorting
    let orderByClause = 'ORDER BY followers DESC, is_verified DESC';
    if (sortBy === 'followers') {
      orderByClause = 'ORDER BY followers DESC';
    } else if (sortBy === 'engagement') {
      orderByClause = 'ORDER BY followers DESC';
    } else if (sortBy === 'lowest_price') {
      orderByClause = 'ORDER BY starting_price ASC';
    } else if (sortBy === 'collaborations') {
      orderByClause = 'ORDER BY brand_collaborations_count DESC';
    } else if (sortBy === 'recently_joined') {
      orderByClause = 'ORDER BY created_at DESC';
    }

    const whereClause = sqlConditions.length > 0 ? `WHERE ${sqlConditions.join(' AND ')}` : '';
    const fullSql = `SELECT * FROM creators ${whereClause} ${orderByClause}`;

    const dbRows = await dbQuery(fullSql, sqlParams);

    if (dbRows) {
      const creators = dbRows.map(mapDbRowToCreator);
      return res.json({
        success: true,
        source: 'mysql_indexed',
        total: creators.length,
        creators,
      });
    }

    // 2. Resilient In-Memory Fallback if MySQL is offline
    let result: Creator[] = [...creatorsStore];

    if (category && category !== 'all') {
      const catLower = (category as string).toLowerCase();
      result = result.filter(
        (c) =>
          c.primaryCategory.toLowerCase() === catLower ||
          c.subCategories?.some((sc) => sc.toLowerCase() === catLower)
      );
    }

    if (city && city !== 'all') {
      const cityLower = (city as string).toLowerCase();
      result = result.filter(
        (c) =>
          c.currentCity.toLowerCase().includes(cityLower) ||
          c.preferredCities?.some((pc) => pc.toLowerCase().includes(cityLower))
      );
    }

    if (searchQuery && typeof searchQuery === 'string') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.username.toLowerCase().includes(q) ||
          c.primaryCategory.toLowerCase().includes(q) ||
          c.currentCity.toLowerCase().includes(q)
      );
    }

    if (minFollowers) {
      const minF = parseInt(minFollowers as string, 10);
      result = result.filter((c) => c.followers >= minF);
    }

    if (maxFollowers) {
      const maxF = parseInt(maxFollowers as string, 10);
      result = result.filter((c) => c.followers <= maxF);
    }

    if (maxPrice) {
      const maxP = parseInt(maxPrice as string, 10);
      result = result.filter((c) => (c.startingPrice || 0) <= maxP || c.pricing?.isBarterAvailable);
    }



    if (isVerified === 'true') {
      result = result.filter((c) => c.isVerified);
    }

    if (isTop20 === 'true') {
      result = result.filter((c) => c.isTop20);
    }

    if (isRising === 'true') {
      result = result.filter((c) => c.isRising);
    }

    if (sortBy === 'followers') {
      result.sort((a, b) => b.followers - a.followers);
    } else if (sortBy === 'engagement') {
      result.sort((a, b) => b.followers - a.followers);
    } else if (sortBy === 'lowest_price') {
      result.sort((a, b) => (a.startingPrice || 0) - (b.startingPrice || 0));
    } else {
      result.sort((a, b) => b.trustScore - a.trustScore);
    }

    res.json({
      success: true,
      source: 'memory_fallback',
      total: result.length,
      creators: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch creators' });
  }
}

export async function getCreatorByIdOrUsername(req: Request, res: Response) {
  const { idOrUsername } = req.params;
  const param = idOrUsername.toLowerCase();

  // Try MySQL first
  const dbRows = await dbQuery("SELECT * FROM creators WHERE (LOWER(id) = ? OR LOWER(username) = ?) AND status = 'active' LIMIT 1", [param, param]);
  if (dbRows && dbRows.length > 0) {
    const creator = mapDbRowToCreator(dbRows[0]);
    // Fetch creator reviews from MySQL
    const dbReviews = await dbQuery('SELECT * FROM creator_reviews WHERE creator_id = ? ORDER BY created_at DESC', [creator.id]);
    if (dbReviews && dbReviews.length > 0) {
      creator.reviews = dbReviews.map((r: any) => ({
        id: r.id,
        brandName: r.brand_name,
        rating: Number(r.rating) || 5,
        reviewText: r.review_text,
        campaignType: r.campaign_type,
        date: 'Recently',
        verifiedCollaboration: Boolean(r.verified_collaboration),
      }));
    }
    try {
      const posts: any = await dbQuery(
        'SELECT id, image_url, caption, created_at FROM creator_posts WHERE creator_id = ? ORDER BY created_at DESC LIMIT 50',
        [creator.id]
      );
      if (Array.isArray(posts) && posts.length > 0) {
        const photoItems = posts.map((p: any) => ({
          id: p.id,
          type: 'post' as const,
          title: p.caption || 'Photo post',
          thumbnail: p.image_url,
          url: p.image_url,
        }));
        creator.portfolio = [...photoItems, ...(creator.portfolio || [])];
      }
    } catch {
      // posts table may not exist yet on first boot
    }
    return res.json({ success: true, creator });
  }

  // Fallback to memory store
  const creator = creatorsStore.find(
    (c) => c.status === 'active' &&
      (c.id.toLowerCase() === param || c.username.toLowerCase() === param)
  );

  if (!creator) {
    return res.status(404).json({ success: false, error: 'Creator not found' });
  }

  res.json({ success: true, creator });
}

export async function createCreator(req: Request, res: Response) {
  try {
    const data = req.body;
    if (!data.name || !data.username) {
      return res.status(400).json({ success: false, error: 'Name and Username are required' });
    }

    const cleanUsername = data.username.replace('@', '').toLowerCase();

    const newCreator: Creator = {
      id: data.id || `c_${Date.now()}`,
      name: data.name,
      username: cleanUsername,
      avatar: data.avatar || '',
      coverImage: data.coverImage || '',
      bio: data.bio || '',
      currentCity: data.currentCity || '',
      state: data.state || '',
      preferredCities: data.preferredCities || (data.currentCity ? [data.currentCity] : []),
      primaryCategory: data.primaryCategory || '',
      subCategories: data.subCategories || [],
      languages: data.languages || [],
      gender: data.gender || undefined,
      ageGroup: data.ageGroup || '',
      followers: Number(data.followers) || 0,
      avgViews: Number(data.avgViews) || 0,
      avgLikes: Number(data.avgLikes) || 0,
      avgComments: Number(data.avgComments) || 0,
      brandCollaborationsCount: Number(data.brandCollaborationsCount) || 0,
      trustScore: 0,
      trustSignals: {
        profileCompleteness: 0,
        phoneVerified: Boolean(data.phone),
        emailVerified: Boolean(data.email),
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
      startingPrice: Number(data.startingPrice) || 0,
      pricing: data.pricing || {
        reelPrice: 0,
        storyPrice: 0,
        postPrice: 0,
        ugcPrice: 0,
        isNegotiable: false,
        isBarterAvailable: Boolean(data.isBarterAvailable),
        pricingDisplayType: 'starting',
      },
      collaborationTypes: data.collaborationTypes || [],
      socialPlatforms: data.socialPlatforms || [
        {
          platform: 'instagram',
          username: cleanUsername,
          url: `https://instagram.com/${cleanUsername}`,
          followers: Number(data.followers) || 0,
          avgViews: Number(data.avgViews) || 0,
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
      profileViews: 0,
      savedCount: 0,
      createdAt: new Date().toISOString(),
    };

    creatorsStore.unshift(newCreator);

    // Also persist in MySQL
    const creatorInsertResult = await dbQuery(
      `INSERT INTO creators (
        id, name, username, avatar, cover_image, bio, current_city, primary_category, email, phone,
        followers, avg_views, starting_price, reel_price, story_price, post_price,
        ugc_price, is_barter_available, collaboration_types, preferred_cities, sub_categories,
        languages, is_verified, verification_requested, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
      [
        newCreator.id,
        newCreator.name,
        newCreator.username,
        newCreator.avatar,
        newCreator.coverImage,
        newCreator.bio,
        newCreator.currentCity,
        newCreator.primaryCategory,
        newCreator.email || null,
        newCreator.phone || null,
        newCreator.followers,
        newCreator.avgViews,
        newCreator.startingPrice,
        newCreator.pricing.reelPrice,
        newCreator.pricing.storyPrice,
        newCreator.pricing.postPrice,
        newCreator.pricing.ugcPrice,
        newCreator.pricing.isBarterAvailable,
        JSON.stringify(newCreator.collaborationTypes),
        JSON.stringify(newCreator.preferredCities),
        JSON.stringify(newCreator.subCategories),
        JSON.stringify(newCreator.languages),
        0,
        1,
        'pending',
      ]
    );
    if (creatorInsertResult === null) {
      const creatorIndex = creatorsStore.findIndex((creator) => creator.id === newCreator.id);
      if (creatorIndex !== -1) creatorsStore.splice(creatorIndex, 1);
      return res.status(503).json({
        success: false,
        error: 'Creator profile could not be saved. Please try again.',
      });
    }

    res.status(201).json({ success: true, creator: newCreator });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create creator' });
  }
}

export async function updateCreator(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const dbOwner: any = await dbQuery('SELECT id, user_id FROM creators WHERE id = ? LIMIT 1', [id]);
  const ownerRow = Array.isArray(dbOwner) && dbOwner[0] ? dbOwner[0] : null;
  const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SALES';
  const isOwner =
    ownerRow &&
    (ownerRow.id === req.user.id || ownerRow.user_id === req.user.id);
  if (!isAdmin && !isOwner) {
    return res.status(403).json({ success: false, error: 'Not authorized to update this profile' });
  }

  if (Array.isArray(req.body.socialPlatforms)) {
    for (const p of req.body.socialPlatforms) {
      if (p?.url) {
        const check = validateOptionalUrl(p.url, `${p.platform || 'Social'} URL`);
        if (!check.ok) return res.status(400).json({ success: false, error: check.error });
      }
    }
  }

  let index = creatorsStore.findIndex((c) => c.id === id);
  if (index === -1) {
    const dbRows = await dbQuery('SELECT * FROM creators WHERE id = ? LIMIT 1', [id]);
    if (dbRows && dbRows.length > 0) {
      creatorsStore.unshift(mapDbRowToCreator(dbRows[0]));
      index = 0;
    }
  }
  if (index === -1) {
    // Local onboarding profiles can exist before their background database insert completes.
    // Keep the upload/profile update idempotent while the persistent record is being created.
    return res.json({ success: true, creator: null, message: 'Creator update queued' });
  }

  // Check if they are being verified for the first time
  const wasVerified = creatorsStore[index].isVerified;
  const isNowVerified = req.body.isVerified;
  const candidate = { ...creatorsStore[index], ...req.body };
  const completionFields = [
    Boolean(candidate.avatar && !candidate.avatar.includes('unsplash')),
    Boolean(candidate.coverImage && !candidate.coverImage.includes('unsplash')),
    Boolean(candidate.bio && candidate.bio.trim().length > 30),
    Boolean(candidate.currentCity && candidate.currentCity.trim()),
    Boolean(candidate.primaryCategory && candidate.primaryCategory.trim()),
    Number(candidate.followers) > 0,
    Number(candidate.startingPrice) > 0,
    Boolean((candidate.socialPlatforms || []).some((platform: any) => platform.platform === 'instagram' && platform.username)),
    Array.isArray(candidate.languages) && candidate.languages.length > 0,
  ];
  const completionPct = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);
  if (isNowVerified && completionPct < 70) {
    return res.status(400).json({
      success: false,
      error: `Profile must be at least 70% complete before approval. Current completion: ${completionPct}%.`,
    });
  }
  if (!isNowVerified && completionPct >= 70 && candidate.status === 'pending') {
    req.body.verificationRequested = true;
  }
  const shouldSendApprovalEmail = !wasVerified && isNowVerified;

  const body = req.body;
  const sanitizedUsername = body.username ? cleanInstagramHandle(body.username) : undefined;
  if (sanitizedUsername) body.username = sanitizedUsername;

  creatorsStore[index] = {
    ...creatorsStore[index],
    ...body,
    pricing: {
      ...creatorsStore[index].pricing,
      ...(body.pricing || {}),
    },
  };

  // Comprehensive MySQL Update
  try {
    await dbQuery(
      `UPDATE creators SET
        name = COALESCE(?, name),
        username = COALESCE(?, username),
        bio = COALESCE(?, bio),
        avatar = COALESCE(?, avatar),
        cover_image = COALESCE(?, cover_image),
        reel_video_url = COALESCE(?, reel_video_url),
        current_city = COALESCE(?, current_city),
        state = COALESCE(?, state),
        primary_category = COALESCE(?, primary_category),
        preferred_cities = COALESCE(?, preferred_cities),
        sub_categories = COALESCE(?, sub_categories),
        languages = COALESCE(?, languages),
        gender = COALESCE(?, gender),
        age_group = COALESCE(?, age_group),
        followers = COALESCE(?, followers),
        avg_views = COALESCE(?, avg_views),
        avg_likes = COALESCE(?, avg_likes),
        avg_comments = COALESCE(?, avg_comments),
        starting_price = COALESCE(?, starting_price),
        reel_price = COALESCE(?, reel_price),
        story_price = COALESCE(?, story_price),
        post_price = COALESCE(?, post_price),
        ugc_price = COALESCE(?, ugc_price),
        is_negotiable = COALESCE(?, is_negotiable),
        is_barter_available = COALESCE(?, is_barter_available),
        is_verified = COALESCE(?, is_verified),
        is_top20 = COALESCE(?, is_top20),
        is_featured = COALESCE(?, is_featured),
        is_rising = COALESCE(?, is_rising),
        verification_requested = COALESCE(?, verification_requested),
        status = COALESCE(?, status),
        social_platforms = COALESCE(?, social_platforms),
        collaboration_types = COALESCE(?, collaboration_types),
        audience = COALESCE(?, audience),
        latitude = COALESCE(?, latitude),
        longitude = COALESCE(?, longitude)
       WHERE id = ?`,
      [
        body.name !== undefined ? body.name : null,
        body.username !== undefined ? body.username : null,
        body.bio !== undefined ? body.bio : null,
        body.avatar !== undefined ? body.avatar : null,
        body.coverImage !== undefined ? body.coverImage : null,
        body.reelVideoUrl !== undefined ? body.reelVideoUrl : null,
        body.currentCity !== undefined ? body.currentCity : null,
        body.state !== undefined ? body.state : null,
        body.primaryCategory !== undefined ? body.primaryCategory : null,
        body.preferredCities !== undefined ? JSON.stringify(body.preferredCities) : null,
        body.subCategories !== undefined ? JSON.stringify(body.subCategories) : null,
        body.languages !== undefined ? JSON.stringify(body.languages) : null,
        body.gender !== undefined ? body.gender : null,
        body.ageGroup !== undefined ? body.ageGroup : null,
        body.followers !== undefined ? body.followers : null,
        body.avgViews !== undefined ? body.avgViews : null,
        body.avgLikes !== undefined ? body.avgLikes : null,
        body.avgComments !== undefined ? body.avgComments : null,
        body.startingPrice !== undefined ? body.startingPrice : (body.pricing?.startingPrice !== undefined ? body.pricing.startingPrice : null),
        body.pricing?.reelPrice !== undefined ? body.pricing.reelPrice : null,
        body.pricing?.storyPrice !== undefined ? body.pricing.storyPrice : null,
        body.pricing?.postPrice !== undefined ? body.pricing.postPrice : null,
        body.pricing?.ugcPrice !== undefined ? body.pricing.ugcPrice : null,

        body.pricing?.isNegotiable !== undefined ? (body.pricing.isNegotiable ? 1 : 0) : null,
        body.pricing?.isBarterAvailable !== undefined ? (body.pricing.isBarterAvailable ? 1 : 0) : null,
        body.isVerified !== undefined ? (body.isVerified ? 1 : 0) : null,
        body.isTop20 !== undefined ? (body.isTop20 ? 1 : 0) : null,
        body.isFeatured !== undefined ? (body.isFeatured ? 1 : 0) : null,
        body.isRising !== undefined ? (body.isRising ? 1 : 0) : null,
        body.verificationRequested !== undefined ? (body.verificationRequested ? 1 : 0) : null,
        body.status !== undefined ? body.status : null,
        body.socialPlatforms !== undefined ? JSON.stringify(body.socialPlatforms) : null,
        body.collaborationTypes !== undefined ? JSON.stringify(body.collaborationTypes) : null,
        body.audience !== undefined ? JSON.stringify(body.audience) : null,
        body.latitude !== undefined ? body.latitude : null,
        body.longitude !== undefined ? body.longitude : null,
        id,
      ]
    );
  } catch (err) {
    console.warn('MySQL creator full update notice:', err);
  }


  if (shouldSendApprovalEmail) {
    const creatorName = creatorsStore[index].name;
    const creatorEmail = creatorsStore[index].email || '';
    if (creatorEmail) {
      sendApprovalEmail(creatorEmail, creatorName);
    }
  }

  res.json({ success: true, creator: creatorsStore[index] });
}

export async function deleteCreator(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, error: 'Creator id is required' });

    // Step 1: Get the user_id linked to this creator profile
    const creatorRows = await dbQuery('SELECT user_id FROM creators WHERE id = ?', [id]);
    const userId = creatorRows?.[0]?.user_id || null;

    // Step 2: Delete creator profile from creators table
    await dbQuery('DELETE FROM creators WHERE id = ?', [id]);

    // Step 3: Permanently delete from users table as well
    if (userId) {
      await dbQuery('DELETE FROM users WHERE id = ?', [userId]);
    }

    // Step 4: Remove from in-memory creators store
    creatorsStore = creatorsStore.filter((creator) => creator.id !== id);

    return res.json({ success: true, message: 'Influencer permanently deleted successfully' });
  } catch (error) {
    console.error('Delete creator error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete influencer' });
  }
}

export async function addCreatorReview(req: Request, res: Response) {
  const { id } = req.params;
  const creator = creatorsStore.find((c) => c.id === id);
  if (!creator) {
    return res.status(404).json({ success: false, error: 'Creator not found' });
  }

  const newReview = {
    id: `rev_${Date.now()}`,
    brandName: req.body.brandName || 'Brand Partner',
    rating: req.body.rating || 5,
    reviewText: req.body.reviewText || req.body.comment || 'Great experience working with this creator!',
    campaignType: req.body.campaignType || 'Instagram Reel Campaign',
    date: 'Just now',
    verifiedCollaboration: true,
  };

  if (!creator.reviews) creator.reviews = [];
  creator.reviews.unshift(newReview);

  // MySQL Insert
  dbQuery(
    `INSERT INTO creator_reviews (id, creator_id, brand_name, rating, review_text, campaign_type)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [newReview.id, id, newReview.brandName, newReview.rating, newReview.reviewText, newReview.campaignType]
  ).catch(err => console.warn('MySQL review insert notice:', err));

  res.status(201).json({ success: true, review: newReview });
}
