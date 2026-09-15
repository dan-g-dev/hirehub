import { Router, Response } from 'express';
import { db } from '../db/store';
import { aiService } from '../services/aiService';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// POST /api/ai/cv-match (Match candidate CV against job description)
router.post('/cv-match', optionalAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { job_id, resume_text } = req.body;

    if (!job_id) {
      res.status(400).json({ error: 'Job ID is required.' });
      return;
    }

    const job = await db.getJobRaw(Number(job_id));
    if (!job) {
      res.status(404).json({ error: 'Job listing not found.' });
      return;
    }

    let textToAnalyze = resume_text;

    // If no custom text provided, try to pull from candidate profile
    if (!textToAnalyze && req.user) {
      const profile = await db.getProfileByUserId(req.user.user_id);
      if (profile && profile.cv_extracted_text) {
        textToAnalyze = profile.cv_extracted_text;
      } else if (profile) {
        const skillsText = profile.skills.join(', ');
        const eduText = profile.education.map(e => `${e.degree} at ${e.institution}`).join('; ');
        const expText = profile.experience.map(e => `${e.title} at ${e.company_name}: ${e.description || ''}`).join('; ');
        textToAnalyze = `
Candidate Name: ${req.user.full_name}
Headline: ${profile.headline || ''}
Bio: ${profile.bio || ''}
Skills: ${skillsText}
Education: ${eduText}
Experience: ${expText}
Certifications: ${profile.certifications.map(c => c.name).join(', ')}
        `.trim();
      }
    }

    if (!textToAnalyze || textToAnalyze.trim().length < 15) {
      res.status(400).json({
        error: 'No CV text found. Please upload a CV to your profile or paste your CV text to analyze match.'
      });
      return;
    }

    const matchResult = await aiService.matchResumeWithJob(textToAnalyze, job);

    res.json({
      job_id: job.job_id,
      job_title: job.title,
      company_name: job.company_name,
      match: matchResult,
    });
  } catch (err: any) {
    console.error('[AI Match Error]:', err);
    res.status(500).json({ error: err.message || 'AI CV matching encountered an error.' });
  }
});

export default router;
