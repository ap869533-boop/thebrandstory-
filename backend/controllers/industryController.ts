import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { dbQueryStrict } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export const getIndustries = async (_req: any, res: Response) => {
  try {
    const rows = await dbQueryStrict('SELECT id, name FROM industries ORDER BY name ASC');
    res.json({ success: true, industries: rows });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const addIndustry = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ success: false, error: 'Industry name is required' });

    const id = uuidv4();
    await dbQueryStrict('INSERT INTO industries (id, name) VALUES (?, ?)', [id, name.trim()]);

    const rows: any = await dbQueryStrict('SELECT id, name FROM industries WHERE id = ?', [id]);
    res.json({ success: true, industry: rows[0] });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, error: 'Industry already exists' });
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteIndustry = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, error: 'Industry ID is required' });
    await dbQueryStrict('DELETE FROM industries WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
