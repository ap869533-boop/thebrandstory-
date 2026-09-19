import { Response } from 'express';
import { dbQuery } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

function mapInquiry(r: any) {
  return {
    id: r.id,
    creatorId: r.creator_id,
    creatorName: r.creator_name,
    creatorAvatar: r.creator_avatar || '',
    brandId: r.brand_id,
    brandName: r.brand_name,
    campaignId: r.campaign_id || null,
    message: r.message,
    status: r.status || 'New',
    conversationId: r.conversation_id || null,
    createdAt: r.created_at
      ? new Date(r.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
      : 'Just now',
  };
}

export async function getBrandInquiries(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { brandId, creatorId } = req.query;
    let sql = 'SELECT * FROM brand_inquiries WHERE 1=1';
    const params: any[] = [];

    if (req.user.role === 'BRAND') {
      sql += ' AND (brand_id = ? OR brand_id IN (SELECT id FROM brand_profiles WHERE user_id = ?))';
      params.push(req.user.id, req.user.id);
      if (brandId) {
        // Extra filter only if it still belongs to this brand
        sql += ' AND brand_id = ?';
        params.push(String(brandId));
      }
    } else if (req.user.role === 'CREATOR') {
      sql += ' AND (creator_id = ? OR creator_id IN (SELECT id FROM creators WHERE user_id = ?))';
      params.push(req.user.id, req.user.id);
      if (creatorId) {
        sql += ' AND creator_id = ?';
        params.push(String(creatorId));
      }
    } else if (req.user.role === 'ADMIN' || req.user.role === 'SALES') {
      if (brandId) {
        sql += ' AND brand_id = ?';
        params.push(String(brandId));
      }
      if (creatorId) {
        sql += ' AND creator_id = ?';
        params.push(String(creatorId));
      }
    } else {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }

    sql += ' ORDER BY created_at DESC';
    const rows: any = await dbQuery(sql, params);
    const inquiries = Array.isArray(rows) ? rows.map(mapInquiry) : [];
    return res.json({ success: true, total: inquiries.length, inquiries });
  } catch (error) {
    console.error('getBrandInquiries error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch brand inquiries' });
  }
}

export async function createBrandInquiry(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'CREATOR') {
      return res.status(403).json({ success: false, error: 'Only influencers can submit brand inquiries' });
    }

    const data = req.body;
    if (!data.brandId || !data.brandName || !data.message) {
      return res.status(400).json({ success: false, error: 'Missing required inquiry details' });
    }

    // Resolve creator profile
    let creatorId = data.creatorId || req.user.id;
    let creatorName = data.creatorName || req.user.name;
    let creatorAvatar = data.creatorAvatar || '';
    try {
      const cRows: any = await dbQuery(
        'SELECT id, name, avatar, user_id FROM creators WHERE id = ? OR user_id = ? LIMIT 1',
        [req.user.id, req.user.id]
      );
      if (Array.isArray(cRows) && cRows.length > 0) {
        creatorId = cRows[0].id;
        creatorName = cRows[0].name || creatorName;
        creatorAvatar = cRows[0].avatar || creatorAvatar;
      }
    } catch {
      // keep request values
    }

    // Resolve brand ownership id (prefer brand_profiles.id, also accept user id)
    let brandId = String(data.brandId);
    let brandName = String(data.brandName);
    try {
      const bRows: any = await dbQuery(
        `SELECT bp.id, bp.brand_name, bp.user_id
         FROM brand_profiles bp
         WHERE bp.id = ? OR bp.user_id = ?
         LIMIT 1`,
        [brandId, brandId]
      );
      if (Array.isArray(bRows) && bRows.length > 0) {
        brandId = bRows[0].user_id || bRows[0].id; // store brand user id for panel matching
        brandName = bRows[0].brand_name || brandName;
      }
    } catch {
      // keep provided brandId
    }

    const campaignId = data.campaignId || null;
    if (campaignId) {
      const camps: any = await dbQuery(
        `SELECT id, approval_status FROM campaign_requirements WHERE id = ? LIMIT 1`,
        [campaignId]
      );
      if (!Array.isArray(camps) || camps.length === 0) {
        return res.status(400).json({ success: false, error: 'Invalid campaign ID' });
      }
    }

    // Duplicate check: same creator + brand + campaign (or no campaign)
    try {
      const dupSql = campaignId
        ? `SELECT id FROM brand_inquiries WHERE creator_id = ? AND brand_id = ? AND campaign_id = ? AND status NOT IN ('Declined', 'Archived') LIMIT 1`
        : `SELECT id FROM brand_inquiries WHERE creator_id = ? AND brand_id = ? AND (campaign_id IS NULL OR campaign_id = '') AND status NOT IN ('Declined', 'Archived') LIMIT 1`;
      const dupParams = campaignId ? [creatorId, brandId, campaignId] : [creatorId, brandId];
      const dup: any = await dbQuery(dupSql, dupParams);
      if (Array.isArray(dup) && dup.length > 0) {
        return res.status(400).json({ success: false, error: 'You already submitted an inquiry for this brand' });
      }
    } catch {
      // continue
    }

    const trackingId = `SC-BRAND-INQ-${Math.floor(10000 + Math.random() * 90000)}`;

    await dbQuery(
      `INSERT INTO brand_inquiries (id, creator_id, creator_name, creator_avatar, brand_id, brand_name, campaign_id, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'New')`,
      [trackingId, creatorId, creatorName, creatorAvatar, brandId, brandName, campaignId, String(data.message).trim()]
    );

    const inquiry = {
      id: trackingId,
      creatorId,
      creatorName,
      creatorAvatar,
      brandId,
      brandName,
      campaignId,
      message: String(data.message).trim(),
      status: 'New',
      conversationId: null,
      createdAt: 'Just now',
    };

    res.status(201).json({ success: true, inquiry, trackingId });
  } catch (error) {
    console.error('createBrandInquiry error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit inquiry' });
  }
}

export async function updateBrandInquiryStatus(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'BRAND' && req.user.role !== 'ADMIN' && req.user.role !== 'SALES')) {
      return res.status(403).json({ success: false, error: 'Brand authentication required' });
    }

    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['New', 'Read', 'Confirmed', 'Replied', 'Archived', 'Declined'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const rows: any = await dbQuery('SELECT * FROM brand_inquiries WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Inquiry not found' });
    }
    const inquiry = rows[0];

    if (req.user.role === 'BRAND') {
      const owns =
        inquiry.brand_id === req.user.id ||
        (await dbQuery('SELECT id FROM brand_profiles WHERE user_id = ? AND (id = ? OR user_id = ?)', [
          req.user.id,
          inquiry.brand_id,
          inquiry.brand_id,
        ]).then((r: any) => Array.isArray(r) && r.length > 0));
      // Also allow if brand_id matches user id directly
      const ownsDirect = inquiry.brand_id === req.user.id;
      if (!owns && !ownsDirect) {
        // Check brand profile ownership
        const bp: any = await dbQuery(
          'SELECT id FROM brand_profiles WHERE user_id = ? AND (id = ? OR user_id = ?)',
          [req.user.id, inquiry.brand_id, inquiry.brand_id]
        );
        const bp2: any = await dbQuery(
          'SELECT id FROM brand_profiles WHERE user_id = ? LIMIT 1',
          [req.user.id]
        );
        const brandUserIds = new Set<string>([req.user.id]);
        if (Array.isArray(bp2) && bp2.length > 0) brandUserIds.add(bp2[0].id);
        if (!brandUserIds.has(inquiry.brand_id) && !(Array.isArray(bp) && bp.length > 0)) {
          return res.status(403).json({ success: false, error: 'Not authorized for this inquiry' });
        }
      }
    }

    let conversationId = inquiry.conversation_id || null;

    // On confirm: create conversation if missing
    if (status === 'Confirmed' && !conversationId) {
      conversationId = `conv_${Date.now()}`;
      let creatorUserId: string | null = null;
      try {
        const cRows: any = await dbQuery('SELECT user_id FROM creators WHERE id = ? LIMIT 1', [inquiry.creator_id]);
        if (Array.isArray(cRows) && cRows.length > 0) creatorUserId = cRows[0].user_id || null;
      } catch {
        // ignore
      }

      try {
        await dbQuery(
          `INSERT INTO conversations (id, brand_user_id, creator_id, creator_user_id, campaign_id, inquiry_id, last_message, last_message_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            conversationId,
            req.user.id,
            inquiry.creator_id,
            creatorUserId,
            inquiry.campaign_id || null,
            inquiry.id,
            'Conversation started',
          ]
        );
      } catch (err: any) {
        // Unique conflict: fetch existing
        if (err?.code === 'ER_DUP_ENTRY') {
          const existing: any = await dbQuery(
            `SELECT id FROM conversations WHERE brand_user_id = ? AND creator_id = ? AND (campaign_id <=> ?) LIMIT 1`,
            [req.user.id, inquiry.creator_id, inquiry.campaign_id || null]
          );
          if (Array.isArray(existing) && existing.length > 0) {
            conversationId = existing[0].id;
          }
        } else {
          throw err;
        }
      }
    }

    await dbQuery(
      `UPDATE brand_inquiries SET status = ?, conversation_id = COALESCE(?, conversation_id) WHERE id = ?`,
      [status, conversationId, id]
    );

    return res.json({
      success: true,
      inquiry: {
        ...mapInquiry({ ...inquiry, status, conversation_id: conversationId }),
      },
      conversationId,
    });
  } catch (error) {
    console.error('updateBrandInquiryStatus error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update inquiry' });
  }
}
