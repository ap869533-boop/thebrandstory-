import { Request, Response } from 'express';
import { dbQuery } from '../config/db';
import { BrandPartner } from '../types';



let memoryBrandPartners: BrandPartner[] = []; // populated from DB

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
  } catch (err) {
    console.warn('MySQL getPartnerBrands error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch partner brands from database' });
  }
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

    // MySQL Insert
      await dbQuery(
        `INSERT INTO partner_brands (id, name, category, logo_url, website, sort_order, is_active)
        VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
        [newBrand.id, newBrand.name, newBrand.category, newBrand.logoUrl, newBrand.website || null, newBrand.sortOrder]
      ).catch(err => console.warn('MySQL partner_brands insert notice:', err));

      // Refresh in‑memory cache from DB after insert
      const refreshed = await dbQuery('SELECT * FROM partner_brands WHERE is_active = TRUE ORDER BY sort_order ASC, created_at DESC');
      memoryBrandPartners = (refreshed || []).map((r: any) => ({
        id: r.id,
        name: r.name,
        category: r.category,
        logoUrl: r.logo_url,
        website: r.website,
        sortOrder: r.sort_order,
        isActive: Boolean(r.is_active),
      }));

      res.status(201).json({ success: true, brand: newBrand, brands: memoryBrandPartners });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to add partner brand' });
  }
}

export async function deletePartnerBrand(req: Request, res: Response) {
  await ensureBrandTable();
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Brand id is required' });
    }

    // Soft delete from DB so the record remains for audit/history but is no longer active in public slider
    await dbQuery('UPDATE partner_brands SET is_active = FALSE WHERE id = ?', [id]);

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

    memoryBrandPartners = brands;
    return res.json({ success: true, message: 'Brand partner removed successfully', brands, source: 'mysql' });
  } catch (err: any) {
    console.warn('Delete brand error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to delete partner brand' });
  }
}
