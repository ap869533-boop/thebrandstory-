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

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

// Middleware with 50mb limit for uploads
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));
app.use('/api/uploads', express.static(path.resolve(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
app.use('/api', aiRoutes);       // /api/ai-matching, /api/natural-search
app.use('/api', statsRoutes);    // /api/health, /api/categories, /api/cities, /api/stats

// In production, optionally serve frontend dist if hosted as unified app
const possibleDistPaths = [
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(process.cwd(), '../frontend/dist'),
];

const distPath = possibleDistPaths.find(p => fs.existsSync(p));
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
  } catch (err: any) {
    console.warn('⚠️ MySQL connection notice:', err.message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 thebrandsstory. Backend API Server running on http://localhost:${PORT}`);
  });
}

startServer();

export default app;
