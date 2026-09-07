import { Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { dbQuery } from '../config/db';
import { creatorsStore } from './creatorController';

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true,
});

export async function uploadImage(req: Request, res: Response) {
  try {
    const { image, creatorId, type = 'avatar' } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, error: 'Image data is required (base64 or URL)' });
    }

    let imageUrl = image;
    const isVideo = type === 'reel_video';

    // If Cloudinary API credentials are provided, upload to Cloudinary CDN
    if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_CLOUD_NAME) {
      try {
        if (isVideo) {
          const uploadResponse = await cloudinary.uploader.upload(image, {
            folder: `social_cults/reels`,
            resource_type: 'video',
            transformation: [
              { quality: 'auto' },
              { fetch_format: 'auto' }
            ]
          });
          imageUrl = uploadResponse.secure_url;
        } else {
          const uploadResponse = await cloudinary.uploader.upload(image, {
            folder: `social_cults/${type}s`,
            resource_type: 'image',
            transformation: [
              { width: type === 'avatar' ? 500 : 1200, crop: 'limit' },
              { quality: 'auto' },
              { fetch_format: 'auto' }
            ]
          });
          imageUrl = uploadResponse.secure_url;
        }
      } catch (cloudErr) {
        console.warn('Cloudinary upload notice:', cloudErr);
      }
    }

    // If creatorId is provided, update the MySQL creators table directly
    if (creatorId) {
      if (type === 'avatar' || type === 'cover') {
        const field = type === 'cover' ? 'cover_image' : 'avatar';
        dbQuery(`UPDATE creators SET ${field} = ? WHERE id = ?`, [imageUrl, creatorId]).catch(err =>
          console.warn('MySQL avatar update notice:', err)
        );

        // Also update in-memory store
        const cIndex = creatorsStore.findIndex(c => c.id === creatorId);
        if (cIndex !== -1) {
          if (type === 'cover') {
            creatorsStore[cIndex].coverImage = imageUrl;
          } else {
            creatorsStore[cIndex].avatar = imageUrl;
          }
        }
      }
      // For reel_video and reel_thumbnail types, the URL is returned and
      // the frontend handles saving it to the portfolio via updateCreatorProfile
    }

    res.json({
      success: true,
      url: imageUrl,
      message: isVideo ? 'Video uploaded successfully' : 'Photo uploaded successfully',
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: 'Failed to upload file' });
  }
}

