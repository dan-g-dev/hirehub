import { Router, Response } from 'express';
import { db } from '../db/store';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/profile (My profile)
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const profile = await db.getProfileByUserId(req.user.user_id);
  if (!profile) {
    res.status(404).json({ error: 'Profile not found.' });
    return;
  }

  res.json({
    user: req.user,
    profile,
  });
});

// PUT /api/profile (Update my profile)
router.put('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const {
      full_name,
      phone_number,
      avatar_url,
      headline,
      bio,
      city_subcity,
      portfolio_url,
      github_url,
      linkedin_url,
      education,
      experience,
      certifications,
      languages,
      skills
    } = req.body;

    // Update base user fields (only if something was actually provided)
    const updatedUser = (full_name || phone_number || avatar_url)
      ? await db.updateUser(req.user.user_id, { full_name, phone_number, avatar_url })
      : req.user;

    // Update profile
    const updatedProfile = await db.updateProfile(req.user.user_id, {
      headline,
      bio,
      city_subcity,
      portfolio_url,
      github_url,
      linkedin_url,
      education,
      experience,
      certifications,
      languages,
      skills,
    });

    res.json({
      message: 'Profile updated successfully.',
      user: updatedUser,
      profile: updatedProfile,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update profile.' });
  }
});

// GET /api/profile/:userId (Public or Employer viewing candidate profile)
router.get('/:userId', async (req: AuthenticatedRequest, res: Response) => {
  const userId = Number(req.params.userId);
  const user = await db.findUserById(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  const profile = await db.getProfileByUserId(userId);
  res.json({
    user: {
      user_id: user.user_id,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
    },
    profile,
  });
});

export default router;
