import { Response } from 'express';
import { dbQuery, dbQueryStrict } from '../config/db';
import { SavedFolder } from '../types';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

type StoredFolder = SavedFolder & { userId: string };
let memoryFolders: StoredFolder[] = [];

function databaseFolderId(id: string, userId: string) {
  return id === 'f_default' ? `f_default_${userId}` : id;
}

export async function getShortlists(req: AuthenticatedRequest, res: Response) {
  try {
    const dbRows = await dbQuery('SELECT * FROM saved_folders WHERE user_id = ? ORDER BY created_at DESC', [req.user!.id]);
    if (dbRows && dbRows.length > 0) {
      const folders: SavedFolder[] = dbRows.map((r: any) => ({
        id: r.id === `f_default_${req.user!.id}` ? 'f_default' : r.id,
        name: r.name,
        creatorIds: typeof r.creator_ids === 'string' ? JSON.parse(r.creator_ids) : (r.creator_ids || []),
        createdAt: r.created_at,
      }));
      return res.json({ success: true, folders });
    }
  } catch (err) {
    console.warn('MySQL getShortlists notice:', err);
  }

  res.json({ success: true, folders: memoryFolders.filter((folder) => folder.userId === req.user!.id) });
}

export async function createShortlist(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, creatorIds = [], id } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Shortlist name is required' });
    }

    const newFolder: SavedFolder = {
      id: id || `f_${Date.now()}`,
      name: name.trim(),
      creatorIds: Array.isArray(creatorIds) ? creatorIds : [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    const dbId = databaseFolderId(newFolder.id, req.user!.id);

    // MySQL Insert
    await dbQueryStrict(
      'INSERT INTO saved_folders (id, user_id, name, creator_ids) VALUES (?, ?, ?, ?)',
      [dbId, req.user!.id, newFolder.name, JSON.stringify(newFolder.creatorIds)]
    );

    memoryFolders.unshift({ ...newFolder, userId: req.user!.id });

    res.status(201).json({ success: true, folder: newFolder });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to create shortlist' });
  }
}

export async function updateShortlist(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, creatorIds } = req.body;

    const dbId = databaseFolderId(id, req.user!.id);
    // Update memory store
    const folderIndex = memoryFolders.findIndex(f => f.id === id && f.userId === req.user!.id);
    if (folderIndex !== -1) {
      if (name) memoryFolders[folderIndex].name = name;
      if (creatorIds) memoryFolders[folderIndex].creatorIds = creatorIds;
    } else {
      // Add to memory if not found (e.g., f_default)
      memoryFolders.unshift({
        id,
        name: name || 'My Saved Creators',
        creatorIds: Array.isArray(creatorIds) ? creatorIds : [],
        createdAt: new Date().toISOString().split('T')[0],
        userId: req.user!.id,
      });
    }

    // MySQL UPSERT: try UPDATE first, if 0 rows affected then INSERT
    try {
      const result: any = await dbQueryStrict(
        'UPDATE saved_folders SET name = COALESCE(?, name), creator_ids = COALESCE(?, creator_ids) WHERE id = ? AND user_id = ?',
        [name || null, creatorIds ? JSON.stringify(creatorIds) : null, dbId, req.user!.id]
      );
      // If no rows were updated, insert a new record
      if (result && result.affectedRows === 0) {
        await dbQueryStrict(
          'INSERT INTO saved_folders (id, user_id, name, creator_ids) VALUES (?, ?, ?, ?)',
          [dbId, req.user!.id, name || 'My Saved Creators', JSON.stringify(Array.isArray(creatorIds) ? creatorIds : [])]
        );
      }
    } catch (dbErr) {
      return res.status(503).json({ success: false, error: 'Shortlist could not be saved. Please try again.' });
    }

    res.json({ success: true, message: 'Shortlist updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update shortlist' });
  }
}

export async function deleteShortlist(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    memoryFolders = memoryFolders.filter(f => !(f.id === id && f.userId === req.user!.id));

    await dbQueryStrict('DELETE FROM saved_folders WHERE id = ? AND user_id = ?', [databaseFolderId(id, req.user!.id), req.user!.id]);

    res.json({ success: true, message: 'Shortlist deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete shortlist' });
  }
}
