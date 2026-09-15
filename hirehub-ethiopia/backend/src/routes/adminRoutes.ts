import { Router, Response } from 'express';
import { db } from '../db/store';
import { seedDatabase } from '../db/seed';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Middleware: all admin routes require ADMIN role
router.use(requireAuth, requireRole('ADMIN'));

// GET /api/admin/stats
router.get('/stats', async (_req: AuthenticatedRequest, res: Response) => {
  const stats = await db.getPlatformStats();
  res.json(stats);
});

// GET /api/admin/users
router.get('/users', async (req: AuthenticatedRequest, res: Response) => {
  const { role, search, is_active } = req.query;
  const list = await db.getUsers({
    role: role as string,
    search: search as string,
    is_active: is_active !== undefined && is_active !== '' ? is_active === 'true' : undefined,
  });
  res.json(list);
});

// PATCH /api/admin/users/:id/toggle-status
router.patch('/users/:id/toggle-status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = Number(req.params.id);
    const updated = await db.toggleUserActive(userId);
    res.json({
      message: `User account has been ${updated.is_active ? 'activated' : 'suspended'}.`,
      user: updated,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to toggle user status.' });
  }
});

// GET /api/admin/companies
router.get('/companies', async (req: AuthenticatedRequest, res: Response) => {
  const { status, search } = req.query;
  const companies = await db.getCompanies({
    status: status as string,
    search: search as string,
  });
  res.json(companies);
});

// PATCH /api/admin/companies/:id/approval
router.patch('/companies/:id/approval', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const compId = Number(req.params.id);
    const { status } = req.body;
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      res.status(400).json({ error: 'Status must be PENDING, APPROVED, or REJECTED.' });
      return;
    }

    const updated = await db.setCompanyApproval(compId, status);
    res.json({
      message: `Company approval status set to ${status}.`,
      company: updated,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update company approval status.' });
  }
});

// GET /api/admin/jobs
router.get('/jobs', async (req: AuthenticatedRequest, res: Response) => {
  const { status, search } = req.query;
  // 'ALL' (the default here) means "every status" — see db.getJobs, which
  // otherwise defaults to OPEN-only when no status is passed at all.
  const result = await db.getJobs({
    q: search as string,
    status: (status as string) || 'ALL',
    limit: 100,
  });
  res.json(result.jobs);
});

// PATCH /api/admin/jobs/:id/toggle-featured
router.patch('/jobs/:id/toggle-featured', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const jobId = Number(req.params.id);
    const job = await db.toggleJobFeatured(jobId);
    res.json({
      message: `Job is now ${job.is_featured ? 'featured on homepage' : 'standard'}.`,
      job,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to toggle featured status.' });
  }
});

// POST /api/admin/reset-data (Reset to initial Ethiopian seed)
router.post('/reset-data', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    await seedDatabase();
    res.json({ message: 'Database successfully reseeded with fresh Ethiopian talent & company data.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to reset demo data.' });
  }
});

export default router;
