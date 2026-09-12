import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import { dbQuery } from '../config/db';
import { creatorsStore } from './creatorController';

const uploadsDir = path.resolve(__dirname, '../uploads');
const allowedTypes = new Set(['avatar', 'cover', 'reel_video', 'reel_thumbnail']);

function ensureUploadsDirectory() {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

function getFileExtension(dataUri: string, type: string) {
  const mimeType = dataUri.match(/^data:([^;]+);base64,/i)?.[1]?.toLowerCase();
  const extensions: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/quicktime': '.mov',
  };
  return extensions[mimeType || ''] || (type === 'reel_video' ? '.mp4' : '.jpg');
}

function removeLocalFile(fileUrl?: string) {
  if (!fileUrl || !fileUrl.includes('/uploads/')) return;
  const fileName = path.basename(new URL(fileUrl, 'http://localhost').pathname);
  const filePath = path.resolve(uploadsDir, fileName);
  if (path.dirname(filePath) !== uploadsDir) return;
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
}

function getPreviousUrl(creatorId: string, type: string) {
  const creator = creatorsStore.find((item) => item.id === creatorId);
  if (!creator) return undefined;
  if (type === 'avatar') return creator.avatar;
  if (type === 'cover') return creator.coverImage;
  return undefined;
}

export async function uploadImage(req: Request, res: Response) {
  try {
    const { image, creatorId, type = 'avatar' } = req.body;
    if (!image || typeof image !== 'string' || !image.startsWith('data:')) {
      return res.status(400).json({ success: false, error: 'A base64 file is required' });
    }
    if (!allowedTypes.has(type)) {
      return res.status(400).json({ success: false, error: 'Unsupported upload type' });
    }

    const encodedData = image.split(',')[1];
    if (!encodedData) {
      return res.status(400).json({ success: false, error: 'Invalid base64 file data' });
    }

    ensureUploadsDirectory();
    const fileName = `${randomUUID()}${getFileExtension(image, type)}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(encodedData, 'base64'));
    // Return a relative URL so the frontend resolves it against the configured API origin.
    const imageUrl = `/uploads/${fileName}`;

    if (creatorId && (type === 'avatar' || type === 'cover')) {
      const field = type === 'cover' ? 'cover_image' : 'avatar';
      await dbQuery(`UPDATE creators SET ${field} = ? WHERE id = ?`, [imageUrl, creatorId]);
      removeLocalFile(getPreviousUrl(creatorId, type));

      const cIndex = creatorsStore.findIndex((c) => c.id === creatorId);
      if (cIndex !== -1) {
        if (type === 'cover') creatorsStore[cIndex].coverImage = imageUrl;
        else creatorsStore[cIndex].avatar = imageUrl;
      }
    }

    res.json({
      success: true,
      url: imageUrl,
      message: type === 'reel_video' ? 'Video uploaded successfully' : 'Photo uploaded successfully',
    });
  } catch (error) {
    console.error('Local upload error:', error);
    res.status(500).json({ success: false, error: 'Failed to save file locally' });
  }
}

export async function deleteImage(req: Request, res: Response) {
  try {
    const { creatorId } = req.params;
    const { type } = req.body;
    if (!creatorId || (type !== 'avatar' && type !== 'cover')) {
      return res.status(400).json({ success: false, error: 'Creator and image type are required' });
    }

    const previousUrl = getPreviousUrl(creatorId, type);
    const field = type === 'cover' ? 'cover_image' : 'avatar';
    await dbQuery(`UPDATE creators SET ${field} = NULL WHERE id = ?`, [creatorId]);
    removeLocalFile(previousUrl);

    const cIndex = creatorsStore.findIndex((c) => c.id === creatorId);
    if (cIndex !== -1) {
      if (type === 'cover') creatorsStore[cIndex].coverImage = '';
      else creatorsStore[cIndex].avatar = '';
    }

    res.json({ success: true, url: '', message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Local delete error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete file locally' });
  }
}
