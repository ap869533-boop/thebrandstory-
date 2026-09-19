import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { Response } from 'express';
import { dbQuery } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { detectImageMimeFromBuffer, IMAGE_MIME_EXTENSIONS, haversineKm } from '../utils/validation';

const uploadsDir = path.resolve(__dirname, '../uploads');
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB

const CITY_COORDS: Record<string, { lat: number, lng: number }> = {
  'delhi ncr': { lat: 28.6139, lng: 77.2090 },
  'delhi': { lat: 28.6139, lng: 77.2090 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'noida': { lat: 28.5355, lng: 77.3910 },
  'gurgaon': { lat: 28.4595, lng: 77.0266 },
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'chandigarh': { lat: 30.7333, lng: 76.7794 },
  'lucknow': { lat: 26.8467, lng: 80.9462 },
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
};

function getCreatorCoords(creator: any) {
  if (creator.latitude && creator.longitude) {
    return { lat: Number(creator.latitude), lng: Number(creator.longitude) };
  }
  const city = (creator.current_city || '').toLowerCase();
  for (const key of Object.keys(CITY_COORDS)) {
    if (city === key || city.includes(key)) {
      return CITY_COORDS[key];
    }
  }
  return null;
}

function ensureUploadsDirectory() {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

async function resolveCreatorIdForUser(userId: string): Promise<string | null> {
  const rows: any = await dbQuery('SELECT id FROM creators WHERE id = ? OR user_id = ? LIMIT 1', [userId, userId]);
  if (Array.isArray(rows) && rows.length > 0) return rows[0].id;
  return null;
}

export async function createCreatorPost(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'CREATOR') {
      return res.status(403).json({ success: false, error: 'Only influencers can upload posts' });
    }

    const creatorId = await resolveCreatorIdForUser(req.user.id);
    if (!creatorId) {
      return res.status(400).json({ success: false, error: 'Creator profile not found' });
    }

    const { image, caption } = req.body;
    if (!image || typeof image !== 'string' || !image.startsWith('data:')) {
      return res.status(400).json({ success: false, error: 'A base64 image is required' });
    }

    const mimeMatch = image.match(/^data:([^;]+);base64,/i);
    const declaredMime = (mimeMatch?.[1] || '').toLowerCase();
    if (!declaredMime.startsWith('image/') || declaredMime.includes('svg')) {
      return res.status(400).json({ success: false, error: 'Only photo uploads are allowed (no video)' });
    }
    if (declaredMime.startsWith('video/')) {
      return res.status(400).json({ success: false, error: 'Video uploads are not allowed' });
    }

    const encodedData = image.split(',')[1];
    if (!encodedData) {
      return res.status(400).json({ success: false, error: 'Invalid base64 file data' });
    }

    const buffer = Buffer.from(encodedData, 'base64');
    if (buffer.length > MAX_IMAGE_BYTES) {
      return res.status(400).json({ success: false, error: 'Image must be 8MB or smaller' });
    }

    const sniffed = detectImageMimeFromBuffer(buffer);
    if (!sniffed || !IMAGE_MIME_EXTENSIONS[sniffed]) {
      return res.status(400).json({ success: false, error: 'File is not a valid image (JPEG/PNG/WebP/GIF)' });
    }

    // Reject if declared mime wildly mismatches sniff (allow jpeg/jpg alias)
    if (declaredMime && !declaredMime.includes(sniffed.split('/')[1]) && !(declaredMime === 'image/jpg' && sniffed === 'image/jpeg')) {
      // soft: still require sniffed image
    }

    ensureUploadsDirectory();
    const fileName = `${randomUUID()}${IMAGE_MIME_EXTENSIONS[sniffed]}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);
    const imageUrl = `/api/uploads/${fileName}`;

    const postId = `post_${Date.now()}`;
    await dbQuery(
      `INSERT INTO creator_posts (id, creator_id, image_url, caption) VALUES (?, ?, ?, ?)`,
      [postId, creatorId, imageUrl, caption ? String(caption).slice(0, 500) : null]
    );
    await dbQuery(`UPDATE creators SET total_posts = COALESCE(total_posts, 0) + 1 WHERE id = ?`, [creatorId]).catch(
      () => undefined
    );

    res.status(201).json({
      success: true,
      post: {
        id: postId,
        creatorId,
        imageUrl,
        caption: caption || '',
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('createCreatorPost error:', error);
    res.status(500).json({ success: false, error: 'Failed to upload post' });
  }
}

export async function listCreatorPosts(req: AuthenticatedRequest, res: Response) {
  try {
    const { creatorId } = req.params;
    const rows: any = await dbQuery(
      `SELECT * FROM creator_posts WHERE creator_id = ? OR creator_id IN (SELECT id FROM creators WHERE username = ? OR user_id = ?)
       ORDER BY created_at DESC LIMIT 100`,
      [creatorId, creatorId, creatorId]
    );
    res.json({
      success: true,
      posts: (Array.isArray(rows) ? rows : []).map((r: any) => ({
        id: r.id,
        creatorId: r.creator_id,
        imageUrl: r.image_url,
        caption: r.caption || '',
        createdAt: r.created_at,
      })),
    });
  } catch (error) {
    console.error('listCreatorPosts error:', error);
    res.status(500).json({ success: false, error: 'Failed to list posts' });
  }
}

export async function deleteCreatorPost(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'CREATOR') {
      return res.status(403).json({ success: false, error: 'Only the post owner can delete' });
    }
    const ownerId = await resolveCreatorIdForUser(req.user.id);
    const { postId } = req.params;
    const rows: any = await dbQuery('SELECT * FROM creator_posts WHERE id = ? LIMIT 1', [postId]);
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    if (rows[0].creator_id !== ownerId) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this post' });
    }

    const imageUrl = rows[0].image_url as string;
    await dbQuery('DELETE FROM creator_posts WHERE id = ?', [postId]);
    if (imageUrl && imageUrl.includes('/uploads/')) {
      const fileName = path.basename(imageUrl);
      const filePath = path.resolve(uploadsDir, fileName);
      if (path.dirname(filePath) === uploadsDir && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.json({ success: true });
  } catch (error) {
    console.error('deleteCreatorPost error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete post' });
  }
}

/** Nearby influencers by lat/lng with city-name fallback. */
export async function getNearbyCreators(req: AuthenticatedRequest, res: Response) {
  try {
    const lat = parseFloat(String(req.query.lat || ''));
    const lng = parseFloat(String(req.query.lng || ''));
    const city = String(req.query.city || '').trim();
    const radiusKm = Math.min(parseFloat(String(req.query.radiusKm || '50')) || 50, 200);
    const limit = Math.min(parseInt(String(req.query.limit || '12'), 10) || 12, 40);

    let rows: any[] = [];
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const all: any = await dbQuery(
        `SELECT id, name, username, avatar, current_city, primary_category, followers, starting_price,
                is_verified, latitude, longitude, status
         FROM creators
         WHERE status = 'active'
         LIMIT 1000`
      );
      rows = (Array.isArray(all) ? all : [])
        .map((r: any) => {
          const coords = getCreatorCoords(r);
          return {
            ...r,
            distanceKm: coords ? haversineKm(lat, lng, coords.lat, coords.lng) : 999999,
          };
        })
        .filter((r: any) => r.distanceKm <= radiusKm)
        .sort((a: any, b: any) => a.distanceKm - b.distanceKm)
        .slice(0, limit);
    }

    if (rows.length === 0 && city && city.toLowerCase() !== 'all' && city.toLowerCase() !== 'all india') {
      const all: any = await dbQuery(
        `SELECT id, name, username, avatar, current_city, primary_category, followers, starting_price,
                is_verified, latitude, longitude, status
         FROM creators
         WHERE status = 'active'
         LIMIT 1000`
      );
      
      const cityLower = city.toLowerCase();
      const cityKey = Object.keys(CITY_COORDS).find(k => cityLower === k || cityLower.includes(k) || k.includes(cityLower));
      
      if (cityKey) {
        const cityLat = CITY_COORDS[cityKey].lat;
        const cityLng = CITY_COORDS[cityKey].lng;
        
        rows = (Array.isArray(all) ? all : [])
          .map((r: any) => {
            const coords = getCreatorCoords(r);
            return {
              ...r,
              distanceKm: coords ? haversineKm(cityLat, cityLng, coords.lat, coords.lng) : 999999,
            };
          })
          .filter((r: any) => r.distanceKm <= radiusKm)
          .sort((a: any, b: any) => a.distanceKm - b.distanceKm)
          .slice(0, limit);
      } else {
        rows = (Array.isArray(all) ? all : [])
          .filter((r: any) => {
            const cc = (r.current_city || '').toLowerCase();
            return cc === cityLower || cc.includes(cityLower);
          })
          .map((r: any) => ({ ...r, distanceKm: null }))
          .sort((a: any, b: any) => (b.followers || 0) - (a.followers || 0))
          .slice(0, limit);
      }
    }

    res.json({
      success: true,
      creators: rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        username: r.username,
        avatar: r.avatar,
        currentCity: r.current_city,
        primaryCategory: r.primary_category,
        followers: Number(r.followers) || 0,
        startingPrice: Number(r.starting_price) || 0,
        isVerified: Boolean(r.is_verified),
        distanceKm: r.distanceKm != null ? Math.round(r.distanceKm * 10) / 10 : null,
      })),
    });
  } catch (error) {
    console.error('getNearbyCreators error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch nearby influencers' });
  }
}
