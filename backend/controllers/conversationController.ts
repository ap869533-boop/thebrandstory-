import { Response } from 'express';
import { dbQuery } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const ONLINE_THRESHOLD_MS = 90_000;

async function resolveParticipantIds(user: { id: string; role: string }) {
  if (user.role === 'CREATOR') {
    const rows: any = await dbQuery('SELECT id, user_id FROM creators WHERE id = ? OR user_id = ? LIMIT 1', [
      user.id,
      user.id,
    ]);
    if (Array.isArray(rows) && rows.length > 0) {
      return { creatorId: rows[0].id as string, creatorUserId: rows[0].user_id || user.id, brandUserId: null as string | null };
    }
    return { creatorId: user.id, creatorUserId: user.id, brandUserId: null as string | null };
  }
  if (user.role === 'BRAND') {
    return { creatorId: null as string | null, creatorUserId: null as string | null, brandUserId: user.id };
  }
  return { creatorId: null, creatorUserId: null, brandUserId: null };
}

function isOnline(lastSeen: Date | string | null | undefined, onlineUserIds: Set<string>, userId?: string | null) {
  if (userId && onlineUserIds.has(userId)) return true;
  if (!lastSeen) return false;
  const t = new Date(lastSeen).getTime();
  return Number.isFinite(t) && Date.now() - t < ONLINE_THRESHOLD_MS;
}

export async function listConversations(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'BRAND' && req.user.role !== 'CREATOR' && req.user.role !== 'ADMIN')) {
      return res.status(403).json({ success: false, error: 'Authentication required' });
    }

    const parts = await resolveParticipantIds(req.user);
    let sql = `
      SELECT 
        c.*,
        bp.brand_name,
        bp.logo_url as brand_avatar,
        cr.name as creator_name,
        cr.avatar as creator_avatar,
        cr.username as creator_username,
        bu.last_seen_at as brand_last_seen,
        cu.last_seen_at as creator_last_seen,
        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.is_read = FALSE AND m.sender_id <> ?) as unread_count
      FROM conversations c
      LEFT JOIN brand_profiles bp ON bp.user_id = c.brand_user_id
      LEFT JOIN creators cr ON cr.id = c.creator_id
      LEFT JOIN users bu ON bu.id = c.brand_user_id
      LEFT JOIN users cu ON cu.id = COALESCE(c.creator_user_id, cr.user_id)
      WHERE 1=1
    `;
    const params: any[] = [req.user.id];

    if (req.user.role === 'BRAND') {
      sql += ' AND c.brand_user_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'CREATOR') {
      sql += ' AND (c.creator_id = ? OR c.creator_user_id = ?)';
      params.push(parts.creatorId, req.user.id);
    }

    sql += ' ORDER BY COALESCE(c.last_message_at, c.created_at) DESC';

    const rows: any = await dbQuery(sql, params);
    const onlineUserIds: Set<string> = (req.app.get('onlineUserIds') as Set<string>) || new Set();

    const conversations = (Array.isArray(rows) ? rows : []).map((r: any) => {
      const isBrandViewer = req.user!.role === 'BRAND';
      const peerName = isBrandViewer ? r.creator_name : r.brand_name;
      const peerAvatar = isBrandViewer ? r.creator_avatar : r.brand_avatar;
      const peerUserId = isBrandViewer ? (r.creator_user_id || null) : r.brand_user_id;
      const peerLastSeen = isBrandViewer ? r.creator_last_seen : r.brand_last_seen;

      return {
        id: r.id,
        brandUserId: r.brand_user_id,
        creatorId: r.creator_id,
        creatorUserId: r.creator_user_id,
        campaignId: r.campaign_id,
        inquiryId: r.inquiry_id,
        brandName: r.brand_name || 'Brand',
        creatorName: r.creator_name || 'Creator',
        creatorUsername: r.creator_username || '',
        peerName: peerName || 'User',
        peerAvatar: peerAvatar || '',
        lastMessage: r.last_message || '',
        lastMessageAt: r.last_message_at,
        unreadCount: Number(r.unread_count) || 0,
        online: isOnline(peerLastSeen, onlineUserIds, peerUserId),
        createdAt: r.created_at,
      };
    });

    res.json({ success: true, conversations });
  } catch (error) {
    console.error('listConversations error:', error);
    res.status(500).json({ success: false, error: 'Failed to list conversations' });
  }
}

export async function getMessages(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Authentication required' });

    const { id } = req.params;
    const convRows: any = await dbQuery('SELECT * FROM conversations WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(convRows) || convRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }
    const conv = convRows[0];

    const parts = await resolveParticipantIds(req.user);
    const allowed =
      req.user.role === 'ADMIN' ||
      conv.brand_user_id === req.user.id ||
      conv.creator_user_id === req.user.id ||
      conv.creator_id === parts.creatorId;

    if (!allowed) {
      return res.status(403).json({ success: false, error: 'Not authorized for this conversation' });
    }

    const msgs: any = await dbQuery(
      `SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 500`,
      [id]
    );

    // Mark peer messages as read
    await dbQuery(
      `UPDATE messages SET is_read = TRUE WHERE conversation_id = ? AND sender_id <> ? AND is_read = FALSE`,
      [id, req.user.id]
    );

    res.json({
      success: true,
      messages: (Array.isArray(msgs) ? msgs : []).map((m: any) => ({
        id: m.id,
        conversationId: m.conversation_id,
        senderId: m.sender_id,
        senderRole: m.sender_role,
        body: m.body,
        isRead: Boolean(m.is_read),
        createdAt: m.created_at,
      })),
    });
  } catch (error) {
    console.error('getMessages error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
}

export async function sendMessage(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'BRAND' && req.user.role !== 'CREATOR')) {
      return res.status(403).json({ success: false, error: 'Authentication required' });
    }

    const { id } = req.params;
    const body = String(req.body.body || req.body.message || '').trim();
    if (!body) return res.status(400).json({ success: false, error: 'Message body is required' });
    if (body.length > 4000) return res.status(400).json({ success: false, error: 'Message too long' });

    const convRows: any = await dbQuery('SELECT * FROM conversations WHERE id = ? LIMIT 1', [id]);
    if (!Array.isArray(convRows) || convRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }
    const conv = convRows[0];
    const parts = await resolveParticipantIds(req.user);
    const allowed =
      conv.brand_user_id === req.user.id ||
      conv.creator_user_id === req.user.id ||
      conv.creator_id === parts.creatorId;

    if (!allowed) {
      return res.status(403).json({ success: false, error: 'Not authorized for this conversation' });
    }

    const msgId = `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    await dbQuery(
      `INSERT INTO messages (id, conversation_id, sender_id, sender_role, body, is_read)
       VALUES (?, ?, ?, ?, ?, FALSE)`,
      [msgId, id, req.user.id, req.user.role, body]
    );
    await dbQuery(
      `UPDATE conversations SET last_message = ?, last_message_at = NOW() WHERE id = ?`,
      [body.slice(0, 500), id]
    );

    const message = {
      id: msgId,
      conversationId: id,
      senderId: req.user.id,
      senderRole: req.user.role,
      body,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
}

export async function openOrCreateConversation(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'BRAND') {
      return res.status(403).json({ success: false, error: 'Only brands can open conversations from inquiries' });
    }

    const { inquiryId, creatorId, campaignId } = req.body;
    if (!creatorId && !inquiryId) {
      return res.status(400).json({ success: false, error: 'inquiryId or creatorId required' });
    }

    let inquiry: any = null;
    if (inquiryId) {
      const rows: any = await dbQuery('SELECT * FROM brand_inquiries WHERE id = ? LIMIT 1', [inquiryId]);
      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Inquiry not found' });
      }
      inquiry = rows[0];
      if (inquiry.brand_id !== req.user.id) {
        const bp: any = await dbQuery('SELECT user_id FROM brand_profiles WHERE id = ? OR user_id = ?', [
          inquiry.brand_id,
          inquiry.brand_id,
        ]);
        const owned = Array.isArray(bp) && bp.some((b: any) => b.user_id === req.user!.id || inquiry.brand_id === req.user!.id);
        if (!owned && inquiry.brand_id !== req.user.id) {
          return res.status(403).json({ success: false, error: 'Not authorized for this inquiry' });
        }
      }
      if (inquiry.status !== 'Confirmed' && inquiry.status !== 'Replied') {
        return res.status(400).json({ success: false, error: 'Confirm the inquiry before messaging' });
      }
      if (inquiry.conversation_id) {
        return res.json({ success: true, conversationId: inquiry.conversation_id });
      }
    }

    const finalCreatorId = inquiry?.creator_id || creatorId;
    const finalCampaignId = inquiry?.campaign_id || campaignId || null;

    const existing: any = await dbQuery(
      `SELECT id FROM conversations WHERE brand_user_id = ? AND creator_id = ? AND (campaign_id <=> ?) LIMIT 1`,
      [req.user.id, finalCreatorId, finalCampaignId]
    );
    if (Array.isArray(existing) && existing.length > 0) {
      if (inquiryId) {
        await dbQuery('UPDATE brand_inquiries SET conversation_id = ?, status = COALESCE(status, status) WHERE id = ?', [
          existing[0].id,
          inquiryId,
        ]);
      }
      return res.json({ success: true, conversationId: existing[0].id });
    }

    let creatorUserId: string | null = null;
    const cRows: any = await dbQuery('SELECT user_id FROM creators WHERE id = ? LIMIT 1', [finalCreatorId]);
    if (Array.isArray(cRows) && cRows.length > 0) creatorUserId = cRows[0].user_id || null;

    const conversationId = `conv_${Date.now()}`;
    await dbQuery(
      `INSERT INTO conversations (id, brand_user_id, creator_id, creator_user_id, campaign_id, inquiry_id, last_message, last_message_at)
       VALUES (?, ?, ?, ?, ?, ?, 'Conversation started', NOW())`,
      [conversationId, req.user.id, finalCreatorId, creatorUserId, finalCampaignId, inquiryId || null]
    );

    if (inquiryId) {
      await dbQuery(`UPDATE brand_inquiries SET conversation_id = ?, status = 'Confirmed' WHERE id = ?`, [
        conversationId,
        inquiryId,
      ]);
    }

    res.status(201).json({ success: true, conversationId });
  } catch (error) {
    console.error('openOrCreateConversation error:', error);
    res.status(500).json({ success: false, error: 'Failed to open conversation' });
  }
}

export async function createCollaborationReview(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || (req.user.role !== 'BRAND' && req.user.role !== 'CREATOR')) {
      return res.status(403).json({ success: false, error: 'Authentication required' });
    }

    const { conversationId, rating, reviewText } = req.body;
    const score = Number(rating);
    if (!conversationId || !Number.isFinite(score) || score < 1 || score > 5) {
      return res.status(400).json({ success: false, error: 'conversationId and rating (1-5) are required' });
    }
    if (!reviewText || String(reviewText).trim().length < 5) {
      return res.status(400).json({ success: false, error: 'Review text is required' });
    }

    const convRows: any = await dbQuery('SELECT * FROM conversations WHERE id = ? LIMIT 1', [conversationId]);
    if (!Array.isArray(convRows) || convRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }
    const conv = convRows[0];
    const parts = await resolveParticipantIds(req.user);
    const isBrand = req.user.role === 'BRAND' && conv.brand_user_id === req.user.id;
    const isCreator =
      req.user.role === 'CREATOR' &&
      (conv.creator_user_id === req.user.id || conv.creator_id === parts.creatorId);

    if (!isBrand && !isCreator) {
      return res.status(403).json({ success: false, error: 'Not authorized to review this collaboration' });
    }

    const reviewerRole = req.user.role as 'BRAND' | 'CREATOR';
    const revieweeRole = reviewerRole === 'BRAND' ? 'CREATOR' : 'BRAND';
    const revieweeId = reviewerRole === 'BRAND' ? conv.creator_id : conv.brand_user_id;

    const dup: any = await dbQuery(
      `SELECT id FROM collaboration_reviews WHERE conversation_id = ? AND reviewer_id = ? LIMIT 1`,
      [conversationId, req.user.id]
    );
    if (Array.isArray(dup) && dup.length > 0) {
      return res.status(400).json({ success: false, error: 'You already reviewed this collaboration' });
    }

    const id = `crev_${Date.now()}`;
    await dbQuery(
      `INSERT INTO collaboration_reviews (
        id, conversation_id, campaign_id, inquiry_id, reviewer_id, reviewer_role,
        reviewee_id, reviewee_role, rating, review_text
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        conversationId,
        conv.campaign_id || null,
        conv.inquiry_id || null,
        req.user.id,
        reviewerRole,
        revieweeId,
        revieweeRole,
        score,
        String(reviewText).trim(),
      ]
    );

    // Mirror into creator_reviews for public creator profile when brand reviews creator
    if (reviewerRole === 'BRAND') {
      try {
        const brandNameRows: any = await dbQuery(
          'SELECT brand_name FROM brand_profiles WHERE user_id = ? LIMIT 1',
          [req.user.id]
        );
        const brandName =
          (Array.isArray(brandNameRows) && brandNameRows[0]?.brand_name) || req.user.name || 'Brand';
        await dbQuery(
          `INSERT INTO creator_reviews (id, creator_id, brand_name, rating, review_text, campaign_type, verified_collaboration, brand_user_id, campaign_id, conversation_id)
           VALUES (?, ?, ?, ?, ?, ?, TRUE, ?, ?, ?)`,
          [
            `rev_${Date.now()}`,
            conv.creator_id,
            brandName,
            score,
            String(reviewText).trim(),
            'Collaboration',
            req.user.id,
            conv.campaign_id || null,
            conversationId,
          ]
        );
      } catch (e) {
        console.warn('creator_reviews mirror notice:', e);
      }
    }

    res.status(201).json({
      success: true,
      review: {
        id,
        conversationId,
        rating: score,
        reviewText: String(reviewText).trim(),
        reviewerRole,
        revieweeId,
        revieweeRole,
      },
    });
  } catch (error) {
    console.error('createCollaborationReview error:', error);
    res.status(500).json({ success: false, error: 'Failed to submit review' });
  }
}

export async function getPublicReviews(req: AuthenticatedRequest, res: Response) {
  try {
    const { role, id } = req.params;
    if (role === 'creator') {
      const rows: any = await dbQuery(
        `SELECT * FROM creator_reviews WHERE creator_id = ? ORDER BY created_at DESC LIMIT 50`,
        [id]
      );
      return res.json({
        success: true,
        reviews: (Array.isArray(rows) ? rows : []).map((r: any) => ({
          id: r.id,
          brandName: r.brand_name,
          rating: r.rating,
          reviewText: r.review_text,
          campaignType: r.campaign_type,
          date: r.created_at,
          verifiedCollaboration: Boolean(r.verified_collaboration),
        })),
      });
    }

    if (role === 'brand') {
      const rows: any = await dbQuery(
        `SELECT cr.*, c.name as creator_name, c.avatar as creator_avatar
         FROM collaboration_reviews cr
         LEFT JOIN creators c ON c.user_id = cr.reviewer_id OR c.id = cr.reviewer_id
         WHERE cr.reviewee_id = ? AND cr.reviewee_role = 'BRAND'
         ORDER BY cr.created_at DESC LIMIT 50`,
        [id]
      );
      return res.json({
        success: true,
        reviews: (Array.isArray(rows) ? rows : []).map((r: any) => ({
          id: r.id,
          creatorName: r.creator_name || 'Creator',
          creatorAvatar: r.creator_avatar || '',
          rating: r.rating,
          reviewText: r.review_text,
          date: r.created_at,
        })),
      });
    }

    return res.status(400).json({ success: false, error: 'Invalid review target' });
  } catch (error) {
    console.error('getPublicReviews error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch reviews' });
  }
}
