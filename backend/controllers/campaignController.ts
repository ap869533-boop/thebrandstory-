import { Response } from 'express';
import { dbQuery } from '../config/db';
import { CampaignRequirement } from '../types';
import { creatorsStore } from './creatorController';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { parseNonNegInt, validateWhatsAppNumber } from '../utils/validation';

let campaignsStore: CampaignRequirement[] = [];

function validateCampaignPhone(raw: string | undefined | null) {
  const result = validateWhatsAppNumber(raw);
  const digits = String(raw || '').replace(/\D/g, '');
  if (!result.ok || !/^[6-9]\d{9}$/.test(digits)) {
    return { ok: false, normalized: '', error: 'Enter a valid 10-digit Indian WhatsApp number' };
  }
  return result;
}

function mapCampaignRow(r: any, campApplicants: any[] = []) {
  const maleCount = Number(r.male_count) || 0;
  const femaleCount = Number(r.female_count) || 0;
  const totalCount = maleCount + femaleCount;
  return {
    id: r.id,
    userId: r.user_id || null,
    companyName: r.company_name,
    contactPerson: r.contact_person,
    email: r.email,
    phone: r.phone || '',
    industry: r.industry || 'General',
    campaignTitle: r.campaign_title,
    campaignDescription: r.campaign_description,
    city: r.city,
    genderPreference: r.gender_preference || 'Any',
    ageRange: r.age_range || 'Any',
    language: r.language || 'Any',
    maleCount,
    femaleCount,
    totalCount,
    followerRange: r.follower_range,
    budget: r.budget,
    category: r.category,
    collaborationType: r.collaboration_type,
    campaignDate: r.campaign_date || 'Upcoming',
    validUntil: r.valid_until || undefined,
    platforms: typeof r.platforms === 'string' ? JSON.parse(r.platforms) : (r.platforms || ['instagram']),
    requirements: r.requirements || r.campaign_description,
    status: r.status || 'Open',
    approvalStatus: r.approval_status || 'pending',
    applicantsCount: campApplicants.length || Number(r.applicants_count) || 0,
    applicants: campApplicants,
    createdAt: r.created_at ? new Date(r.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short' }) : 'Recently',
  };
}

async function fetchApplicantsByCampaign(): Promise<Record<string, any[]>> {
  const applicantsByCampaign: Record<string, any[]> = {};
  try {
    const applicantsRows = (await dbQuery(`
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
          appliedAt: a.applied_at
            ? new Date(a.applied_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
            : 'Recently',
          status: a.status || 'Pending',
        });
      }
    }
  } catch (e) {
    console.warn('campaign_applicants fetch notice:', e);
  }
  return applicantsByCampaign;
}

/** Public listing: only approved + Open/In Review/Filled campaigns. */
export async function getCampaigns(req: AuthenticatedRequest, res: Response) {
  try {
    const scope = String(req.query.scope || 'public');
    const userId = req.user?.id;
    const role = req.user?.role;

    let sql = 'SELECT * FROM campaign_requirements';
    const params: any[] = [];

    if (scope === 'mine' && userId && role === 'BRAND') {
      sql += ' WHERE user_id = ? OR email = ?';
      params.push(userId, req.user?.email || '');
    } else if (scope === 'admin' && (role === 'ADMIN' || role === 'SALES')) {
      // all campaigns for admin
    } else {
      // Public: approved only, not rejected/pending
      sql += ` WHERE approval_status = 'approved' AND status IN ('Open', 'In Review', 'Filled')`;
    }

    sql += ' ORDER BY created_at DESC';

    const dbRows: any = await dbQuery(sql, params);
    const applicantsByCampaign = await fetchApplicantsByCampaign();

    const mapped = (dbRows || []).map((r: any) => mapCampaignRow(r, applicantsByCampaign[r.id] || []));
    campaignsStore = mapped;
    return res.json({ success: true, total: mapped.length, campaigns: mapped });
  } catch (err) {
    console.warn('MySQL getCampaigns notice:', err);
  }

  // Fallback: filter memory store for public
  const publicOnly = campaignsStore.filter(
    (c: any) => (c.approvalStatus || 'approved') === 'approved' && ['Open', 'In Review', 'Filled'].includes(c.status)
  );
  res.json({
    success: true,
    total: publicOnly.length,
    campaigns: publicOnly,
  });
}

export async function createCampaign(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'BRAND') {
      return res.status(401).json({ success: false, error: 'Brand authentication required to create campaigns' });
    }

    const data = req.body;
    if (!data.companyName || !data.campaignTitle) {
      return res.status(400).json({ success: false, error: 'Company Name and Campaign Title are required' });
    }

    const phoneCheck = validateCampaignPhone(data.phone);
    if (!phoneCheck.ok) {
      return res.status(400).json({ success: false, error: phoneCheck.error });
    }

    const maleCount = parseNonNegInt(data.maleCount, 0);
    const femaleCount = parseNonNegInt(data.femaleCount, 0);
    if (maleCount + femaleCount < 1) {
      return res.status(400).json({ success: false, error: 'Provide at least one male or female influencer count' });
    }
    const totalCount = maleCount + femaleCount;

    const newCampaign: any = {
      id: `camp_${Date.now()}`,
      userId: req.user.id,
      companyName: data.companyName,
      contactPerson: data.contactPerson || data.companyName,
      email: data.email || req.user.email,
      phone: phoneCheck.normalized,
      industry: data.industry || 'General',
      campaignTitle: data.campaignTitle,
      campaignDescription: data.campaignDescription || data.requirements || '',
      city: data.city || 'Pan India',
      maleCount,
      femaleCount,
      totalCount,
      genderPreference: data.genderPreference || 'Any',
      ageRange: data.ageRange || 'Any',
      language: data.language || 'Any',

      followerRange: data.followerRange || 'Any',
      budget: data.budget || 'Negotiable',
      category: data.category || 'Lifestyle',
      collaborationType: data.collaborationType || 'Paid',
      campaignDate: data.campaignDate || 'Upcoming',
      validUntil: data.validUntil || undefined,
      platforms: data.platforms || ['instagram'],
      requirements: data.requirements || data.campaignDescription || '',
      status: 'In Review',
      approvalStatus: 'pending',
      applicantsCount: 0,
      applicants: [],
      createdAt: 'Just now',
    };

    campaignsStore.unshift(newCampaign);

    try {
      await dbQuery(
        `INSERT INTO campaign_requirements (
          id, user_id, company_name, contact_person, email, phone, industry,
          campaign_title, campaign_description, city, male_count, female_count,
          gender_preference, age_range, language,
          follower_range, budget, category, collaboration_type, campaign_date, valid_until, requirements, platforms,
          status, approval_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'In Review', 'pending')`,
        [
          newCampaign.id,
          req.user.id,
          newCampaign.companyName,
          newCampaign.contactPerson,
          newCampaign.email,
          newCampaign.phone,
          newCampaign.industry,
          newCampaign.campaignTitle,
          newCampaign.campaignDescription,
          newCampaign.city,
          maleCount,
          femaleCount,
          newCampaign.genderPreference || 'Any',
          newCampaign.ageRange || 'Any',
          newCampaign.language || 'Any',
          newCampaign.followerRange,
          newCampaign.budget,
          newCampaign.category,
          newCampaign.collaborationType,
          newCampaign.campaignDate,
          newCampaign.validUntil || null,
          newCampaign.requirements,
          JSON.stringify(newCampaign.platforms),
        ]
      );
    } catch (err) {
      console.warn('MySQL campaign insert notice:', err);
      return res.status(500).json({ success: false, error: 'Failed to save campaign to database' });
    }

    return res.status(201).json({
      success: true,
      campaign: newCampaign,
      message: 'Campaign submitted for admin approval',
    });
  } catch (error) {
    console.error('createCampaign error:', error);
    return res.status(500).json({ success: false, error: 'Failed to post campaign brief' });
  }
}

export async function updateCampaign(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }

      const { id } = req.params;
      const rows: any = await dbQuery('SELECT * FROM campaign_requirements WHERE id = ? LIMIT 1', [id]);
      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Campaign not found' });
      }
      const existing = rows[0];

      const isOwner =
        existing.user_id === req.user.id ||
        (existing.email && req.user.email && existing.email.toLowerCase() === req.user.email.toLowerCase());
      const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SALES';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ success: false, error: 'Not authorized to update this campaign' });
      }

      const data = req.body;
      let phone = existing.phone;
      if (data.phone !== undefined) {
        const phoneCheck = validateCampaignPhone(data.phone);
        if (!phoneCheck.ok) return res.status(400).json({ success: false, error: phoneCheck.error });
        phone = phoneCheck.normalized;
      }

      const maleCount = data.maleCount !== undefined ? parseNonNegInt(data.maleCount, 0) : Number(existing.male_count) || 0;
      const femaleCount = data.femaleCount !== undefined ? parseNonNegInt(data.femaleCount, 0) : Number(existing.female_count) || 0;
      const totalCount = maleCount + femaleCount;

      // Brand edits re-submit for approval unless admin is editing
      const nextApproval = isAdmin && data.approvalStatus
        ? data.approvalStatus
        : isOwner
          ? 'pending'
          : existing.approval_status;
      const nextStatus = nextApproval === 'pending' ? 'In Review' : (data.status || existing.status);

      await dbQuery(
        `UPDATE campaign_requirements SET
        company_name = COALESCE(?, company_name),
        contact_person = COALESCE(?, contact_person),
        email = COALESCE(?, email),
        phone = ?,
        campaign_title = COALESCE(?, campaign_title),
        campaign_description = COALESCE(?, campaign_description),
        city = COALESCE(?, city),
        male_count = ?,
        female_count = ?,
        follower_range = COALESCE(?, follower_range),
        budget = COALESCE(?, budget),
        category = COALESCE(?, category),
        collaboration_type = COALESCE(?, collaboration_type),
        requirements = COALESCE(?, requirements),
        platforms = COALESCE(?, platforms),
        status = ?,
        approval_status = ?
       WHERE id = ?`,
        [
          data.companyName ?? null,
          data.contactPerson ?? null,
          data.email ?? null,
          phone,
          data.campaignTitle ?? null,
          data.campaignDescription ?? null,
          data.city ?? null,
          maleCount,
          femaleCount,
          data.followerRange ?? null,
          data.budget ?? null,
          data.category ?? null,
          data.collaborationType ?? null,
          data.requirements ?? null,
          data.platforms ? JSON.stringify(data.platforms) : null,
          nextStatus,
          nextApproval,
          id,
        ]
      );

      return res.json({
        success: true,
        id,
        maleCount,
        femaleCount,
        totalCount,
        approvalStatus: nextApproval,
        status: nextStatus,
      });
    } catch (error) {
      console.error('updateCampaign error:', error);
      return res.status(500).json({ success: false, error: 'Failed to update campaign' });
    }
  }

  export async function deleteCampaign(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ success: false, error: 'Campaign id is required' });
      if (!req.user) return res.status(401).json({ success: false, error: 'Authentication required' });

      const rows: any = await dbQuery('SELECT * FROM campaign_requirements WHERE id = ? LIMIT 1', [id]);
      if (Array.isArray(rows) && rows.length > 0) {
        const existing = rows[0];
        const isOwner =
          existing.user_id === req.user.id ||
          (existing.email && req.user.email && existing.email.toLowerCase() === req.user.email.toLowerCase());
        const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SALES';
        if (!isOwner && !isAdmin) {
          return res.status(403).json({ success: false, error: 'Not authorized to delete this campaign' });
        }
      }

      await dbQuery('DELETE FROM campaign_applicants WHERE campaign_id = ?', [id]);
      await dbQuery('DELETE FROM campaign_requirements WHERE id = ?', [id]);
      campaignsStore = campaignsStore.filter((campaign) => campaign.id !== id);

      return res.json({ success: true, message: 'Campaign deleted successfully' });
    } catch (error) {
      console.error('Delete campaign error:', error);
      return res.status(500).json({ success: false, error: 'Failed to delete campaign' });
    }
  }

  export async function applyToCampaign(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { creatorId, pitch } = req.body;
      const effectiveCreatorId = req.user?.role === 'CREATOR' ? (creatorId || req.user.id) : creatorId;

      if (!effectiveCreatorId) {
        return res.status(400).json({ success: false, error: 'creatorId is required' });
      }

      let campaignExists = false;
      let approvalStatus = 'pending';
      try {
        const rows: any = await dbQuery(
          'SELECT id, approval_status, status FROM campaign_requirements WHERE id = ?',
          [id]
        );
        if (Array.isArray(rows) && rows.length > 0) {
          campaignExists = true;
          approvalStatus = rows[0].approval_status || 'pending';
          if (approvalStatus !== 'approved') {
            return res.status(403).json({ success: false, error: 'Campaign is not open for applications yet' });
          }
        }
      } catch (e) {
        console.warn('Check campaign error:', e);
      }

      const campaignInMemory = campaignsStore.find((c) => c.id === id);
      if (campaignInMemory) {
        campaignExists = true;
        if ((campaignInMemory as any).approvalStatus && (campaignInMemory as any).approvalStatus !== 'approved') {
          return res.status(403).json({ success: false, error: 'Campaign is not open for applications yet' });
        }
      }

      if (!campaignExists) {
        return res.status(404).json({ success: false, error: 'Campaign not found' });
      }

      let creatorRecord: any = null;
      try {
        const cRows: any = await dbQuery(
          'SELECT id, name, username, avatar, primary_category, current_city, followers, avg_views FROM creators WHERE id = ? OR user_id = ? LIMIT 1',
          [effectiveCreatorId, effectiveCreatorId]
        );
        if (Array.isArray(cRows) && cRows.length > 0) {
          creatorRecord = cRows[0];
        } else {
          const uRows: any = await dbQuery('SELECT id, name, avatar FROM users WHERE id = ? LIMIT 1', [effectiveCreatorId]);
          if (Array.isArray(uRows) && uRows.length > 0) {
            creatorRecord = uRows[0];
          }
        }
      } catch (e) {
        console.warn('Creator relational lookup error:', e);
      }

      if (!creatorRecord) {
        creatorRecord = creatorsStore.find((c) => c.id === effectiveCreatorId);
      }

      if (!creatorRecord) {
        return res.status(404).json({ success: false, error: 'Creator profile not found' });
      }

      const finalCreatorId = creatorRecord?.id || effectiveCreatorId;
      const finalCreatorName = creatorRecord?.name || 'Creator';
      const finalCreatorAvatar = creatorRecord?.avatar || '';

      try {
        const existingApp: any = await dbQuery(
          'SELECT id FROM campaign_applicants WHERE campaign_id = ? AND creator_id = ? LIMIT 1',
          [id, finalCreatorId]
        );
        if (Array.isArray(existingApp) && existingApp.length > 0) {
          return res.status(400).json({ success: false, error: 'Already pitched for this campaign brief' });
        }
      } catch (e) {
        console.warn('Check duplicate applicant error:', e);
      }

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

      try {
        await dbQuery(
          `INSERT INTO campaign_applicants (id, campaign_id, creator_id, creator_name, creator_avatar, pitch, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [`app_${Date.now()}`, id, finalCreatorId, finalCreatorName, finalCreatorAvatar, application.pitch, 'Pending']
        );
        await dbQuery('UPDATE campaign_requirements SET applicants_count = applicants_count + 1 WHERE id = ?', [id]);
      } catch (err) {
        console.warn('MySQL applicant insert notice:', err);
        return res.status(500).json({ success: false, error: 'Failed to save application' });
      }

      return res.status(201).json({ success: true, application });
    } catch (error) {
      console.error('applyToCampaign error:', error);
      return res.status(500).json({ success: false, error: 'Failed to apply' });
    }
  }

  export async function updateApplicantStatus(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || (req.user.role !== 'BRAND' && req.user.role !== 'ADMIN' && req.user.role !== 'SALES')) {
        return res.status(403).json({ success: false, error: 'Brand authentication required' });
      }

      const { id, creatorId } = req.params;
      const { status } = req.body;

      if (!['Pending', 'Shortlisted', 'Accepted', 'Declined'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid applicant status' });
      }

      // Ownership check for brands
      if (req.user.role === 'BRAND') {
        const camps: any = await dbQuery('SELECT user_id, email FROM campaign_requirements WHERE id = ? LIMIT 1', [id]);
        if (!Array.isArray(camps) || camps.length === 0) {
          return res.status(404).json({ success: false, error: 'Campaign not found' });
        }
        const camp = camps[0];
        const isOwner =
          camp.user_id === req.user.id ||
          (camp.email && req.user.email && camp.email.toLowerCase() === req.user.email.toLowerCase());
        if (!isOwner) {
          return res.status(403).json({ success: false, error: 'Not authorized for this campaign' });
        }
      }

      const campaign = campaignsStore.find((c) => c.id === id);
      if (campaign && campaign.applicants) {
        const applicant = campaign.applicants.find((a) => a.creatorId === creatorId);
        if (applicant) {
          applicant.status = status;
        }
      }

      await dbQuery(
        `UPDATE campaign_applicants SET status = ? WHERE campaign_id = ? AND creator_id = ?`,
        [status, id, creatorId]
      );

      return res.json({ success: true, status });
    } catch (error) {
      console.error('updateApplicantStatus error:', error);
      return res.status(500).json({ success: false, error: 'Failed to update applicant status' });
    }
  }

  /** Admin approve a pending campaign */
  export async function approveCampaign(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, error: 'Admin authentication required' });
      }
      const { id } = req.params;
      await dbQuery(`UPDATE campaign_requirements SET approval_status = 'approved', status = 'Open' WHERE id = ?`, [id]);
      const rows: any = await dbQuery('SELECT * FROM campaign_requirements WHERE id = ? LIMIT 1', [id]);
      const campaign = rows[0] ? mapCampaignRow(rows[0]) : null;
      return res.json({ success: true, campaign });
    } catch (error) {
      console.error('approveCampaign error:', error);
      return res.status(500).json({ success: false, error: 'Failed to approve campaign' });
    }
  }

  /** Admin reject a pending campaign */
  export async function rejectCampaign(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({ success: false, error: 'Admin authentication required' });
      }
      const { id } = req.params;
      await dbQuery(`UPDATE campaign_requirements SET approval_status = 'rejected', status = 'Closed' WHERE id = ?`, [id]);
      const rows: any = await dbQuery('SELECT * FROM campaign_requirements WHERE id = ? LIMIT 1', [id]);
      const campaign = rows[0] ? mapCampaignRow(rows[0]) : null;
      return res.json({ success: true, campaign });
    } catch (error) {
      console.error('rejectCampaign error:', error);
      return res.status(500).json({ success: false, error: 'Failed to reject campaign' });
    }
  }
