import { Router, Response } from 'express';
import { db } from '../db/store';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/saved-jobs
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const savedJobs = await db.getSavedJobs(req.user.user_id);
    res.json(savedJobs);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch saved jobs.' });
  }
});

export default router;
