import { Request, Response } from 'express';
import { dbQuery } from '../config/db';
import { INITIAL_CREATORS } from '../data/initialData';
import { Creator } from '../types';
import { sendApprovalEmail } from '../utils/mailer';

// In-Memory store initialized with seed data as resilient fallback
export let creatorsStore: Creator[] = [...INITIAL_CREATORS];

export function mapDbRowToCreator(row: any): Creator {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    avatar: row.avatar || '',
    coverImage: row.cover_image || '',
    reelVideoUrl: row.reel_video_url || '',
    bio: row.bio || '',
    currentCity: row.current_city,
    state: row.state || 'Delhi',
    preferredCities: typeof row.preferred_cities === 'string' ? JSON.parse(row.preferred_cities) : (row.preferred_cities || [row.current_city]),
    primaryCategory: row.primary_category,
    subCategories: typeof row.sub_categories === 'string' ? JSON.parse(row.sub_categories) : (row.sub_categories || []),
    languages: typeof row.languages === 'string' ? JSON.parse(row.languages) : (row.languages || ['Hindi', 'English']),
    gender: row.gender || 'Female',
    ageGroup: row.age_group || '22-29',
    followers: Number(row.followers) || 0,
    engagementRate: Number(row.engagement_rate) || 0,
    avgViews: Number(row.avg_views) || 0,
    avgLikes: Number(row.avg_likes) || 0,
    avgComments: Number(row.avg_comments) || 0,
    brandCollaborationsCount: Number(row.brand_collaborations_count) || 0,
    trustScore: Number(row.trust_score) || 85,
    trustSignals: typeof row.trust_signals === 'string' ? JSON.parse(row.trust_signals) : (row.trust_signals || {}),
    isVerified: Boolean(row.is_verified),
    verificationRequested: Boolean(row.verification_requested),
    isTop20: Boolean(row.is_top20),
    isRising: Boolean(row.is_rising),
    isFeatured: Boolean(row.is_featured),
    isTrending: Boolean(row.is_trending),
    status: row.status || 'active',
    startingPrice: Number(row.starting_price) || 5000,
    pricing: {
      reelPrice: Number(row.reel_price) || 8000,
      storyPrice: Number(row.story_price) || 3000,
      postPrice: Number(row.post_price) || 6000,
      ugcPrice: Number(row.ugc_price) || 7000,
      isNegotiable: Boolean(row.is_negotiable),
      isBarterAvailable: Boolean(row.is_barter_available),
      pricingDisplayType: 'starting',
    },
    collaborationTypes: typeof row.collaboration_types === 'string' ? JSON.parse(row.collaboration_types) : (row.collaboration_types || ['Paid', 'UGC']),
    socialPlatforms: typeof row.social_platforms === 'string' ? JSON.parse(row.social_platforms) : (row.social_platforms || []),
    audience: typeof row.audience === 'string' ? JSON.parse(row.audience) : (row.audience || {}),
    portfolio: typeof row.portfolio === 'string' ? JSON.parse(row.portfolio) : (row.portfolio || []),
    phone: row.phone,
    email: row.email,
    verificationStepsCompleted: ['Phone', 'Email', 'Instagram Linked'],
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

    if (minEngagement) {
      sqlConditions.push('engagement_rate >= ?');
      sqlParams.push(parseFloat(minEngagement as string));
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
      sqlConditions.push('(is_rising = 1 OR engagement_rate >= 5.0)');
    }

    // SQL Index-backed Sorting
    let orderByClause = 'ORDER BY trust_score DESC, followers DESC';
    if (sortBy === 'followers') {
      orderByClause = 'ORDER BY followers DESC';
    } else if (sortBy === 'engagement') {
      orderByClause = 'ORDER BY engagement_rate DESC';
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

    if (minEngagement) {
      const minE = parseFloat(minEngagement as string);
      result = result.filter((c) => c.engagementRate >= minE);
    }

    if (isVerified === 'true') {
      result = result.filter((c) => c.isVerified);
    }

    if (isTop20 === 'true') {
      result = result.filter((c) => c.isTop20);
    }

    if (isRising === 'true') {
      result = result.filter((c) => c.isRising || c.engagementRate >= 5.0);
    }

    if (sortBy === 'followers') {
      result.sort((a, b) => b.followers - a.followers);
    } else if (sortBy === 'engagement') {
      result.sort((a, b) => b.engagementRate - a.engagementRate);
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
  const dbRows = await dbQuery('SELECT * FROM creators WHERE LOWER(id) = ? OR LOWER(username) = ? LIMIT 1', [param, param]);
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
    return res.json({ success: true, creator });
  }

  // Fallback to memory store
  const creator = creatorsStore.find(
    (c) => c.id.toLowerCase() === param || c.username.toLowerCase() === param
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
      id: `c_${Date.now()}`,
      name: data.name,
      username: cleanUsername,
      avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      coverImage: data.coverImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80',
      bio: data.bio || `Indian creator in ${data.primaryCategory || 'Lifestyle'} based in ${data.currentCity || 'Delhi NCR'}.`,
      currentCity: data.currentCity || 'Delhi NCR',
      state: data.state || 'Delhi',
      preferredCities: [data.currentCity || 'Delhi NCR'],
      primaryCategory: data.primaryCategory || 'Lifestyle',
      subCategories: data.subCategories || [],
      languages: data.languages || ['Hindi', 'English'],
      gender: data.gender || 'Female',
      ageGroup: data.ageGroup || '22-29',
      followers: parseInt(data.followers || '15000', 10),
      engagementRate: parseFloat(data.engagementRate || '4.8'),
      avgViews: parseInt(data.avgViews || '12000', 10),
      avgLikes: parseInt(data.avgLikes || '1200', 10),
      avgComments: 80,
      brandCollaborationsCount: 4,
      trustScore: 88,
      trustSignals: {
        profileCompleteness: 90,
        phoneVerified: true,
        emailVerified: true,
        socialVerified: true,
        engagementQuality: 88,
        audienceQuality: 90,
        collaborationHistoryScore: 85,
        verifiedReviewsCount: 2,
        responseRate: 95,
        campaignReliability: 90,
        accountActivityScore: 92,
      },
      isVerified: false,
      verificationRequested: true,
      verificationStepsCompleted: ['Phone', 'Email', 'Instagram Linked'],
      isTop20: false,
      isRising: true,
      isFeatured: false,
      isTrending: true,
      status: 'pending',
      startingPrice: parseInt(data.startingPrice || '5000', 10),
      pricing: data.pricing || {
        reelPrice: parseInt(data.startingPrice || '5000', 10) * 1.5,
        storyPrice: parseInt(data.startingPrice || '5000', 10) * 0.5,
        postPrice: parseInt(data.startingPrice || '5000', 10),
        ugcPrice: parseInt(data.startingPrice || '5000', 10) * 1.2,
        isNegotiable: true,
        isBarterAvailable: Boolean(data.isBarterAvailable),
        pricingDisplayType: 'starting',
      },
      collaborationTypes: data.collaborationTypes || ['Paid', 'UGC', 'Product Review'],
      socialPlatforms: data.socialPlatforms || [
        {
          platform: 'instagram',
          username: cleanUsername,
          url: `https://instagram.com/${cleanUsername}`,
          followers: parseInt(data.followers || '15000', 10),
          avgViews: parseInt(data.avgViews || '12000', 10),
          engagementRate: parseFloat(data.engagementRate || '4.8'),
          verified: false,
        }
      ],
      audience: {
        topCities: [{ city: data.currentCity || 'Delhi NCR', percentage: 48 }, { city: 'Mumbai', percentage: 22 }],
        topCountries: [{ country: 'India', percentage: 95 }],
        ageGroups: [{ bracket: '18-24', percentage: 55 }, { bracket: '25-34', percentage: 35 }],
        genderSplit: [{ gender: 'Female', percentage: 65 }, { gender: 'Male', percentage: 35 }],
        topInterests: [data.primaryCategory || 'Lifestyle'],
        avgReach: 25000,
        avgImpressions: 40000,
      },
      portfolio: [],
      previousCollaborations: [],
      reviews: [],
      profileViews: 1,
      savedCount: 0,
      createdAt: new Date().toISOString(),
    };

    creatorsStore.unshift(newCreator);

    // Also persist in MySQL
    dbQuery(
      `INSERT INTO creators (
        id, name, username, avatar, cover_image, bio, current_city, primary_category,
        followers, engagement_rate, starting_price, reel_price, story_price, post_price,
        ugc_price, is_barter_available, collaboration_types, preferred_cities, sub_categories,
        languages, trust_score, is_verified, verification_requested, status
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
        newCreator.followers,
        newCreator.engagementRate,
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
        newCreator.trustScore,
        0,
        1,
        'pending',
      ]
    ).catch(err => console.warn('MySQL creator insert notice:', err));

    res.status(201).json({ success: true, creator: newCreator });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create creator' });
  }
}

export async function updateCreator(req: Request, res: Response) {
  const { id } = req.params;
  let index = creatorsStore.findIndex((c) => c.id === id);
  if (index === -1) {
    const dbRows = await dbQuery('SELECT * FROM creators WHERE id = ? LIMIT 1', [id]);
    if (dbRows && dbRows.length > 0) {
      creatorsStore.unshift(mapDbRowToCreator(dbRows[0]));
      index = 0;
    }
  }
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Creator not found' });
  }

  // Check if they are being verified for the first time
  const wasVerified = creatorsStore[index].isVerified;
  const isNowVerified = req.body.isVerified;
  const shouldSendApprovalEmail = !wasVerified && isNowVerified;

  creatorsStore[index] = {
    ...creatorsStore[index],
    ...req.body,
  };

  const body = req.body;

  // Comprehensive MySQL Update
  dbQuery(
    `UPDATE creators SET
      name = COALESCE(?, name),
      bio = COALESCE(?, bio),
      avatar = COALESCE(?, avatar),
      cover_image = COALESCE(?, cover_image),
      reel_video_url = COALESCE(?, reel_video_url),
      starting_price = COALESCE(?, starting_price),
      reel_price = COALESCE(?, reel_price),
      story_price = COALESCE(?, story_price),
      ugc_price = COALESCE(?, ugc_price),
      is_verified = COALESCE(?, is_verified),
      is_top20 = COALESCE(?, is_top20),
      is_featured = COALESCE(?, is_featured),
      is_rising = COALESCE(?, is_rising),
      verification_requested = COALESCE(?, verification_requested),
      status = COALESCE(?, status)
     WHERE id = ?`,
    [
      body.name !== undefined ? body.name : null,
      body.bio !== undefined ? body.bio : null,
      body.avatar !== undefined ? body.avatar : null,
      body.coverImage !== undefined ? body.coverImage : null,
      body.reelVideoUrl !== undefined ? body.reelVideoUrl : null,
      body.startingPrice !== undefined ? body.startingPrice : null,
      body.pricing?.reelPrice !== undefined ? body.pricing.reelPrice : null,
      body.pricing?.storyPrice !== undefined ? body.pricing.storyPrice : null,
      body.pricing?.ugcPrice !== undefined ? body.pricing.ugcPrice : null,
      body.isVerified !== undefined ? (body.isVerified ? 1 : 0) : null,
      body.isTop20 !== undefined ? (body.isTop20 ? 1 : 0) : null,
      body.isFeatured !== undefined ? (body.isFeatured ? 1 : 0) : null,
      body.isRising !== undefined ? (body.isRising ? 1 : 0) : null,
      body.verificationRequested !== undefined ? (body.verificationRequested ? 1 : 0) : null,
      body.status !== undefined ? body.status : null,
      id,
    ]
  ).catch(err => console.warn('MySQL creator full update notice:', err));

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

    await dbQuery('DELETE FROM creators WHERE id = ?', [id]);
    creatorsStore = creatorsStore.filter((creator) => creator.id !== id);
    return res.json({ success: true, message: 'Influencer deleted successfully' });
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
