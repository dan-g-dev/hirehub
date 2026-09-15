import { Router, Response } from 'express';
import { db } from '../db/store';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/notifications
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const data = await db.getNotifications(req.user.user_id);
  res.json(data);
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const notifId = Number(req.params.id);
  const success = await db.markNotificationAsRead(notifId, req.user.user_id);
  res.json({ success });
});

// PATCH /api/notifications/read-all
router.patch('/read-all', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const success = await db.markAllNotificationsAsRead(req.user.user_id);
  res.json({ success });
});

export default router;
