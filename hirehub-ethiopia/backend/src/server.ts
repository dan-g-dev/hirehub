import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables from backend/.env
dotenv.config();

// Import API routers
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import jobRoutes from './routes/jobRoutes';
import applicationRoutes from './routes/applicationRoutes';
import savedJobRoutes from './routes/savedJobRoutes';
import companyRoutes from './routes/companyRoutes';
import resumeRoutes from './routes/resumeRoutes';
import aiRoutes from './routes/aiRoutes';
import notificationRoutes from './routes/notificationRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Allow the frontend dev server (Vite, default port 5173) to call this API.
// In production, set FRONTEND_URL to your deployed frontend origin.
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Basic middlewares
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static uploads directory for CVs, logos, avatars
const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'HireHub Ethiopia API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// REST API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/saved-jobs', savedJobRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Global 404 handler for unmatched /api routes
app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('====================================================');
  console.log('🇪🇹 HireHub Ethiopia (ሀይርሀብ ኢትዮጵያ) API Server Started');
  console.log(`🚀 Live on: http://0.0.0.0:${PORT}`);
  console.log('====================================================');
});
