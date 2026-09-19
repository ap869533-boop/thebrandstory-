import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables before any application routes or utils are imported
dotenv.config();
if (!process.env.DB_NAME) {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
}

import { getDbPool } from './config/db';
import { runAutoMigrations } from './utils/autoMigrate';

// Modular Route Handlers
import authRoutes from './routes/authRoutes';
import creatorRoutes from './routes/creatorRoutes';
import campaignRoutes from './routes/campaignRoutes';
import enquiryRoutes from './routes/enquiryRoutes';
import aiRoutes from './routes/aiRoutes';
import statsRoutes from './routes/statsRoutes';
import uploadRoutes from './routes/uploadRoutes';
import shortlistRoutes from './routes/shortlistRoutes';
import blogRoutes from './routes/blogRoutes';
import brandPartnerRoutes from './routes/brandPartnerRoutes';
import brandRoutes from './routes/brandRoutes';
import brandInquiryRoutes from './routes/brandInquiryRoutes';
import conversationRoutes from './routes/conversationRoutes';
import postRoutes from './routes/postRoutes';
import { authMiddleware, AuthenticatedRequest } from './middleware/authMiddleware';
import { dbQuery } from './config/db';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const onlineUserIds = new Set<string>();
app.set('onlineUserIds', onlineUserIds);

// Middleware with 50mb limit for uploads
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));
app.use('/api/uploads', express.static(path.resolve(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/** Presence heartbeat — updates last_seen and marks user online without Socket.IO. */
app.post('/api/presence/heartbeat', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ success: false, error: 'Auth required' });
    onlineUserIds.add(req.user.id);
    await dbQuery('UPDATE users SET last_seen_at = NOW() WHERE id = ?', [req.user.id]).catch(() => undefined);
    // Expire stale online markers
    for (const id of [...onlineUserIds]) {
      if (id === req.user.id) continue;
    }
    res.json({ success: true, online: true });
  } catch {
    res.status(500).json({ success: false, error: 'Heartbeat failed' });
  }
});

app.get('/api/presence/status', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const ids = String(req.query.userIds || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 50);
    if (ids.length === 0) return res.json({ success: true, presence: {} });

    const placeholders = ids.map(() => '?').join(',');
    const rows: any = await dbQuery(
      `SELECT id, last_seen_at FROM users WHERE id IN (${placeholders})`,
      ids
    );
    const presence: Record<string, { online: boolean; lastSeenAt: string | null }> = {};
    const now = Date.now();
    for (const id of ids) {
      presence[id] = { online: onlineUserIds.has(id), lastSeenAt: null };
    }
    if (Array.isArray(rows)) {
      for (const r of rows) {
        const last = r.last_seen_at ? new Date(r.last_seen_at).getTime() : 0;
        const recentlyActive = last && now - last < 90_000;
        presence[r.id] = {
          online: onlineUserIds.has(r.id) || Boolean(recentlyActive),
          lastSeenAt: r.last_seen_at || null,
        };
      }
    }
    res.json({ success: true, presence });
  } catch {
    res.status(500).json({ success: false, error: 'Failed to fetch presence' });
  }
});

// Mount Modular API Routes
app.use('/api/auth', authRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/shortlists', shortlistRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/partner-brands', brandPartnerRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/brand-inquiries', brandInquiryRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/creator-content', postRoutes);
app.use('/api', aiRoutes);
app.use('/api', statsRoutes);

// In production, optionally serve frontend dist if hosted as unified app
const possibleDistPaths = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist'),
];

const distPath = possibleDistPaths.find((p) => fs.existsSync(p));
if (distPath && process.env.NODE_ENV === 'production') {
  console.log(`📦 Serving static frontend files from: ${distPath}`);
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Initialize MySQL Pool & Start Server
async function startServer() {
  try {
    await getDbPool();
    console.log('✅ MySQL Database pool ready');
    await runAutoMigrations();
  } catch (err: any) {
    console.warn('⚠️ MySQL connection notice:', err.message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 thebrandsstory. Backend API Server running on http://localhost:${PORT}`);
  });
}

startServer();

export default app;
