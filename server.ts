import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { getDbPool } from './backend/config/db';

// Modular Route Handlers
import authRoutes from './backend/routes/authRoutes';
import creatorRoutes from './backend/routes/creatorRoutes';
import campaignRoutes from './backend/routes/campaignRoutes';
import enquiryRoutes from './backend/routes/enquiryRoutes';
import aiRoutes from './backend/routes/aiRoutes';
import statsRoutes from './backend/routes/statsRoutes';
import uploadRoutes from './backend/routes/uploadRoutes';
import shortlistRoutes from './backend/routes/shortlistRoutes';
import blogRoutes from './backend/routes/blogRoutes';
import brandPartnerRoutes from './backend/routes/brandPartnerRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Middleware with 50mb limit for image uploads
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// Initialize MySQL Pool & Start Server
async function startServer() {
  // Test MySQL Connection in background
  await getDbPool().catch(() => {});

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 thebrandsstory. Modular Backend Server running on http://localhost:${PORT}`);
  });
}

startServer();
