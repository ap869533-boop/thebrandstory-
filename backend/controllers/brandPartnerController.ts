import { Request, Response } from 'express';
import { dbQuery } from '../config/db';
import { BrandPartner } from '../types';

export const INITIAL_BRAND_PARTNERS: BrandPartner[] = [
  {
    id: 'bp_1',
    name: 'KukuTrip Holiday Pvt Ltd',
    category: 'Travel & Tourism',
    logoUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=300&auto=format&fit=crop&q=80',
    website: 'https://kukutrip.com',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'bp_2',
    name: 'SK Equipments',
    category: 'Industrial & Quality Testing',
    logoUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&auto=format&fit=crop&q=80',
    website: 'https://skequipments.com',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'bp_3',
    name: 'Yes Officer',
    category: 'EdTech & Government Prep',
    logoUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&auto=format&fit=crop&q=80',
    website: 'https://yesofficer.com',
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 'bp_4',
    name: 'Sleepwell',
    category: 'Mattresses & Comfort Living',
    logoUrl: 'https://images.unsplash.com/photo-1540518614846-7ede433c4550?w=300&auto=format&fit=crop&q=80',
    website: 'https://mysleepwell.com',
    sortOrder: 4,
    isActive: true,
  },
  {
    id: 'bp_5',
    name: 'Travenzo',
    category: 'Heritage Tour & Travel',
    logoUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300&auto=format&fit=crop&q=80',
    website: 'https://travenzo.com',
    sortOrder: 5,
    isActive: true,
  },
  {
    id: 'bp_6',
    name: 'Classic Escape',
    category: 'Luxury Exploration',
    logoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80',
    website: 'https://classicescape.com',
    sortOrder: 6,
    isActive: true,
  },
  {
    id: 'bp_7',
    name: 'ZynCRM',
    category: 'SaaS & Enterprise Growth',
    logoUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&auto=format&fit=crop&q=80',
    website: 'https://zyncrm.com',
    sortOrder: 7,
    isActive: true,
  },
  {
    id: 'bp_8',
    name: 'Chicago Pizza',
    category: 'F&B Food Chain',
    logoUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80',
    website: 'https://chicagopizza.in',
    sortOrder: 8,
    isActive: true,
  },
  {
    id: 'bp_9',
    name: 'Little Genius',
    category: 'Kids Education & Learning',
    logoUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&auto=format&fit=crop&q=80',
    website: 'https://littlegenius.in',
    sortOrder: 9,
    isActive: true,
  },
  {
    id: 'bp_10',
    name: 'Shriram Capital PPLT20',
    category: 'Sports & Cricket League',
    logoUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=300&auto=format&fit=crop&q=80',
    website: 'https://shriramcapital.com',
    sortOrder: 10,
    isActive: true,
  },
  {
    id: 'bp_11',
    name: 'Nykaa',
    category: 'Beauty & Wellness',
    logoUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=80',
    website: 'https://nykaa.com',
    sortOrder: 11,
    isActive: true,
  },
  {
    id: 'bp_12',
    name: 'boAt',
    category: 'Audio & Lifestyle Wearables',
    logoUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
    website: 'https://boat-lifestyle.com',
    sortOrder: 12,
    isActive: true,
  },
  {
    id: 'bp_13',
    name: 'Mamaearth',
    category: 'Toxin-Free D2C Beauty',
    logoUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=80',
    website: 'https://mamaearth.in',
    sortOrder: 13,
    isActive: true,
  },
  {
    id: 'bp_14',
    name: 'Swiggy',
    category: 'Food & Quick Commerce',
    logoUrl: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=300&auto=format&fit=crop&q=80',
    website: 'https://swiggy.com',
    sortOrder: 14,
    isActive: true,
  },
  {
    id: 'bp_15',
    name: 'Zomato',
    category: 'Restaurant Discovery',
    logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80',
    website: 'https://zomato.com',
    sortOrder: 15,
    isActive: true,
  },
  {
    id: 'bp_16',
    name: 'Lenskart',
    category: 'Eyewear Tech',
    logoUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&auto=format&fit=crop&q=80',
    website: 'https://lenskart.com',
    sortOrder: 16,
    isActive: true,
  },
];

let memoryBrandPartners: BrandPartner[] = [...INITIAL_BRAND_PARTNERS];

// Helper to ensure table exists in MySQL
async function ensureBrandTable() {
  try {
    await dbQuery(`
      CREATE TABLE IF NOT EXISTS \`partner_brands\` (
        \`id\` VARCHAR(64) PRIMARY KEY,
        \`name\` VARCHAR(120) NOT NULL,
        \`category\` VARCHAR(100) DEFAULT 'Brand Partner',
        \`logo_url\` VARCHAR(500) NOT NULL,
        \`website\` VARCHAR(255) DEFAULT NULL,
        \`sort_order\` INT DEFAULT 0,
        \`is_active\` BOOLEAN DEFAULT TRUE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  } catch (err) {
    // ignore
  }
}

export async function getPartnerBrands(req: Request, res: Response) {
  await ensureBrandTable();
  try {
    const dbRows = await dbQuery('SELECT * FROM partner_brands WHERE is_active = TRUE ORDER BY sort_order ASC, created_at DESC');
    // If table exists and has rows, return them; if table is empty return empty (don't fall to hardcoded defaults)
    if (dbRows !== null && dbRows !== undefined) {
      const brands: BrandPartner[] = (dbRows || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        logoUrl: r.logo_url,
        website: r.website,
        sortOrder: r.sort_order,
        isActive: Boolean(r.is_active),
      }));
      return res.json({ success: true, brands, source: 'mysql' });
    }
  } catch (err) {
    console.warn('MySQL getPartnerBrands error, falling back to memory:', err);
  }

  res.json({ success: true, brands: memoryBrandPartners, source: 'memory' });
}

export async function createPartnerBrand(req: Request, res: Response) {
  await ensureBrandTable();
  try {
    const { name, category = 'Brand Partner', logoUrl, website, sortOrder = 0 } = req.body;

    if (!name || !logoUrl) {
      return res.status(400).json({ success: false, error: 'Brand name and logoUrl are required' });
    }

    const newBrand: BrandPartner = {
      id: `bp_${Date.now()}`,
      name: name.trim(),
      category: category.trim(),
      logoUrl: logoUrl.trim(),
      website: website?.trim() || '',
      sortOrder: Number(sortOrder) || 0,
      isActive: true,
    };

    memoryBrandPartners.unshift(newBrand);

    // MySQL Insert
    await dbQuery(
      `INSERT INTO partner_brands (id, name, category, logo_url, website, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [newBrand.id, newBrand.name, newBrand.category, newBrand.logoUrl, newBrand.website || null, newBrand.sortOrder]
    ).catch(err => console.warn('MySQL partner_brands insert notice:', err));

    res.status(201).json({ success: true, brand: newBrand });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to add partner brand' });
  }
}

export async function deletePartnerBrand(req: Request, res: Response) {
  await ensureBrandTable();
  try {
    const { id } = req.params;
    // Delete from MySQL
    await dbQuery('DELETE FROM partner_brands WHERE id = ?', [id]);
    // Fetch remaining brands
    const dbRows = await dbQuery('SELECT * FROM partner_brands WHERE is_active = TRUE ORDER BY sort_order ASC, created_at DESC');
    const brands: BrandPartner[] = (dbRows || []).map((r: any) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      logoUrl: r.logo_url,
      website: r.website,
      sortOrder: r.sort_order,
      isActive: Boolean(r.is_active),
    }));
    // Update in-memory cache
    memoryBrandPartners = brands;
    res.json({ success: true, message: 'Brand partner removed successfully', brands, source: 'mysql' });
  } catch (err: any) {
    console.warn('Delete brand error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to delete partner brand' });
  }
}
