import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { dbQuery, dbQueryStrict } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { validateOptionalUrl } from '../utils/validation';

// In-memory fallback store for brand profiles
let brandProfilesStore: any[] = [];

function mapDbRowToBrandProfile(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    brandName: row.brand_name,
    gstNumber: row.gst_number || '',
    logoUrl: row.logo_url || '',
    coverUrl: row.cover_url || '',
    description: row.description || '',
    website: row.website || '',
    facebookUrl: row.facebook_url || '',
    instagramUrl: row.instagram_url || '',
    youtubeUrl: row.youtube_url || '',
    linkedinUrl: row.linkedin_url || '',
    twitterUrl: row.twitter_url || '',
    industry: row.industry || '',
    city: row.city || '',
    contactPerson: row.contact_person || '',
    phone: row.phone || '',
    email: row.email || '',
    approvalStatus: row.approval_status || 'pending',
    rejectionReason: row.rejection_reason || '',
    isFeatured: Boolean(row.is_featured),
    totalHiringCount: row.total_hiring_count || 0,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function resolveBrandApprovalStatus(profileStatus?: string | null, userStatus?: string | null) {
  if (profileStatus === 'pending' || userStatus === 'pending' || (!profileStatus && !userStatus)) {
    return 'pending';
  }
  return profileStatus || userStatus || 'pending';
}

function mapAdminBrandRow(r: any) {
  return {
    id: r.bp_id || `temp_${r.user_id}`,
    userId: r.user_id,
    brandName: r.brand_name || r.company_name || r.user_name,
    gstNumber: r.gst_number || '',
    logoUrl: r.logo_url || '',
    coverUrl: r.cover_url || '',
    description: r.description || '',
    website: r.website || '',
    industry: r.industry || '',
    city: r.city || '',
    contactPerson: r.contact_person || r.user_name,
    phone: r.user_phone || r.phone || '',
    email: r.user_email || r.email || '',
    approvalStatus: resolveBrandApprovalStatus(r.bp_approval_status, r.user_approval_status),
    rejectionReason: r.rejection_reason || '',
    isFeatured: Boolean(r.is_featured),
    createdAt: r.created_at || new Date().toISOString(),
    userName: r.user_name,
    userEmail: r.user_email,
    userPhone: r.user_phone,
    companyName: r.company_name,
  };
}

export async function ensurePendingBrandProfile(opts: {
  userId: string;
  brandName?: string;
  gstNumber?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
}) {
  const existing = await dbQuery('SELECT id FROM brand_profiles WHERE user_id = ? LIMIT 1', [opts.userId]);
  if (existing && existing.length > 0) return existing[0].id;

  const id = `bp_${Date.now()}`;
  const brandName = (opts.brandName || opts.contactPerson || 'New Brand').trim();
  const profile = {
    id,
    userId: opts.userId,
    brandName,
    gstNumber: opts.gstNumber || '',
    logoUrl: '',
    coverUrl: '',
    description: '',
    website: '',
    facebookUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    linkedinUrl: '',
    industry: '',
    city: '',
    contactPerson: opts.contactPerson || '',
    phone: opts.phone || '',
    email: opts.email || '',
    approvalStatus: 'pending' as const,
    rejectionReason: '',
    isFeatured: false,
    createdAt: new Date().toISOString(),
  };
  brandProfilesStore.unshift(profile);

  await dbQuery(
    `INSERT INTO brand_profiles (id, user_id, brand_name, gst_number, contact_person, phone, email, approval_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [id, opts.userId, brandName, opts.gstNumber || null, opts.contactPerson || null, opts.phone || null, opts.email || null]
  );
  await dbQuery(
    `UPDATE users SET approval_status = 'pending' WHERE id = ? AND (approval_status IS NULL OR approval_status = '')`,
    [opts.userId]
  );
  return id;
}

// =============================================
// GET /api/brands/profile  (authenticated brand)
// =============================================
export async function getBrandProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const userId = req.user.id;

    // Try MySQL brand_profiles table
    const rows = await dbQuery('SELECT * FROM brand_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (rows && rows.length > 0) {
      const profile = mapDbRowToBrandProfile(rows[0]);

      // The company name remains available on users; GST is stored only in brand_profiles.
      if (!profile.brandName) {
        const userRows = await dbQuery('SELECT company_name FROM users WHERE id = ? LIMIT 1', [userId]);
        if (userRows && userRows.length > 0) {
          profile.brandName = profile.brandName || userRows[0].company_name || '';
        }
      }

      return res.json({ success: true, profile });
    }

    // Fallback: memory
    const memProfile = brandProfilesStore.find(p => p.userId === userId);
    if (memProfile) return res.json({ success: true, profile: memProfile });

    // No brand_profile yet — build a prefilled profile from users table
    const userRows = await dbQuery('SELECT name, company_name, approval_status FROM users WHERE id = ? LIMIT 1', [userId]);
    if (userRows && userRows.length > 0) {
      const u = userRows[0];
      return res.json({
        success: true,
        profile: {
          id: null,
          userId,
          brandName: u.company_name || '',
          gstNumber: '',
          contactPerson: u.name || '',
          approvalStatus: u.approval_status || 'pending',
          logoUrl: '', coverUrl: '', description: '', website: '',
          facebookUrl: '', instagramUrl: '', youtubeUrl: '', linkedinUrl: '',
          industry: '', city: '', phone: '', email: '',
        }
      });
    }

    return res.json({ success: true, profile: null });
  } catch (error) {
    console.error('getBrandProfile error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch brand profile' });
  }
}

// =============================================
// POST /api/brands/profile  (create brand profile)
// =============================================
export async function createBrandProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (req.user.role !== 'BRAND') return res.status(403).json({ success: false, error: 'Only brand accounts can create brand profiles' });

    const userId = req.user.id;
    const {
      brandName,
      gstNumber,
      logoUrl,
      coverUrl,
      description,
      website,
      facebookUrl,
      instagramUrl,
      youtubeUrl,
      linkedinUrl,
      industry,
      city,
      contactPerson,
      phone,
      email,
    } = req.body;

    if (!brandName) return res.status(400).json({ success: false, error: 'Brand name is required' });

    for (const [label, value] of [
      ['Website', website],
      ['Facebook', facebookUrl],
      ['Instagram', instagramUrl],
      ['YouTube', youtubeUrl],
      ['LinkedIn', linkedinUrl],
    ] as Array<[string, string | undefined]>) {
      const check = validateOptionalUrl(value, label);
      if (!check.ok) return res.status(400).json({ success: false, error: check.error });
    }

    // Check if profile already exists
    const existing = await dbQueryStrict('SELECT id FROM brand_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (existing && existing.length > 0) {
      return res.status(409).json({ success: false, error: 'Brand profile already exists. Use PUT to update.' });
    }

    const id = `bp_${randomUUID().replace(/-/g, '').slice(0, 12)}`;
    const approvalStatus = 'pending';
    const profile = {
      id,
      userId,
      brandName,
      gstNumber: gstNumber || '',
      logoUrl: logoUrl || '',
      coverUrl: coverUrl || '',
      description: description || '',
      website: website || '',
      facebookUrl: facebookUrl || '',
      instagramUrl: instagramUrl || '',
      youtubeUrl: youtubeUrl || '',
      linkedinUrl: linkedinUrl || '',
      industry: industry || '',
      city: city || '',
      contactPerson: contactPerson || '',
      phone: phone || '',
      email: email || req.user.email || '',
      approvalStatus,
      rejectionReason: '',
      isFeatured: false,
      createdAt: new Date().toISOString(),
    };

    brandProfilesStore.unshift(profile as any);

    await dbQueryStrict(
      `INSERT INTO brand_profiles (id, user_id, brand_name, gst_number, logo_url, cover_url, description, website, facebook_url, instagram_url, youtube_url, linkedin_url, industry, city, contact_person, phone, email, approval_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, brandName, gstNumber || null, logoUrl || null, coverUrl || null, description || null, website || null, facebookUrl || null, instagramUrl || null, youtubeUrl || null, linkedinUrl || null, industry || null, city || null, contactPerson || null, phone || null, email || null, approvalStatus]
    );
    await dbQueryStrict(`UPDATE users SET approval_status = 'pending' WHERE id = ?`, [userId]);

    res.status(201).json({ success: true, profile });
  } catch (error) {
    console.error('createBrandProfile error:', error);
    res.status(500).json({ success: false, error: 'Failed to create brand profile' });
  }
}

// =============================================
// PUT /api/brands/profile  (update brand profile)
// =============================================
export async function updateBrandProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });
    if (req.user.role !== 'BRAND') return res.status(403).json({ success: false, error: 'Only brand accounts can update brand profiles' });

    const userId = req.user.id;
    const {
      brandName,
      gstNumber,
      logoUrl,
      coverUrl,
      description,
      website,
      facebookUrl,
      instagramUrl,
      youtubeUrl,
      linkedinUrl,
      industry,
      city,
      contactPerson,
      phone,
      email,
    } = req.body;

    if (!brandName) return res.status(400).json({ success: false, error: 'Brand name is required' });

    for (const [label, value] of [
      ['Website', website],
      ['Facebook', facebookUrl],
      ['Instagram', instagramUrl],
      ['YouTube', youtubeUrl],
      ['LinkedIn', linkedinUrl],
    ] as Array<[string, string | undefined]>) {
      const check = validateOptionalUrl(value, label);
      if (!check.ok) return res.status(400).json({ success: false, error: check.error });
    }

    // Check if profile exists
    const existing = await dbQueryStrict('SELECT * FROM brand_profiles WHERE user_id = ? LIMIT 1', [userId]);

    if (!existing || existing.length === 0) {
      // Auto-create if not exists
      return createBrandProfile(req, res);
    }

    // Update in MySQL
    await dbQueryStrict(
      `UPDATE brand_profiles SET brand_name=?, gst_number=?, logo_url=?, cover_url=?, description=?, website=?, facebook_url=?, instagram_url=?, youtube_url=?, linkedin_url=?, industry=?, city=?, contact_person=?, phone=?, email=? WHERE user_id=?`,
      [brandName, gstNumber || null, logoUrl || null, coverUrl || null, description || null, website || null, facebookUrl || null, instagramUrl || null, youtubeUrl || null, linkedinUrl || null, industry || null, city || null, contactPerson || null, phone || null, email || null, userId]
    );

    // Update in memory
    const memIdx = brandProfilesStore.findIndex(p => p.userId === userId);
    const updatedProfile = {
      ...(memIdx >= 0 ? brandProfilesStore[memIdx] : mapDbRowToBrandProfile(existing[0])),
      brandName,
      gstNumber: gstNumber || '',
      logoUrl: logoUrl || '',
      coverUrl: coverUrl || '',
      description: description || '',
      website: website || '',
      facebookUrl: facebookUrl || '',
      instagramUrl: instagramUrl || '',
      youtubeUrl: youtubeUrl || '',
      linkedinUrl: linkedinUrl || '',
      industry: industry || '',
      city: city || '',
      contactPerson: contactPerson || '',
      phone: phone || '',
      email: email || '',
    };

    if (memIdx >= 0) {
      brandProfilesStore[memIdx] = updatedProfile;
    } else {
      brandProfilesStore.unshift(updatedProfile);
    }

    res.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error('updateBrandProfile error:', error);
    res.status(500).json({ success: false, error: 'Failed to update brand profile' });
  }
}

// =============================================
// GET /api/admin/brands  (list all brands for admin)
// =============================================
export async function adminListBrands(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SALES')) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const statusFilter = (req.query.status as string) || 'all';
    let sql = `
      SELECT 
        u.id as user_id, u.name as user_name, u.email as user_email, u.phone as user_phone, u.company_name, u.approval_status as user_approval_status, u.created_at as user_created_at,
        bp.id as bp_id, bp.brand_name, bp.gst_number, bp.logo_url, bp.cover_url, bp.description, bp.website, bp.industry, bp.city, bp.contact_person, bp.approval_status as bp_approval_status, bp.rejection_reason, bp.is_featured, COALESCE(bp.created_at, u.created_at) as created_at
      FROM users u
      LEFT JOIN brand_profiles bp ON u.id = bp.user_id
      WHERE u.role = 'BRAND'
    `;
    const params: any[] = [];

    if (statusFilter !== 'all') {
      sql += ' AND (bp.approval_status = ? OR u.approval_status = ? OR (bp.id IS NULL AND COALESCE(u.approval_status, ?) = ?))';
      params.push(statusFilter, statusFilter, statusFilter, statusFilter);
    }

    sql += ` ORDER BY CASE
      WHEN COALESCE(bp.approval_status, u.approval_status, 'pending') = 'pending' THEN 0
      ELSE 1
    END, COALESCE(bp.created_at, u.created_at) DESC`;

    let rows = await dbQuery(sql, params);
    if (!rows) {
      rows = await dbQuery(
        `SELECT id as user_id, name as user_name, email as user_email, phone as user_phone, company_name,
                approval_status as user_approval_status, created_at, created_at as user_created_at
         FROM users WHERE role = 'BRAND' ORDER BY created_at DESC`
      );
    }

    if (rows && rows.length >= 0) {
      const profiles = rows.map(mapAdminBrandRow);
      const seen = new Set(profiles.map((p: any) => p.userId));
      for (const mem of brandProfilesStore) {
        if (!seen.has(mem.userId)) {
          profiles.push(mem);
          seen.add(mem.userId);
        }
      }
      profiles.sort((a: any, b: any) => {
        const ap = a.approvalStatus === 'pending' ? 0 : 1;
        const bp = b.approvalStatus === 'pending' ? 0 : 1;
        if (ap !== bp) return ap - bp;
        return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
      });
      return res.json({ success: true, brands: profiles });
    }

    const filtered = statusFilter === 'all'
      ? brandProfilesStore
      : brandProfilesStore.filter(p => p.approvalStatus === statusFilter);
    res.json({ success: true, brands: filtered });
  } catch (error) {
    console.error('adminListBrands error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch brands' });
  }
}

// =============================================
// PATCH /api/admin/brands/:id/approve
// =============================================
export async function adminApproveBrand(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SALES')) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const { id } = req.params;
    const { action, rejectionReason } = req.body; // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Action must be approve or reject' });
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    // 1. Update brand_profiles table if it exists
    if (!id.startsWith('temp_')) {
      await dbQuery(
        `UPDATE brand_profiles SET approval_status = ?, rejection_reason = ? WHERE id = ?`,
        [newStatus, rejectionReason || null, id]
      ).catch(err => console.warn('MySQL brand approval update notice:', err));
    }

    // 2. Crucial Fix: Update the users table so the login session (authUser) knows the brand is approved
    let updateUserId = id.startsWith('temp_') ? id.replace('temp_', '') : null;
    
    if (!updateUserId) {
      const bp = await dbQuery('SELECT user_id FROM brand_profiles WHERE id = ?', [id]);
      if (bp && bp.length > 0) updateUserId = bp[0].user_id;
    }

    if (updateUserId) {
       await dbQuery('UPDATE users SET approval_status = ? WHERE id = ?', [newStatus, updateUserId]);
    }

    // Update memory
    const memIdx = brandProfilesStore.findIndex(p => p.id === id);
    if (memIdx >= 0) {
      brandProfilesStore[memIdx].approvalStatus = newStatus;
      brandProfilesStore[memIdx].rejectionReason = rejectionReason || '';
    } else if (updateUserId) {
      const memUserIdx = brandProfilesStore.findIndex(p => p.userId === updateUserId);
      if (memUserIdx >= 0) {
        brandProfilesStore[memUserIdx].approvalStatus = newStatus;
        brandProfilesStore[memUserIdx].rejectionReason = rejectionReason || '';
      }
    }

    res.json({ success: true, id, approvalStatus: newStatus });
  } catch (error) {
    console.error('adminApproveBrand error:', error);
    res.status(500).json({ success: false, error: 'Failed to update brand approval status' });
  }
}

// =============================================
// DELETE /api/admin/brands/:id  (admin delete brand user)
// =============================================
export async function adminDeleteBrand(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SALES')) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const { id } = req.params; // this could be brand profile id or user id if temp_
    
    // Determine user_id to delete
    let userIdToDelete = id.startsWith('temp_') ? id.replace('temp_', '') : null;
    
    if (!userIdToDelete) {
      const bp = await dbQuery('SELECT user_id FROM brand_profiles WHERE id = ?', [id]);
      if (bp && bp.length > 0) userIdToDelete = bp[0].user_id;
    }

    if (userIdToDelete) {
      // Deleting the user will cascade delete brand_profiles
      await dbQuery('DELETE FROM users WHERE id = ?', [userIdToDelete]);
      
      // Also remove from memory
      const memIdx = brandProfilesStore.findIndex(p => p.userId === userIdToDelete);
      if (memIdx >= 0) brandProfilesStore.splice(memIdx, 1);
      
      return res.json({ success: true, message: 'Brand deleted successfully' });
    }
    
    res.status(404).json({ success: false, error: 'Brand not found' });
  } catch (error) {
    console.error('adminDeleteBrand error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete brand' });
  }
}

export async function getFeaturedBrands(req: Request, res: Response) {
  try {
    const rows = await dbQuery(
      `SELECT 
        COALESCE(bp.id, CONCAT('usr_', u.id)) as id,
        u.id as user_id,
        COALESCE(bp.brand_name, u.company_name, u.name) as brand_name,
        bp.gst_number,
        COALESCE(bp.logo_url, u.avatar, '') as logo_url,
        bp.cover_url,
        COALESCE(bp.description, CONCAT('Verified partner brand hiring creators on thebrandsstory.')) as description,
        bp.website,
        bp.facebook_url,
        bp.instagram_url,
        bp.youtube_url,
        bp.linkedin_url,
        bp.twitter_url,
        COALESCE(bp.industry, 'Brand Partner') as industry,
        COALESCE(bp.city, 'Pan India') as city,
        bp.contact_person,
        bp.phone,
        u.email,
        COALESCE(bp.approval_status, u.approval_status) as approval_status,
        COALESCE(bp.is_featured, 1) as is_featured,
        (SELECT COALESCE(SUM(male_count + female_count), 0) FROM campaign_requirements cr WHERE cr.user_id = u.id) as total_hiring_count,
        u.created_at
      FROM users u
      LEFT JOIN brand_profiles bp ON u.id = bp.user_id
      WHERE u.role = 'BRAND' AND (u.approval_status = 'approved' OR bp.approval_status = 'approved')
      ORDER BY is_featured DESC, u.created_at DESC
      LIMIT 16`
    );

    if (rows && rows.length > 0) {
      return res.json({ success: true, brands: rows.map(mapDbRowToBrandProfile) });
    }

    // Fallback: memory store approved brands
    const approved = brandProfilesStore.filter(p => p.approvalStatus === 'approved');
    res.json({ success: true, brands: approved });
  } catch (error) {
    console.error('getFeaturedBrands error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch featured brands' });
  }
}

// =============================================
// GET /api/admin/campaigns/pending  (admin: campaigns pending approval)
// =============================================
export async function adminGetPendingCampaigns(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SALES')) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const rows = await dbQuery(
      `SELECT * FROM campaign_requirements WHERE approval_status = 'pending' ORDER BY created_at DESC`
    );

    if (rows) {
      const campaigns = rows.map((r: any) => ({
        id: r.id,
        companyName: r.company_name,
        contactPerson: r.contact_person,
        email: r.email,
        phone: r.phone || '',
        industry: r.industry || 'General',
        campaignTitle: r.campaign_title,
        campaignDescription: r.campaign_description,
        city: r.city,
        budget: r.budget,
        category: r.category,
        collaborationType: r.collaboration_type,
        approvalStatus: r.approval_status || 'pending',
        createdAt: r.created_at,
      }));
      return res.json({ success: true, campaigns });
    }

    res.json({ success: true, campaigns: [] });
  } catch (error) {
    console.error('adminGetPendingCampaigns error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch pending campaigns' });
  }
}

// =============================================
// PATCH /api/admin/campaigns/:id/approve
// =============================================
export async function adminApproveCampaign(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'SALES')) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const { id } = req.params;
    const { action } = req.body; // 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Action must be approve or reject' });
    }

    const newApprovalStatus = action === 'approve' ? 'approved' : 'rejected';
    const newStatus = action === 'approve' ? 'Open' : 'In Review';

    await dbQuery(
      `UPDATE campaign_requirements SET approval_status = ?, status = ? WHERE id = ?`,
      [newApprovalStatus, newStatus, id]
    ).catch(err => console.warn('MySQL campaign approval update notice:', err));

    res.json({ success: true, id, approvalStatus: newApprovalStatus, status: newStatus });
  } catch (error) {
    console.error('adminApproveCampaign error:', error);
    res.status(500).json({ success: false, error: 'Failed to update campaign approval status' });
  }
}
