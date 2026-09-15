import { Router, Request, Response } from 'express';
import { db } from '../db/store';
import { generateToken, requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { full_name, email, password, role, phone_number, company_name } = req.body;

    if (!full_name || !email || !password || !role) {
      res.status(400).json({ error: 'Please provide full name, email, password, and account role.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    if (!['JOB_SEEKER', 'EMPLOYER'].includes(role)) {
      res.status(400).json({ error: 'Role must be either JOB_SEEKER or EMPLOYER.' });
      return;
    }

    const { user, profile, company } = await db.createUser({
      full_name,
      email,
      password,
      role,
      phone_number,
      company_name,
    });

    const token = generateToken(user);

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user,
      profile,
      company,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Please provide both email and password.' });
      return;
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (!user.is_active) {
      res.status(403).json({ error: 'This account has been suspended by the platform administrator.' });
      return;
    }

    const isValid = await db.verifyPassword(user.user_id, password);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user);
    const profile = user.role === 'JOB_SEEKER' ? await db.getProfileByUserId(user.user_id) : undefined;
    const company = user.role === 'EMPLOYER' ? await db.getCompanyByUserId(user.user_id) : undefined;

    res.json({
      message: 'Login successful.',
      token,
      user,
      profile,
      company,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

// POST /api/auth/demo-login (Quick 1-click evaluation login)
router.post('/demo-login', async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    let targetUserId = 1; // Default to Yohannes (Job Seeker)

    if (role === 'EMPLOYER') {
      targetUserId = 4; // Selamawit at EthioTech
    } else if (role === 'ADMIN') {
      targetUserId = 6; // Solomon Mengistu (Admin)
    } else if (role === 'STUDENT_DESIGNER') {
      targetUserId = 2; // Bethlehem (UI/UX)
    }

    const user = await db.findUserById(targetUserId);
    if (!user) {
      res.status(404).json({ error: 'Demo account not found.' });
      return;
    }

    const token = generateToken(user);
    const profile = user.role === 'JOB_SEEKER' ? await db.getProfileByUserId(user.user_id) : undefined;
    const company = user.role === 'EMPLOYER' ? await db.getCompanyByUserId(user.user_id) : undefined;

    res.json({
      message: `Logged in as demo user: ${user.full_name} (${user.role})`,
      token,
      user,
      profile,
      company,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Demo login failed.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const profile = req.user.role === 'JOB_SEEKER' ? await db.getProfileByUserId(req.user.user_id) : undefined;
  const company = req.user.role === 'EMPLOYER' ? await db.getCompanyByUserId(req.user.user_id) : undefined;

  res.json({
    user: req.user,
    profile,
    company,
  });
});

export default router;
