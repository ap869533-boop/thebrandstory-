import { Request, Response } from 'express';
import { dbQuery } from '../config/db';
import { EnquiryLead } from '../types';
import { creatorsStore } from './creatorController';

let enquiriesStore: EnquiryLead[] = [
  {
    id: 'SC-ENQ-849201',
    creatorId: 'c1',
    creatorName: 'Priya Sharma',
    creatorUsername: 'priyasharma',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    brandName: 'Nykaa Beauty',
    contactPerson: 'Meera Kapur',
    email: 'meera.k@nykaa.com',
    phone: '+91 98111 22334',
    campaignType: 'Instagram Reel + 2 Stories',
    campaignDescription: 'Promote our upcoming Monsoon Skincare serum line with a 45-second aesthetic reel.',
    city: 'Delhi NCR',
    budget: '₹15,000',
    influencersRequired: 1,
    preferredDate: 'Next Week',
    message: 'We love your authentic skin tone styling and would like to send our PR kit.',
    status: 'New',
    createdAt: 'Today, 11:30 AM',
    isReadByCreator: false,
  }
];

export async function getEnquiries(req: Request, res: Response) {
  const { creatorId } = req.query;
  let result = enquiriesStore;
  if (creatorId) {
    result = result.filter((e) => e.creatorId === creatorId);
  }
  res.json({ success: true, total: result.length, enquiries: result });
}

export async function createEnquiry(req: Request, res: Response) {
  try {
    const data = req.body;
    if (!data.creatorId || !data.brandName || !data.email) {
      return res.status(400).json({ success: false, error: 'Missing required enquiry details' });
    }

    const creator = creatorsStore.find((c) => c.id === data.creatorId);
    const trackingId = `SC-ENQ-${Math.floor(100000 + Math.random() * 900000)}`;

    const newEnquiry: EnquiryLead = {
      id: trackingId,
      creatorId: data.creatorId,
      creatorName: creator?.name || data.creatorName || 'Influencer',
      creatorUsername: creator?.username || 'creator',
      creatorAvatar: creator?.avatar || '',
      brandName: data.brandName,
      contactPerson: data.contactPerson || data.brandName,
      email: data.email,
      phone: data.phone || '',
      campaignType: data.campaignType || 'Instagram Reel Deliverable',
      campaignDescription: data.campaignDescription || data.message || '',
      city: data.city || 'Delhi NCR',
      budget: data.budget || '₹10,000',
      influencersRequired: data.influencersRequired || 1,
      preferredDate: data.preferredDate || 'Next 2 Weeks',
      message: data.message || '',
      status: 'New',
      createdAt: 'Just now',
      isReadByCreator: false,
    };

    enquiriesStore.unshift(newEnquiry);

    // MySQL Insert
    dbQuery(
      `INSERT INTO enquiry_leads (id, creator_id, creator_name, creator_username, brand_name, contact_person, email, campaign_type, city, budget, message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newEnquiry.id, newEnquiry.creatorId, newEnquiry.creatorName, newEnquiry.creatorUsername, newEnquiry.brandName, newEnquiry.contactPerson, newEnquiry.email, newEnquiry.campaignType, newEnquiry.city, newEnquiry.budget, newEnquiry.message]
    ).catch(err => console.warn('MySQL enquiry insert notice:', err));

    res.status(201).json({ success: true, enquiry: newEnquiry, trackingId });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to submit enquiry' });
  }
}

export async function updateEnquiryStatus(req: Request, res: Response) {
  const { id } = req.params;
  const enquiry = enquiriesStore.find((e) => e.id === id);
  if (!enquiry) {
    return res.status(404).json({ success: false, error: 'Enquiry not found' });
  }

  if (req.body.status) enquiry.status = req.body.status;
  if (req.body.creatorReply) enquiry.creatorReply = req.body.creatorReply;
  if (req.body.isReadByCreator !== undefined) enquiry.isReadByCreator = req.body.isReadByCreator;

  res.json({ success: true, enquiry });
}
