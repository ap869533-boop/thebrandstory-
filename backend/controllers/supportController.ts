import { Request, Response } from 'express';
import { dbQuery } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import crypto from 'crypto';

// ==============================
// FAQs (Public & Admin)
// ==============================

export const getFaqs = async (req: Request, res: Response) => {
  try {
    const faqs = await dbQuery('SELECT * FROM support_faqs WHERE is_active = TRUE ORDER BY sort_order ASC, created_at DESC');
    res.json({ success: true, faqs });
  } catch (error: any) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch FAQs' });
  }
};

export const getAdminFaqs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const faqs = await dbQuery('SELECT * FROM support_faqs ORDER BY category, sort_order ASC, created_at DESC');
    res.json({ success: true, faqs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch FAQs' });
  }
};

export const addFaq = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, question, answer, sort_order = 0 } = req.body;
    const id = 'faq_' + crypto.randomBytes(8).toString('hex');
    
    await dbQuery(
      'INSERT INTO support_faqs (id, category, question, answer, sort_order) VALUES (?, ?, ?, ?, ?)',
      [id, category, question, answer, sort_order]
    );
    
    res.json({ success: true, message: 'FAQ added successfully', id });
  } catch (error: any) {
    console.error('Error adding FAQ:', error);
    res.status(500).json({ success: false, error: 'Failed to add FAQ' });
  }
};

export const updateFaq = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { category, question, answer, sort_order, is_active } = req.body;
    
    await dbQuery(
      'UPDATE support_faqs SET category=?, question=?, answer=?, sort_order=?, is_active=? WHERE id=?',
      [category, question, answer, sort_order, is_active, id]
    );
    
    res.json({ success: true, message: 'FAQ updated successfully' });
  } catch (error: any) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ success: false, error: 'Failed to update FAQ' });
  }
};

export const deleteFaq = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await dbQuery('DELETE FROM support_faqs WHERE id=?', [id]);
    res.json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ success: false, error: 'Failed to delete FAQ' });
  }
};

// ==============================
// Support Tickets (Guest & User)
// ==============================

export const createTicket = async (req: Request, res: Response) => {
  try {
    const { category, subject, description, guest_name, guest_email } = req.body;
    
    // Check if authenticated
    const authReq = req as AuthenticatedRequest;
    const user_id = authReq.user?.id || null;
    const user_role = authReq.user?.role || 'GUEST';
    
    // Generate IDs and tokens
    const id = 'tkt_' + crypto.randomBytes(6).toString('hex');
    const access_token = user_id ? null : crypto.randomBytes(16).toString('hex');
    
    await dbQuery(
      `INSERT INTO support_tickets 
      (id, user_id, user_role, guest_name, guest_email, category, subject, description, access_token) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, user_id, user_role, guest_name || null, guest_email || null, category, subject, description, access_token]
    );
    
    // Add initial message to replies table
    const replyId = 'reply_' + crypto.randomBytes(8).toString('hex');
    await dbQuery(
      `INSERT INTO support_ticket_replies 
      (id, ticket_id, sender_id, sender_role, message) 
      VALUES (?, ?, ?, ?, ?)`,
      [replyId, id, user_id, user_role, description]
    );

    res.json({ 
      success: true, 
      message: 'Ticket created successfully', 
      ticket_id: id,
      access_token: access_token // Only returned once for guests to save/link
    });
  } catch (error: any) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ success: false, error: 'Failed to create ticket' });
  }
};

// For guests to view their ticket via secret link
export const getTicketByToken = async (req: Request, res: Response) => {
  try {
    const { id, token } = req.params;
    
    const tickets: any = await dbQuery('SELECT * FROM support_tickets WHERE id=? AND access_token=?', [id, token]);
    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ success: false, error: 'Ticket not found or invalid token' });
    }
    
    const replies = await dbQuery('SELECT * FROM support_ticket_replies WHERE ticket_id=? ORDER BY created_at ASC', [id]);
    
    res.json({ success: true, ticket: tickets[0], replies });
  } catch (error: any) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch ticket' });
  }
};

// ==============================
// Support Tickets (Admin)
// ==============================

export const getAdminTickets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Optionally add filters by status, etc.
    const tickets = await dbQuery('SELECT * FROM support_tickets ORDER BY created_at DESC');
    res.json({ success: true, tickets });
  } catch (error: any) {
    console.error('Error fetching admin tickets:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tickets' });
  }
};

export const getAdminTicketDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const tickets: any = await dbQuery('SELECT * FROM support_tickets WHERE id=?', [id]);
    if (!tickets || tickets.length === 0) return res.status(404).json({ success: false, error: 'Ticket not found' });
    
    const replies = await dbQuery('SELECT * FROM support_ticket_replies WHERE ticket_id=? ORDER BY created_at ASC', [id]);
    
    res.json({ success: true, ticket: tickets[0], replies });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to fetch ticket details' });
  }
};

export const adminReplyTicket = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { message, status } = req.body;
    const adminId = req.user?.id;
    
    // Add reply
    const replyId = 'reply_' + crypto.randomBytes(8).toString('hex');
    await dbQuery(
      `INSERT INTO support_ticket_replies 
      (id, ticket_id, sender_id, sender_role, message) 
      VALUES (?, ?, ?, ?, ?)`,
      [replyId, id, adminId, 'ADMIN', message]
    );
    
    // Update status if provided
    if (status) {
      await dbQuery('UPDATE support_tickets SET status=? WHERE id=?', [status, id]);
    } else {
      // Auto update to In Progress if it was Open
      await dbQuery('UPDATE support_tickets SET status="In Progress" WHERE id=? AND status="Open"', [id]);
    }
    
    res.json({ success: true, message: 'Replied successfully' });
  } catch (error: any) {
    console.error('Error replying to ticket:', error);
    res.status(500).json({ success: false, error: 'Failed to reply' });
  }
};
