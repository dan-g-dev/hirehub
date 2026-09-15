import { Router, Response } from 'express';
import { db } from '../db/store';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { emailService } from '../services/emailService';
import { ApplicationStatus } from '../types';

const router = Router();

// GET /api/applications (List applications)
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { status, job_id, search } = req.query;

    if (req.user.role === 'JOB_SEEKER') {
      const apps = await db.getApplications({
        user_id: req.user.user_id,
        status: status as any,
        search: search as string,
      });
      res.json(apps);
    } else if (req.user.role === 'EMPLOYER') {
      const company = await db.getCompanyByUserId(req.user.user_id);
      if (!company) {
        res.json([]);
        return;
      }

      const apps = await db.getApplications({
        employer_company_id: company.company_id,
        job_id: job_id ? Number(job_id) : undefined,
        status: status as any,
        search: search as string,
      });
      res.json(apps);
    } else if (req.user.role === 'ADMIN') {
      const apps = await db.getApplications({
        job_id: job_id ? Number(job_id) : undefined,
        status: status as any,
        search: search as string,
      });
      res.json(apps);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve applications.' });
  }
});

// GET /api/applications/:id
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const appId = Number(req.params.id);
  const application = await db.getApplicationById(appId);
  if (!application) {
    res.status(404).json({ error: 'Application not found.' });
    return;
  }

  if (req.user?.role === 'JOB_SEEKER' && application.user_id !== req.user.user_id) {
    res.status(403).json({ error: 'Access denied.' });
    return;
  }

  if (req.user?.role === 'EMPLOYER') {
    const company = await db.getCompanyByUserId(req.user.user_id);
    const job = await db.getJobRaw(application.job_id);
    if (!company || !job || job.company_id !== company.company_id) {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }
  }

  const job = await db.getJobRaw(application.job_id);
  const candidateProfile = await db.getProfileByUserId(application.user_id);

  res.json({
    application,
    job,
    candidateProfile,
  });
});

// PATCH /api/applications/:id/status (Employer updates status)
router.patch('/:id/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const appId = Number(req.params.id);
    const { status, note } = req.body;

    if (!status) {
      res.status(400).json({ error: 'New status is required.' });
      return;
    }

    const application = await db.getApplicationById(appId);
    if (!application) {
      res.status(404).json({ error: 'Application not found.' });
      return;
    }

    if (req.user.role === 'EMPLOYER') {
      const company = await db.getCompanyByUserId(req.user.user_id);
      const job = await db.getJobRaw(application.job_id);
      if (!company || !job || job.company_id !== company.company_id) {
        res.status(403).json({ error: 'You are not authorized to manage applicants for this job.' });
        return;
      }
    }

    const updatedApp = await db.updateApplicationStatus(
      appId,
      status as ApplicationStatus,
      note,
      req.user.full_name
    );

    emailService.sendStatusUpdateEmail({
      to: application.student_email,
      applicantName: application.student_name,
      jobTitle: application.job_title || 'Position',
      companyName: application.company_name || 'Employer',
      status: status.replace('_', ' '),
      customMessage: note,
      subject: `Update on your application for ${application.job_title} (${status.replace('_', ' ')})`,
    });

    res.json({
      message: `Application status updated to ${status.replace('_', ' ')}.`,
      application: updatedApp,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update application status.' });
  }
});

// POST /api/applications/:id/withdraw (Student withdraws application)
router.post('/:id/withdraw', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const appId = Number(req.params.id);
    const updated = await db.withdrawApplication(appId, req.user.user_id);
    res.json({
      message: 'Application withdrawn successfully.',
      application: updated,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to withdraw application.' });
  }
});

export default router;
