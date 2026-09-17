import { Request, Response } from 'express';
import { dbQuery } from '../config/db';
import { BrandInquiryLead } from '../types';

let brandInquiriesStore: BrandInquiryLead[] = [];

export async function getBrandInquiries(req: Request, res: Response) {
  const { brandId } = req.query;
  let result = brandInquiriesStore;
  if (brandId) {
    result = result.filter((e) => e.brandId === brandId);
  }
  res.json({ success: true, total: result.length, inquiries: result });
}

export async function createBrandInquiry(req: Request, res: Response) {
  try {
    const data = req.body;
    if (!data.creatorId || !data.brandName || !data.message) {
      return res.status(400).json({ success: false, error: 'Missing required inquiry details' });
    }

    const trackingId = `SC-BRAND-INQ-${Math.floor(10000 + Math.random() * 90000)}`;

    const newInquiry: BrandInquiryLead = {
      id: trackingId,
      creatorId: data.creatorId,
      creatorName: data.creatorName || 'Influencer',
      brandId: data.brandId || '',
      brandName: data.brandName,
      message: data.message,
      status: 'New',
      createdAt: 'Just now',
    };

    brandInquiriesStore.unshift(newInquiry);

    // MySQL Insert (Best effort)
    dbQuery(
      `INSERT INTO brand_inquiries (id, creator_id, creator_name, brand_id, brand_name, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [newInquiry.id, newInquiry.creatorId, newInquiry.creatorName, newInquiry.brandId, newInquiry.brandName, newInquiry.message, newInquiry.status]
    ).catch(err => console.warn('MySQL brand inquiry insert notice:', err));

    res.status(201).json({ success: true, inquiry: newInquiry, trackingId });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to submit inquiry' });
  }
}
