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

// ==============================
// AI Support Chat (Frontend)
// ==============================

export const chatSupport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let { ticket_id, access_token, message, guest_name, guest_email } = req.body;
    const user_id = req.user?.id || null;
    const user_role = req.user?.role || 'GUEST';

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
    }

    // 2. Save user message
    const userReplyId = 'reply_' + crypto.randomBytes(8).toString('hex');
    await dbQuery(
      `INSERT INTO support_ticket_replies (id, ticket_id, sender_id, sender_role, message) VALUES (?, ?, ?, ?, ?)`,
      [userReplyId, ticket_id, user_id, user_role, message]
    );

    // 3. Get FAQs for Reference
    const faqs: any = await dbQuery('SELECT question, answer FROM support_faqs WHERE is_active = TRUE');
    let faqContext = '';
    if (faqs && faqs.length > 0) {
      faqContext = `Official Platform FAQs (use ONLY if the user's question directly relates to these topics):\n` +
        faqs.map((f: any, i: number) => `Topic ${i+1}: ${f.question}\nAnswer: ${f.answer}`).join('\n\n');
    }

    const systemPrompt = `You are the official friendly AI Support Assistant for 'The Brand Story' platform (a platform connecting brands and creators for marketing campaigns).

CRITICAL INSTRUCTIONS:
1. ANSWER ONLY WHAT THE CURRENT USER ASKS: Strictly address the specific question or issue asked in the latest message. NEVER paste unrelated FAQs (like login or signup guides) unless the user explicitly asks about login or signup!
2. TECHNICAL ISSUES & BUGS (e.g. searchbar not working, buttons not clicking, page errors):
   - Acknowledge the specific issue politely.
   - Give 1-2 quick troubleshooting tips (e.g. refresh the page, check internet, try incognito mode, or clear browser cache).
   - Offer to report the issue to the tech team if problem persists.
3. GENERAL QUESTIONS: Answer naturally, politely, and intelligently in Hinglish / Hindi / English (matching the user's language).
4. KEEP IT CONCISE: 2 to 3 short sentences max. Do NOT write long essays.
5. If the user explicitly asks to talk to a human agent, reply ONLY with 'TRANSFER_TO_HUMAN'.

${faqContext}`;

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
      
      const aiReplyId = 'reply_' + crypto.randomBytes(8).toString('hex');
      await dbQuery(
        `INSERT INTO support_ticket_replies (id, ticket_id, sender_id, sender_role, message) VALUES (?, ?, ?, ?, ?)`,
        [aiReplyId, ticket_id, 'AI_AGENT', 'AI', aiResponseText]
      );
    } else {
      const aiReplyId = 'reply_' + crypto.randomBytes(8).toString('hex');
      await dbQuery(
        `INSERT INTO support_ticket_replies (id, ticket_id, sender_id, sender_role, message) VALUES (?, ?, ?, ?, ?)`,
        [aiReplyId, ticket_id, 'AI_AGENT', 'AI', aiResponseText]
      );
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
