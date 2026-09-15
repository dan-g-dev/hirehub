import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { requireAuth, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/companies (Browse companies)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, city, status } = req.query;
    const companies = await db.getCompanies({
      search: search as string,
      city: city as string,
      status: (status as string) || 'APPROVED',
    });
    res.json(companies);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch companies.' });
  }
});

// GET /api/companies/:id (Company details + Open jobs)
router.get('/:id', async (req: Request, res: Response) => {
  const compId = Number(req.params.id);
  const company = await db.getCompanyById(compId);
  if (!company) {
    res.status(404).json({ error: 'Company not found.' });
    return;
  }

  const openJobs = await db.getJobsByCompany(compId, 'OPEN');
  res.json({
    company,
    openJobs,
  });
});

// PUT /api/companies/:id (Update company profile)
router.put('/:id', requireAuth, requireRole('EMPLOYER', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const compId = Number(req.params.id);
    const existing = await db.getCompanyById(compId);
    if (!existing) {
      res.status(404).json({ error: 'Company not found.' });
      return;
    }

    if (req.user?.role === 'EMPLOYER' && existing.user_id !== req.user.user_id) {
      res.status(403).json({ error: 'Unauthorized to edit this company profile.' });
      return;
    }

    const updated = await db.updateCompany(compId, req.body);
    res.json({
      message: 'Company profile updated successfully.',
      company: updated,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update company.' });
  }
});

export default router;
