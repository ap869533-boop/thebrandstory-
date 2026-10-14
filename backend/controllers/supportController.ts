import { Request, Response } from 'express';
import { dbQuery } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';

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
    const { category, subject, description, guest_name, guest_email, user_id: bodyUserId, user_role: bodyUserRole } = req.body;
    
    // Check if authenticated
    const authReq = req as AuthenticatedRequest;
    let user_id = authReq.user?.id || bodyUserId || null;
    let user_role = authReq.user?.role || bodyUserRole || 'GUEST';

    if (guest_email && (user_role === 'GUEST' || !user_id)) {
      try {
        const users: any = await dbQuery('SELECT id, role, name FROM users WHERE email=? LIMIT 1', [guest_email]);
        if (users && users.length > 0) {
          if (!user_id) user_id = users[0].id;
          if (user_role === 'GUEST') user_role = users[0].role;
        }
      } catch (err) {}
    }
    if (user_role === 'CREATOR') user_role = 'INFLUENCER';
    
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

export const deleteAdminTicket = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await dbQuery('DELETE FROM support_ticket_replies WHERE ticket_id=?', [id]);
    await dbQuery('DELETE FROM support_tickets WHERE id=?', [id]);
    res.json({ success: true, message: 'Ticket deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting ticket:', error);
    res.status(500).json({ success: false, error: 'Failed to delete ticket' });
  }
};

// ==============================
// AI Support Chat (Frontend)
// ==============================

export const chatSupport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let { ticket_id, access_token, message, guest_name, guest_email, user_id: bodyUserId, user_role: bodyUserRole } = req.body;
    let user_id = req.user?.id || bodyUserId || null;
    let user_role = req.user?.role || bodyUserRole || 'GUEST';

    if (guest_email && (user_role === 'GUEST' || !user_id)) {
      try {
        const users: any = await dbQuery('SELECT id, role, name FROM users WHERE email=? LIMIT 1', [guest_email]);
        if (users && users.length > 0) {
          if (!user_id) user_id = users[0].id;
          if (user_role === 'GUEST') user_role = users[0].role;
          if (!guest_name) guest_name = users[0].name;
        }
      } catch (err) {}
    } else if (user_id && (user_role === 'GUEST' || !guest_name)) {
      try {
        const users: any = await dbQuery('SELECT id, role, name FROM users WHERE id=? LIMIT 1', [user_id]);
        if (users && users.length > 0) {
          if (user_role === 'GUEST') user_role = users[0].role;
          if (!guest_name) guest_name = users[0].name;
        }
      } catch (err) {}
    }

    if (user_role === 'CREATOR') user_role = 'INFLUENCER';

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message cannot be empty' });
    }

    // 1. If no ticket_id, check if user already has an active ticket or create a new Ticket
    if (!ticket_id) {
      if (user_id) {
        const existing: any = await dbQuery('SELECT id, access_token FROM support_tickets WHERE user_id=? AND status IN (?, ?) ORDER BY created_at DESC LIMIT 1', [user_id, 'Open', 'In Progress']);
        if (existing && existing.length > 0) {
          ticket_id = existing[0].id;
          access_token = existing[0].access_token;
        }
      }

      if (!ticket_id) {
        ticket_id = 'tkt_' + crypto.randomBytes(8).toString('hex');
        access_token = crypto.randomBytes(16).toString('hex');

        await dbQuery(
          `INSERT INTO support_tickets 
          (id, user_id, user_role, guest_name, guest_email, category, subject, description, status, access_token) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [ticket_id, user_id, user_role, guest_name || null, guest_email || null, 'General', 'Support Query', message, 'In Progress', access_token]
        );
      }
    } else {
      // Validate existing ticket
      const tickets: any = await dbQuery('SELECT id FROM support_tickets WHERE id=? AND (access_token=? OR user_id=?)', [ticket_id, access_token, user_id]);
      if (!tickets || tickets.length === 0) {
        return res.status(404).json({ success: false, error: 'Ticket not found or unauthorized' });
      }
      if (user_role && user_role !== 'GUEST') {
        await dbQuery('UPDATE support_tickets SET user_role=?, user_id=COALESCE(user_id, ?) WHERE id=?', [user_role, user_id, ticket_id]);
      }
    }

    // 2. Save user message
    const userReplyId = 'reply_' + crypto.randomBytes(8).toString('hex');
    try {
      await dbQuery(
        `INSERT INTO support_ticket_replies (id, ticket_id, sender_id, sender_role, message) VALUES (?, ?, ?, ?, ?)`,
        [userReplyId, ticket_id, user_id, user_role, message]
      );
    } catch (uErr: any) {
      try {
        await dbQuery("ALTER TABLE support_ticket_replies MODIFY COLUMN sender_role VARCHAR(32) NOT NULL DEFAULT 'USER'");
        await dbQuery(
          `INSERT INTO support_ticket_replies (id, ticket_id, sender_id, sender_role, message) VALUES (?, ?, ?, ?, ?)`,
          [userReplyId, ticket_id, user_id, user_role, message]
        );
      } catch (retryErr) {
        console.error("Could not insert user message:", retryErr);
      }
    }

    // 3. Admin FAQs Knowledge Base for AI
    const faqs: any = await dbQuery('SELECT question, answer FROM support_faqs WHERE is_active = TRUE ORDER BY sort_order ASC, created_at DESC');
    let faqKnowledge = '';
    if (faqs && faqs.length > 0) {
      faqKnowledge = `Official Platform FAQ Knowledge Base (Provided by Admin):\n` +
        faqs.map((f: any, idx: number) => `[FAQ ${idx + 1}]\nQuestion: ${f.question}\nAnswer: ${f.answer}`).join('\n\n');
    }

    const systemPrompt = `You are the official smart AI Support Assistant for 'The Brand Story' platform.

ROLE & BEHAVIOR:
1. When the user asks ANY question or describes their concern, understand what they mean (in Hindi, Hinglish, or casual English).
2. If their question or concern relates to any topic in the "Official Platform FAQ Knowledge Base" below, base your answer directly on that verified information.
3. Be conversational, friendly, and helpful like a professional support assistant.
4. Keep replies clear, to the point, and concise (1 to 3 short sentences max).
5. Match the language of the user naturally (Hinglish/Hindi if they write in Hinglish, English if English).
6. If the user explicitly asks to talk to a human agent or representative, reply ONLY with 'TRANSFER_TO_HUMAN'.

PLATFORM UI & ACTIONS TERMINOLOGY (IMPORTANT):
- When guiding creators on pitching or applying to brand campaigns: In the 'Live Opportunities' / 'Live Campaigns' section, each campaign card has a button explicitly named "Pitch Campaign". Always instruct creators to click on the "Pitch Campaign" button on the campaign card (do NOT say 'Apply', always say 'Pitch Campaign'!).
- Once they click "Pitch Campaign", they can enter their custom pitch proposal and submit it directly to the brand.

${faqKnowledge}`;

    // 4. Get Chat History
    const replies: any = await dbQuery('SELECT sender_role, message FROM support_ticket_replies WHERE ticket_id=? ORDER BY created_at ASC', [ticket_id]);
    
    // Format for Gemini API (roles must be exactly 'user' or 'model')
    const pastReplies = replies.slice(0, -1);
    let history: any[] = pastReplies.map((r: any) => ({
      role: r.sender_role === 'AI' ? 'model' : 'user',
      parts: [{ text: r.message }]
    }));

    // 5. Call Gemini
    let aiResponseText = '';
    
    if (!process.env.GEMINI_API_KEY) {
       aiResponseText = "TRANSFER_TO_HUMAN"; // Fallback
    } else {
       try {
         const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
         const contents = [
           { role: 'user', parts: [{ text: systemPrompt }] },
           { role: 'model', parts: [{ text: 'Understood. I am The Brand Story AI support agent and will assist the user politely and promptly on their specific query.' }] },
           ...history,
           { role: 'user', parts: [{ text: message }] }
         ];

         // Use fast model (gemini-3.5-flash-lite takes ~1.5s), fallback to gemini-2.5-flash if needed
         try {
           const response = await ai.models.generateContent({
             model: 'gemini-3.5-flash-lite',
             contents
           });
           aiResponseText = response.text || '';
         } catch (primaryErr: any) {
           console.log("3.5-flash-lite failed, trying gemini-2.5-flash fallback:", primaryErr?.message);
           const fallbackResponse = await ai.models.generateContent({
             model: 'gemini-2.5-flash',
             contents
           });
           aiResponseText = fallbackResponse.text || '';
         }
       } catch(e: any) {
         console.error("Gemini API Error:", e);
         aiResponseText = "TRANSFER_TO_HUMAN_ERROR: " + (e.message || 'Unknown Error');
       }
    }

    // 6. Handle Handoff or AI Reply
    if (aiResponseText.includes('TRANSFER_TO_HUMAN')) {
      await dbQuery('UPDATE support_tickets SET status=? WHERE id=?', ['Open', ticket_id]);
      
      if (aiResponseText.includes('TRANSFER_TO_HUMAN_ERROR')) {
         aiResponseText = "I need human assistance to answer this properly. [DEBUG: " + aiResponseText + "]";
      } else {
         aiResponseText = "I need human assistance to answer this properly. I have forwarded this entire chat to our support team, and they will get back to you soon on this ticket.";
      }
    }

    const aiReplyId = 'reply_' + crypto.randomBytes(8).toString('hex');
    try {
      await dbQuery(
        `INSERT INTO support_ticket_replies (id, ticket_id, sender_id, sender_role, message) VALUES (?, ?, ?, ?, ?)`,
        [aiReplyId, ticket_id, 'AI_AGENT', 'AI', aiResponseText]
      );
    } catch (insertErr: any) {
      try {
        await dbQuery("ALTER TABLE support_ticket_replies MODIFY COLUMN sender_role VARCHAR(32) NOT NULL DEFAULT 'USER'");
        await dbQuery(
          `INSERT INTO support_ticket_replies (id, ticket_id, sender_id, sender_role, message) VALUES (?, ?, ?, ?, ?)`,
          [aiReplyId, ticket_id, 'AI_AGENT', 'AI', aiResponseText]
        );
      } catch (retryErr) {
        console.error("Critical: Could not insert AI reply:", retryErr);
      }
    }

    res.json({
      success: true,
      ticket_id,
      access_token,
      reply: aiResponseText
    });

  } catch (error: any) {
    console.error('Error in AI Chat Support:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const getChatSync = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ticket_id = req.query.ticket_id as string;
    const access_token = req.query.access_token as string;
    const user_id = req.user?.id || null;

    let targetTicketId = ticket_id;

    if (!targetTicketId && user_id) {
      const existing: any = await dbQuery(
        'SELECT id, access_token, status FROM support_tickets WHERE user_id=? AND status IN (?, ?) ORDER BY created_at DESC LIMIT 1',
        [user_id, 'Open', 'In Progress']
      );
      if (existing && existing.length > 0) {
        targetTicketId = existing[0].id;
      }
    }

    if (!targetTicketId) {
      return res.json({ success: true, ticket_id: null, replies: [] });
    }

    const tickets: any = await dbQuery(
      'SELECT id, access_token, status FROM support_tickets WHERE id=? AND (access_token=? OR user_id=? OR ? = TRUE)',
      [targetTicketId, access_token || null, user_id, req.user?.role === 'ADMIN']
    );

    if (!tickets || tickets.length === 0) {
      return res.status(404).json({ success: false, error: 'Ticket not found or unauthorized' });
    }

    const replies = await dbQuery(
      'SELECT id, sender_role, message, created_at FROM support_ticket_replies WHERE ticket_id=? ORDER BY created_at ASC',
      [targetTicketId]
    );

    res.json({
      success: true,
      ticket_id: targetTicketId,
      access_token: tickets[0].access_token,
      status: tickets[0].status,
      replies
    });
  } catch (error: any) {
    console.error('Error syncing chat:', error);
    res.status(500).json({ success: false, error: 'Failed to sync chat' });
  }
};

