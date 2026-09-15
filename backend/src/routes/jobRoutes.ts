import { Router, Response } from 'express';
import { db } from '../db/store';
import { requireAuth, optionalAuth, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { emailService } from '../services/emailService';

const router = Router();

// GET /api/jobs (Search & Filter)
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      q,
      location,
      category,
      job_type,
      experience_level,
      workplace_type,
      salary_min,
      salary_max,
      company_id,
      is_featured,
      status,
      sort,
      page,
      limit
    } = req.query;

    const result = await db.getJobs({
      q: q as string,
      location: location as string,
      category: category as string,
      job_type: job_type as string,
      experience_level: experience_level as string,
      workplace_type: workplace_type as string,
      salary_min: salary_min ? Number(salary_min) : undefined,
      salary_max: salary_max ? Number(salary_max) : undefined,
      company_id: company_id ? Number(company_id) : undefined,
      is_featured: is_featured ? is_featured === 'true' : undefined,
      status: status as string,
      sort: sort as string,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 12,
      current_user_id: req.user?.user_id,
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch jobs.' });
  }
});

// GET /api/jobs/suggestions (Autocomplete)
router.get('/suggestions', async (req: AuthenticatedRequest, res: Response) => {
  const query = req.query.q as string;
  const suggestions = await db.getJobSuggestions(query || '');
  res.json({ suggestions });
});

// GET /api/jobs/categories
router.get('/categories', async (_req: AuthenticatedRequest, res: Response) => {
  const categoriesWithCounts = await db.getCategoriesWithCounts();
  res.json(categoriesWithCounts);
});

// GET /api/jobs/locations
router.get('/locations', async (_req: AuthenticatedRequest, res: Response) => {
  res.json(await db.getLocations());
});

// GET /api/jobs/:id (Job Detail)
router.get('/:id', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  const jobId = Number(req.params.id);
  const job = await db.getJobById(jobId, req.user?.user_id);
  if (!job) {
    res.status(404).json({ error: 'Job listing not found.' });
    return;
  }

  const company = await db.getCompanyById(job.company_id);
  const relatedJobs = await db.getRelatedJobs(job.category_name, job.job_id, 3);

  res.json({
    job,
    company,
    relatedJobs,
  });
});

// POST /api/jobs/:id/save (Toggle save/bookmark)
router.post('/:id/save', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const jobId = Number(req.params.id);
    const result = await db.toggleSaveJob(req.user.user_id, jobId);
    res.json({
      message: result.is_saved ? 'Job saved to your bookmarks.' : 'Job removed from bookmarks.',
      is_saved: result.is_saved,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to toggle saved job.' });
  }
});

// POST /api/jobs/:id/apply (Submit job application)
router.post('/:id/apply', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    if (req.user.role !== 'JOB_SEEKER') {
      res.status(403).json({ error: 'Only Job Seekers and Students can submit job applications.' });
      return;
    }

    const jobId = Number(req.params.id);
    const { cover_letter, additional_notes, resume_url, resume_filename, resume_extracted_text, ai_match_score, ai_match_feedback } = req.body;

    const application = await db.createApplication({
      job_id: jobId,
      user_id: req.user.user_id,
      cover_letter,
      additional_notes,
      resume_url,
      resume_filename,
      resume_extracted_text,
      ai_match_score: ai_match_score ? Number(ai_match_score) : undefined,
      ai_match_feedback,
    });

    const job = await db.getJobRaw(jobId);
    if (job) {
      emailService.sendStatusUpdateEmail({
        to: req.user.email,
        applicantName: req.user.full_name,
        jobTitle: job.title,
        companyName: job.company_name,
        status: 'Applied',
        customMessage: 'Your application has been received and added to the hiring manager’s review queue.',
        subject: `Application Submitted: ${job.title} at ${job.company_name}`,
      });
    }

    res.status(201).json({
      message: 'Application submitted successfully!',
      application,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to submit application.' });
  }
});

// POST /api/jobs (Create Job — Employer only)
router.post('/', requireAuth, requireRole('EMPLOYER', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    let company = await db.getCompanyByUserId(req.user.user_id);
    if (!company && req.user.role === 'ADMIN' && req.body.company_id) {
      company = await db.getCompanyById(Number(req.body.company_id));
    }

    if (!company) {
      res.status(400).json({ error: 'Employer company profile not found. Please set up your company profile first.' });
      return;
    }

    const {
      title,
      category_id,
      job_type,
      experience_level,
      location_city,
      location_subcity,
      workplace_type,
      salary_type,
      salary_min,
      salary_max,
      salary_exact,
      description,
      responsibilities,
      requirements,
      required_skills,
      preferred_skills,
      benefits,
      deadline,
      is_featured,
    } = req.body;

    if (!title || !description || !deadline) {
      res.status(400).json({ error: 'Title, description, and deadline are required fields.' });
      return;
    }

    const createdJob = await db.createJob(company.company_id, {
      title,
      category_id: Number(category_id) || 1,
      job_type,
      experience_level,
      location_city,
      location_subcity,
      workplace_type,
      salary_type,
      salary_min: salary_min ? Number(salary_min) : undefined,
      salary_max: salary_max ? Number(salary_max) : undefined,
      salary_exact: salary_exact ? Number(salary_exact) : undefined,
      description,
      responsibilities: Array.isArray(responsibilities) ? responsibilities : [responsibilities],
      requirements: Array.isArray(requirements) ? requirements : [requirements],
      required_skills: Array.isArray(required_skills) ? required_skills : ['Communication'],
      preferred_skills: Array.isArray(preferred_skills) ? preferred_skills : [],
      benefits: Array.isArray(benefits) ? benefits : [],
      deadline,
      is_featured: Boolean(is_featured),
    });

    res.status(201).json({
      message: 'Job posted successfully.',
      job: createdJob,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to post job.' });
  }
});

// PUT /api/jobs/:id (Update Job)
router.put('/:id', requireAuth, requireRole('EMPLOYER', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const jobId = Number(req.params.id);
    const existingJob = await db.getJobRaw(jobId);
    if (!existingJob) {
      res.status(404).json({ error: 'Job not found.' });
      return;
    }

    // Verify ownership
    if (req.user?.role === 'EMPLOYER') {
      const company = await db.getCompanyByUserId(req.user.user_id);
      if (!company || company.company_id !== existingJob.company_id) {
        res.status(403).json({ error: 'You are not authorized to edit this job posting.' });
        return;
      }
    }

    const updatedJob = await db.updateJob(jobId, req.body);
    res.json({
      message: 'Job posting updated successfully.',
      job: updatedJob,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update job.' });
  }
});

// DELETE /api/jobs/:id (Close/Delete Job)
router.delete('/:id', requireAuth, requireRole('EMPLOYER', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const jobId = Number(req.params.id);
    const existingJob = await db.getJobRaw(jobId);
    if (!existingJob) {
      res.status(404).json({ error: 'Job not found.' });
      return;
    }

    if (req.user?.role === 'EMPLOYER') {
      const company = await db.getCompanyByUserId(req.user.user_id);
      if (!company || company.company_id !== existingJob.company_id) {
        res.status(403).json({ error: 'You are not authorized to delete this job posting.' });
        return;
      }
    }

    await db.deleteJob(jobId);
    res.json({ message: 'Job posting deleted successfully.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to delete job.' });
  }
});

export default router;
