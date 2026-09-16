import { Request, Response } from 'express';
import { dbQuery } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

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
    industry: row.industry || '',
    city: row.city || '',
    contactPerson: row.contact_person || '',
    phone: row.phone || '',
    email: row.email || '',
    approvalStatus: row.approval_status || 'pending',
    rejectionReason: row.rejection_reason || '',
    isFeatured: Boolean(row.is_featured),
    createdAt: row.created_at || new Date().toISOString(),
  };
}

// =============================================
// GET /api/brands/profile  (authenticated brand)
// =============================================
export async function getBrandProfile(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const userId = req.user.id;

    // Try MySQL
    const rows = await dbQuery('SELECT * FROM brand_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (rows && rows.length > 0) {
      return res.json({ success: true, profile: mapDbRowToBrandProfile(rows[0]) });
    }

    // Fallback: memory
    const memProfile = brandProfilesStore.find(p => p.userId === userId);
    if (memProfile) return res.json({ success: true, profile: memProfile });

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
      industry,
      city,
      contactPerson,
      phone,
      email,
    } = req.body;

    if (!brandName) return res.status(400).json({ success: false, error: 'Brand name is required' });

    // Check if profile already exists
    const existing = await dbQuery('SELECT id FROM brand_profiles WHERE user_id = ? LIMIT 1', [userId]);
    if (existing && existing.length > 0) {
      return res.status(409).json({ success: false, error: 'Brand profile already exists. Use PUT to update.' });
    }

    const id = `bp_${Date.now()}`;
    const profile = {
      id,
      userId,
      brandName,
      gstNumber: gstNumber || '',
      logoUrl: logoUrl || '',
      coverUrl: coverUrl || '',
      description: description || '',
      website: website || '',
      industry: industry || '',
      city: city || '',
      contactPerson: contactPerson || '',
      phone: phone || '',
      email: email || req.user.email || '',
      approvalStatus: 'pending' as const,
      rejectionReason: '',
      isFeatured: false,
      createdAt: new Date().toISOString(),
    };

    brandProfilesStore.unshift(profile);

    await dbQuery(
      `INSERT INTO brand_profiles (id, user_id, brand_name, gst_number, logo_url, cover_url, description, website, industry, city, contact_person, phone, email, approval_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [id, userId, brandName, gstNumber || null, logoUrl || null, coverUrl || null, description || null, website || null, industry || null, city || null, contactPerson || null, phone || null, email || null]
    ).catch(err => console.warn('MySQL brand profile insert notice:', err));

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
      industry,
      city,
      contactPerson,
      phone,
      email,
    } = req.body;

    if (!brandName) return res.status(400).json({ success: false, error: 'Brand name is required' });

    // Check if profile exists
    const existing = await dbQuery('SELECT * FROM brand_profiles WHERE user_id = ? LIMIT 1', [userId]);

    if (!existing || existing.length === 0) {
      // Auto-create if not exists
      return createBrandProfile(req, res);
    }

    // Update in MySQL
    await dbQuery(
      `UPDATE brand_profiles SET brand_name=?, gst_number=?, logo_url=?, cover_url=?, description=?, website=?, industry=?, city=?, contact_person=?, phone=?, email=? WHERE user_id=?`,
      [brandName, gstNumber || null, logoUrl || null, coverUrl || null, description || null, website || null, industry || null, city || null, contactPerson || null, phone || null, email || null, userId]
    ).catch(err => console.warn('MySQL brand profile update notice:', err));

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
      SELECT bp.*, u.name as user_name, u.email as user_email, u.phone as user_phone, u.company_name
      FROM brand_profiles bp
      JOIN users u ON u.id = bp.user_id
    `;
    const params: any[] = [];

    if (statusFilter !== 'all') {
      sql += ' WHERE bp.approval_status = ?';
      params.push(statusFilter);
    }

    sql += ' ORDER BY bp.created_at DESC';

    const rows = await dbQuery(sql, params);

    if (rows) {
      const profiles = rows.map((r: any) => ({
        ...mapDbRowToBrandProfile(r),
        userName: r.user_name,
        userEmail: r.user_email,
        userPhone: r.user_phone,
        companyName: r.company_name,
      }));
      return res.json({ success: true, brands: profiles });
    }

    // Fallback: memory
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

    await dbQuery(
      `UPDATE brand_profiles SET approval_status = ?, rejection_reason = ? WHERE id = ?`,
      [newStatus, rejectionReason || null, id]
    ).catch(err => console.warn('MySQL brand approval update notice:', err));

    // Update memory
    const memIdx = brandProfilesStore.findIndex(p => p.id === id);
    if (memIdx >= 0) {
      brandProfilesStore[memIdx].approvalStatus = newStatus;
      brandProfilesStore[memIdx].rejectionReason = rejectionReason || '';
    }

    res.json({ success: true, id, approvalStatus: newStatus });
  } catch (error) {
    console.error('adminApproveBrand error:', error);
    res.status(500).json({ success: false, error: 'Failed to update brand approval status' });
  }
}

// =============================================
// GET /api/brands/featured  (public: approved featured brands)
// =============================================
export async function getFeaturedBrands(req: Request, res: Response) {
  try {
    const rows = await dbQuery(
      `SELECT * FROM brand_profiles WHERE approval_status = 'approved' ORDER BY is_featured DESC, created_at DESC LIMIT 12`
    );

    if (rows && rows.length > 0) {
      return res.json({ success: true, brands: rows.map(mapDbRowToBrandProfile) });
    }

    // Fallback: memory
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
