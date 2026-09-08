import { Request, Response } from 'express';
import { dbQuery } from '../config/db';
import { SavedFolder } from '../types';

let memoryFolders: SavedFolder[] = [];

export async function getShortlists(req: Request, res: Response) {
  try {
    const dbRows = await dbQuery('SELECT * FROM saved_folders ORDER BY created_at DESC');
    if (dbRows && dbRows.length > 0) {
      const folders: SavedFolder[] = dbRows.map((r: any) => ({
        id: r.id,
        name: r.name,
        creatorIds: typeof r.creator_ids === 'string' ? JSON.parse(r.creator_ids) : (r.creator_ids || []),
        createdAt: r.created_at,
      }));
      return res.json({ success: true, folders });
    }
  } catch (err) {
    console.warn('MySQL getShortlists notice:', err);
  }

  res.json({ success: true, folders: memoryFolders });
}

export async function createShortlist(req: Request, res: Response) {
  try {
    const { name, creatorIds = [], userId } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Shortlist name is required' });
    }

    const newFolder: SavedFolder = {
      id: `f_${Date.now()}`,
      name: name.trim(),
      creatorIds: Array.isArray(creatorIds) ? creatorIds : [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    memoryFolders.unshift(newFolder);

    // MySQL Insert
    dbQuery(
      'INSERT INTO saved_folders (id, user_id, name, creator_ids) VALUES (?, ?, ?, ?)',
      [newFolder.id, userId || null, newFolder.name, JSON.stringify(newFolder.creatorIds)]
    ).catch(err => console.warn('MySQL folder insert notice:', err));

    res.status(201).json({ success: true, folder: newFolder });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to create shortlist' });
  }
}

export async function updateShortlist(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, creatorIds } = req.body;

    const folderIndex = memoryFolders.findIndex(f => f.id === id);
    if (folderIndex !== -1) {
      if (name) memoryFolders[folderIndex].name = name;
      if (creatorIds) memoryFolders[folderIndex].creatorIds = creatorIds;
    }

    // MySQL Update
    dbQuery(
      'UPDATE saved_folders SET name = COALESCE(?, name), creator_ids = COALESCE(?, creator_ids) WHERE id = ?',
      [name || null, creatorIds ? JSON.stringify(creatorIds) : null, id]
    ).catch(err => console.warn('MySQL folder update notice:', err));

    res.json({ success: true, message: 'Shortlist updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update shortlist' });
  }
}

export async function deleteShortlist(req: Request, res: Response) {
  try {
    const { id } = req.params;
    memoryFolders = memoryFolders.filter(f => f.id !== id);

    dbQuery('DELETE FROM saved_folders WHERE id = ?', [id]).catch(err =>
      console.warn('MySQL folder delete notice:', err)
    );

    res.json({ success: true, message: 'Shortlist deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete shortlist' });
  }
}
