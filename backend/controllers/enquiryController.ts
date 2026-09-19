import { Response } from 'express';
import { dbQuery } from '../config/db';
import { EnquiryLead } from '../types';
import { creatorsStore } from './creatorController';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { validateWhatsAppNumber } from '../utils/validation';

function mapEnquiry(r: any): EnquiryLead {
  return {
    id: r.id,
    creatorId: r.creator_id,
    creatorName: r.creator_name,
    creatorUsername: r.creator_username,
    creatorAvatar: r.creator_avatar || '',
    brandName: r.brand_name,
    contactPerson: r.contact_person,
    email: r.email,
    phone: r.phone || '',
    campaignType: r.campaign_type,
    campaignDescription: r.campaign_description || '',
    city: r.city,
    budget: r.budget,
    influencersRequired: Number(r.influencers_required) || 1,
    preferredDate: r.preferred_date || 'Upcoming',
    message: r.message || '',
    status: r.status || 'New',
    assignedTeamMember: r.assigned_team_member || undefined,
    creatorReply: r.creator_reply || undefined,
    createdAt: r.created_at
      ? new Date(r.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
      : 'Just now',
    isReadByCreator: Boolean(r.is_read_by_creator),
  };
}

export async function getEnquiries(req: AuthenticatedRequest, res: Response) {
  try {
    const { creatorId } = req.query;
    let sql = 'SELECT * FROM enquiry_leads WHERE 1=1';
    const params: any[] = [];

    if (req.user?.role === 'CREATOR') {
      sql += ' AND (creator_id = ? OR creator_id IN (SELECT id FROM creators WHERE user_id = ?))';
      params.push(req.user.id, req.user.id);
    } else if (req.user?.role === 'BRAND') {
      sql += ' AND (email = ? OR brand_name = ? OR brand_name IN (SELECT brand_name FROM brand_profiles WHERE user_id = ?))';
      params.push(req.user.email || '', req.user.name || '', req.user.id);
    } else if (!(req.user?.role === 'ADMIN' || req.user?.role === 'SALES')) {
      // unauthenticated: allow filter by creatorId only for limited public? Prefer auth.
      if (creatorId) {
        sql += ' AND creator_id = ?';
        params.push(String(creatorId));
      } else {
        return res.status(401).json({ success: false, error: 'Authentication required' });
      }
    }

    if (creatorId && (req.user?.role === 'ADMIN' || req.user?.role === 'SALES')) {
      sql += ' AND creator_id = ?';
      params.push(String(creatorId));
    }

    sql += ' ORDER BY created_at DESC';
    const rows: any = await dbQuery(sql, params);
    const enquiries = Array.isArray(rows) ? rows.map(mapEnquiry) : [];
    return res.json({ success: true, total: enquiries.length, enquiries });
  } catch (error) {
    console.error('getEnquiries error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch enquiries' });
  }
}

export async function createEnquiry(req: AuthenticatedRequest, res: Response) {
  try {
    const data = req.body;
    if (!data.creatorId || !data.brandName || !data.email) {
      return res.status(400).json({ success: false, error: 'Missing required enquiry details' });
    }

    if (data.phone) {
      const phoneCheck = validateWhatsAppNumber(data.phone);
      if (!phoneCheck.ok) {
        return res.status(400).json({ success: false, error: phoneCheck.error });
      }
      data.phone = phoneCheck.normalized;
    }

    let creatorName = data.creatorName || 'Influencer';
    let creatorUsername = data.creatorUsername || 'creator';
    let creatorAvatar = data.creatorAvatar || '';
    try {
      const cRows: any = await dbQuery(
        'SELECT id, name, username, avatar FROM creators WHERE id = ? OR user_id = ? LIMIT 1',
        [data.creatorId, data.creatorId]
      );
      if (Array.isArray(cRows) && cRows.length > 0) {
        creatorName = cRows[0].name || creatorName;
        creatorUsername = cRows[0].username || creatorUsername;
        creatorAvatar = cRows[0].avatar || creatorAvatar;
      } else {
        const mem = creatorsStore.find((c) => c.id === data.creatorId);
        if (mem) {
          creatorName = mem.name;
          creatorUsername = mem.username;
          creatorAvatar = mem.avatar || '';
        }
      }
    } catch {
      // ignore
    }

    const trackingId = `SC-ENQ-${Math.floor(100000 + Math.random() * 900000)}`;

    await dbQuery(
      `INSERT INTO enquiry_leads (
        id, creator_id, creator_name, creator_username, creator_avatar, brand_name, contact_person,
        email, phone, campaign_type, campaign_description, city, budget, influencers_required,
        preferred_date, message, status, is_read_by_creator
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', FALSE)`,
      [
        trackingId,
        data.creatorId,
        creatorName,
        creatorUsername,
        creatorAvatar,
        data.brandName,
        data.contactPerson || data.brandName,
        data.email,
        data.phone || '',
        data.campaignType || 'Instagram Reel Deliverable',
        data.campaignDescription || data.message || '',
        data.city || 'Delhi NCR',
        data.budget || '₹10,000',
        data.influencersRequired || 1,
        data.preferredDate || 'Next 2 Weeks',
        data.message || '',
      ]
    );

    const newEnquiry = mapEnquiry({
      id: trackingId,
      creator_id: data.creatorId,
      creator_name: creatorName,
      creator_username: creatorUsername,
      creator_avatar: creatorAvatar,
      brand_name: data.brandName,
      contact_person: data.contactPerson || data.brandName,
      email: data.email,
      phone: data.phone || '',
      campaign_type: data.campaignType || 'Instagram Reel Deliverable',
      campaign_description: data.campaignDescription || data.message || '',
      city: data.city || 'Delhi NCR',
      budget: data.budget || '₹10,000',
      influencers_required: data.influencersRequired || 1,
      preferred_date: data.preferredDate || 'Next 2 Weeks',
      message: data.message || '',
      status: 'New',
      is_read_by_creator: false,
      created_at: new Date(),
    });

    res.status(201).json({ success: true, enquiry: newEnquiry, trackingId });
  } catch (error) {
    console.error('createEnquiry error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit enquiry' });
  }
}

export async function updateEnquiryStatus(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { id } = req.params;
    const rows: any = await dbQuery('SELECT * FROM enquiry_leads WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Enquiry not found' });
    }
    const enquiry = rows[0];

    const isCreator =
      req.user.role === 'CREATOR' &&
      (enquiry.creator_id === req.user.id ||
        (await dbQuery('SELECT id FROM creators WHERE user_id = ? AND id = ?', [req.user.id, enquiry.creator_id]).then(
          (r: any) => Array.isArray(r) && r.length > 0
        )));
    const isBrand =
      req.user.role === 'BRAND' &&
      (enquiry.email?.toLowerCase() === req.user.email?.toLowerCase() || enquiry.brand_name === req.user.name);
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SALES';

    if (!isCreator && !isBrand && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this enquiry' });
    }

    const status = req.body.status ?? enquiry.status;
    const creatorReply = req.body.creatorReply !== undefined ? req.body.creatorReply : enquiry.creator_reply;
    const isRead =
      req.body.isReadByCreator !== undefined ? Boolean(req.body.isReadByCreator) : true;

    await dbQuery(
      `UPDATE enquiry_leads SET status = ?, creator_reply = ?, is_read_by_creator = ?, assigned_team_member = COALESCE(?, assigned_team_member) WHERE id = ?`,
      [status, creatorReply || null, isRead, req.body.assignedTeamMember ?? null, id]
    );

    const updated = mapEnquiry({
      ...enquiry,
      status,
      creator_reply: creatorReply,
      is_read_by_creator: isRead,
      assigned_team_member: req.body.assignedTeamMember ?? enquiry.assigned_team_member,
    });

    res.json({ success: true, enquiry: updated });
  } catch (error) {
    console.error('updateEnquiryStatus error:', error);
    res.status(500).json({ success: false, error: 'Failed to update enquiry' });
  }
}
