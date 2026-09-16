import { Request, Response } from 'express';
import { dbQuery } from '../config/db';
import { CampaignRequirement } from '../types';
import { creatorsStore } from './creatorController';

let campaignsStore: CampaignRequirement[] = [
  {
    id: 'camp-1',
    companyName: 'Aura Indo-Western',
    contactPerson: 'Aditi Rao',
    email: 'aditi@aurafashion.in',
    phone: '+91 98101 23456',
    industry: 'Fashion & Apparel',
    campaignTitle: 'Festive Festive Lookbook & Store Walk-In Campaign',
    campaignDescription: 'Looking for 5 verified fashion creators in Delhi NCR & Mumbai for festive collection try-on reels and store visit reels.',
    city: 'Delhi NCR',
    influencersCount: '5 Creators',
    followerRange: '50k-200k',
    budget: '₹40,000 - ₹1,00,000',
    category: 'Fashion',
    collaborationType: 'Paid',
    campaignDate: 'Next 2 Weeks',
    platforms: ['instagram'],
    requirements: '1 Reel with audio trending + 2 Stories with swipe-up product link.',
    status: 'Open',
    applicantsCount: 0,
    applicants: [],
    createdAt: '2 days ago',
  },
  {
    id: 'camp-2',
    companyName: 'Bakehouse 101 Cafes',
    contactPerson: 'Karan Mehra',
    email: 'karan@bakehouse101.com',
    phone: '+91 98200 87654',
    industry: 'Restaurants & Cafes',
    campaignTitle: 'New Artisanal Dessert Menu Launch',
    campaignDescription: 'Invite local foodie creators in Mumbai & Pune for an exclusive tasting session & aesthetic cafe aesthetic reels.',
    city: 'Mumbai',
    influencersCount: '8 Creators',
    followerRange: '10k-50k',
    budget: '₹20,000 - ₹50,000 + Complimentary Feast',
    category: 'Food',
    collaborationType: 'Barter',
    campaignDate: 'This Weekend',
    platforms: ['instagram'],
    requirements: 'Reel review of top 3 signature desserts + location geo-tag.',
    status: 'Open',
    applicantsCount: 0,
    applicants: [],
    createdAt: '1 day ago',
  },
  {
    id: 'camp-3',
    companyName: 'Zenith Fitness Gear',
    contactPerson: 'Vikram Singh',
    email: 'collabs@zenithfit.in',
    phone: '+91 99300 45678',
    industry: 'Gyms & Wellness',
    campaignTitle: 'Resistance Bands & Smart Shaker UGC Ad Campaign',
    campaignDescription: 'Seeking fitness athletes & trainers for raw UGC workout videos to be used in meta ads.',
    city: 'Bangalore',
    influencersCount: '4 Creators',
    followerRange: '25k-100k',
    budget: '₹35,000 - ₹75,000',
    category: 'Fitness',
    collaborationType: 'UGC',
    campaignDate: 'Immediate',
    platforms: ['instagram', 'youtube'],
    requirements: 'Raw 4K 9:16 vertical workout clip + 3 hook variations for meta advertising whitelist.',
    status: 'Open',
    applicantsCount: 0,
    applicants: [],
    createdAt: '3 days ago',
  }
];

export async function getCampaigns(req: Request, res: Response) {
  try {
    const dbRows: any = await dbQuery('SELECT * FROM campaign_requirements ORDER BY created_at DESC');

    // Relational Fetch: Join campaign_applicants with creators and users
    let applicantsRows: any[] = [];
    try {
      applicantsRows = (await dbQuery(`
        SELECT 
          ca.id,
          ca.campaign_id,
          ca.creator_id,
          ca.pitch,
          ca.status,
          ca.applied_at,
          COALESCE(c.name, ca.creator_name, u.name, 'Creator') as creator_name,
          COALESCE(c.username, '') as creator_username,
          COALESCE(c.avatar, ca.creator_avatar, u.avatar, '') as creator_avatar,
          COALESCE(c.primary_category, 'Influencer') as creator_category,
          COALESCE(c.current_city, 'India') as creator_city,
          COALESCE(c.followers, 0) as creator_followers,
          COALESCE(c.avg_views, 0) as creator_avg_views
        FROM campaign_applicants ca
        LEFT JOIN creators c ON (c.id = ca.creator_id OR c.user_id = ca.creator_id)
        LEFT JOIN users u ON u.id = ca.creator_id
        ORDER BY ca.applied_at DESC
      `)) as any[];
    } catch (e) {
      console.warn('campaign_applicants fetch notice:', e);
    }

    const applicantsByCampaign: Record<string, any[]> = {};
    if (Array.isArray(applicantsRows)) {
      for (const a of applicantsRows) {
        if (!applicantsByCampaign[a.campaign_id]) {
          applicantsByCampaign[a.campaign_id] = [];
        }
        applicantsByCampaign[a.campaign_id].push({
          creatorId: a.creator_id,
          creatorName: a.creator_name,
          creatorUsername: a.creator_username,
          creatorAvatar: a.creator_avatar,
          creatorCategory: a.creator_category,
          creatorCity: a.creator_city,
          creatorFollowers: Number(a.creator_followers) || 0,
          creatorAvgViews: Number(a.creator_avg_views) || 0,
          pitch: a.pitch,
          appliedAt: a.applied_at ? new Date(a.applied_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Recently',
          status: a.status || 'Pending',
        });
      }
    }

    const mapped = (dbRows || []).map((r: any) => {
      const campApplicants = applicantsByCampaign[r.id] || [];
      return {
        id: r.id,
        companyName: r.company_name,
        contactPerson: r.contact_person,
        email: r.email,
        phone: r.phone || '',
        industry: r.industry || 'General',
        campaignTitle: r.campaign_title,
        campaignDescription: r.campaign_description,
        city: r.city,
        influencersCount: r.influencers_count,
        followerRange: r.follower_range,
        budget: r.budget,
        category: r.category,
        collaborationType: r.collaboration_type,
        campaignDate: r.campaign_date || 'Upcoming',
        platforms: typeof r.platforms === 'string' ? JSON.parse(r.platforms) : (r.platforms || ['instagram']),
        requirements: r.requirements || r.campaign_description,
        status: r.status || 'Open',
        applicantsCount: campApplicants.length || Number(r.applicants_count) || 0,
        applicants: campApplicants,
        createdAt: 'Recently',
      };
    });
    return res.json({ success: true, total: mapped.length, campaigns: mapped });
  } catch (err) {
    console.warn('MySQL getCampaigns notice:', err);
  }

  res.json({
    success: true,
    total: campaignsStore.length,
    campaigns: campaignsStore,
  });
}

export async function createCampaign(req: Request, res: Response) {
  try {
    const data = req.body;
    if (!data.companyName || !data.campaignTitle) {
      return res.status(400).json({ success: false, error: 'Company Name and Campaign Title are required' });
    }

    const newCampaign: CampaignRequirement = {
      id: `camp_${Date.now()}`,
      companyName: data.companyName,
      contactPerson: data.contactPerson || data.companyName,
      email: data.email,
      phone: data.phone || '',
      industry: data.industry || 'General',
      campaignTitle: data.campaignTitle,
      campaignDescription: data.campaignDescription || data.requirements || '',
      city: data.city || 'Pan India',
      influencersCount: data.influencersCount || '1-5 Creators',
      followerRange: data.followerRange || 'Any',
      budget: data.budget || 'Negotiable',
      category: data.category || 'Lifestyle',
      collaborationType: data.collaborationType || 'Paid',
      campaignDate: data.campaignDate || 'Upcoming',
      platforms: data.platforms || ['instagram'],
      requirements: data.requirements || data.campaignDescription || '',
      status: 'Open',
      applicantsCount: 0,
      applicants: [],
      createdAt: 'Just now',
    };

    campaignsStore.unshift(newCampaign);

    // MySQL Insert
    dbQuery(
      `INSERT INTO campaign_requirements (id, company_name, contact_person, email, campaign_title, campaign_description, city, budget, category, collaboration_type, requirements, platforms, approval_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')`,
      [newCampaign.id, newCampaign.companyName, newCampaign.contactPerson, newCampaign.email, newCampaign.campaignTitle, newCampaign.campaignDescription, newCampaign.city, newCampaign.budget, newCampaign.category, newCampaign.collaborationType, newCampaign.requirements, JSON.stringify(newCampaign.platforms)]
    ).catch(err => console.warn('MySQL campaign insert notice:', err));

    res.status(201).json({ success: true, campaign: newCampaign });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to post campaign brief' });
  }
}

export async function deleteCampaign(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, error: 'Campaign id is required' });

    await dbQuery('DELETE FROM campaign_applicants WHERE campaign_id = ?', [id]);
    await dbQuery('DELETE FROM campaign_requirements WHERE id = ?', [id]);
    campaignsStore = campaignsStore.filter((campaign) => campaign.id !== id);

    return res.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete campaign' });
  }
}

export async function applyToCampaign(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { creatorId, pitch } = req.body;

    if (!creatorId) {
      return res.status(400).json({ success: false, error: 'creatorId is required' });
    }

    // Check in database first
    let campaignExists = false;
    try {
      const rows: any = await dbQuery('SELECT id FROM campaign_requirements WHERE id = ?', [id]);
      if (Array.isArray(rows) && rows.length > 0) {
        campaignExists = true;
      }
    } catch (e) {
      console.warn('Check campaign error:', e);
    }

    // Check in memory store fallback
    const campaignInMemory = campaignsStore.find((c) => c.id === id);
    if (campaignInMemory) {
      campaignExists = true;
    }

    if (!campaignExists) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    // Relational Lookup: query creators/users table using creatorId
    let creatorRecord: any = null;
    try {
      const cRows: any = await dbQuery(
        'SELECT id, name, username, avatar, primary_category, current_city, followers, avg_views FROM creators WHERE id = ? OR user_id = ? LIMIT 1',
        [creatorId, creatorId]
      );
      if (Array.isArray(cRows) && cRows.length > 0) {
        creatorRecord = cRows[0];
      } else {
        const uRows: any = await dbQuery('SELECT id, name, avatar FROM users WHERE id = ? LIMIT 1', [creatorId]);
        if (Array.isArray(uRows) && uRows.length > 0) {
          creatorRecord = uRows[0];
        }
      }
    } catch (e) {
      console.warn('Creator relational lookup error:', e);
    }

    if (!creatorRecord) {
      creatorRecord = creatorsStore.find((c) => c.id === creatorId) || creatorsStore[0];
    }

    const finalCreatorId = creatorRecord?.id || creatorId;
    const finalCreatorName = creatorRecord?.name || 'Creator';
    const finalCreatorAvatar = creatorRecord?.avatar || '';

    const application = {
      creatorId: finalCreatorId,
      creatorName: finalCreatorName,
      creatorUsername: creatorRecord?.username || '',
      creatorAvatar: finalCreatorAvatar,
      creatorCategory: creatorRecord?.primary_category || creatorRecord?.primaryCategory || 'Influencer',
      creatorCity: creatorRecord?.current_city || creatorRecord?.currentCity || 'Pan India',
      creatorFollowers: Number(creatorRecord?.followers) || 0,
      creatorAvgViews: Number(creatorRecord?.avg_views) || 0,
      pitch: pitch || 'Hi! I would love to collaborate on this campaign.',
      appliedAt: new Date().toISOString(),
      status: 'Pending' as const,
    };

    if (campaignInMemory) {
      if (!campaignInMemory.applicants) campaignInMemory.applicants = [];
      campaignInMemory.applicants.push(application);
      campaignInMemory.applicantsCount = campaignInMemory.applicants.length;
    }

    // MySQL Insert Applicant with creator_id relation
    try {
      await dbQuery(
        `INSERT INTO campaign_applicants (id, campaign_id, creator_id, creator_name, creator_avatar, pitch, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [`app_${Date.now()}`, id, finalCreatorId, finalCreatorName, finalCreatorAvatar, application.pitch, 'Pending']
      );
      await dbQuery('UPDATE campaign_requirements SET applicants_count = applicants_count + 1 WHERE id = ?', [id]);
    } catch (err) {
      console.warn('MySQL applicant insert notice:', err);
    }

    return res.status(201).json({ success: true, application });
  } catch (error) {
    console.error('applyToCampaign error:', error);
    return res.status(500).json({ success: false, error: 'Failed to apply' });
  }
}

export async function updateApplicantStatus(req: Request, res: Response) {
  try {
    const { id, creatorId } = req.params;
    const { status } = req.body;

    const campaign = campaignsStore.find((c) => c.id === id);
    if (campaign && campaign.applicants) {
      const applicant = campaign.applicants.find(a => a.creatorId === creatorId);
      if (applicant) {
        applicant.status = status;
      }
    }

    // MySQL Update
    try {
      await dbQuery(
        `UPDATE campaign_applicants SET status = ? WHERE campaign_id = ? AND creator_id = ?`,
        [status, id, creatorId]
      );
    } catch (err) {
      console.warn('MySQL applicant status update notice:', err);
    }

    return res.json({ success: true, status });
  } catch (error) {
    console.error('updateApplicantStatus error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update applicant status' });
  }
}
