import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db/store';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Generate safe filename with timestamp
    const safeExt = path.extname(file.originalname).toLowerCase();
    const cleanBase = path.basename(file.originalname, safeExt).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    cb(null, `${cleanBase}_${uniqueSuffix}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext) || file.mimetype.includes('pdf') || file.mimetype.includes('text') || file.mimetype.includes('document')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, or TXT CV files are allowed.'));
    }
  },
});

// Helper for extracting text from text or pdf
async function extractTextFromFile(filePath: string, originalName: string): Promise<string> {
  try {
    const ext = path.extname(originalName).toLowerCase();
    if (ext === '.txt') {
      return fs.readFileSync(filePath, 'utf-8');
    }
    
    // Attempt pdf-parse or fallback buffer extraction
    const dataBuffer = fs.readFileSync(filePath);
    try {
      // Dynamic import or require pdf-parse
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(dataBuffer);
      if (data && data.text && data.text.trim().length > 10) {
        return data.text.trim();
      }
    } catch (pdfErr) {
      console.log('[Resume] pdf-parse extraction note (binary fallback):', pdfErr);
    }

    // Heuristic extraction for ASCII/UTF text inside file
    const rawContent = dataBuffer.toString('latin1');
    const extractedWords = rawContent
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return extractedWords.length > 50 ? extractedWords.slice(0, 5000) : `Extracted CV document content for ${originalName}`;
  } catch (err) {
    console.warn('[Resume] Text extraction warning:', err);
    return `Candidate CV uploaded: ${originalName}`;
  }
}

// POST /api/resumes/upload
router.post('/upload', requireAuth, upload.single('resume'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No CV file uploaded.' });
      return;
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const extractedText = await extractTextFromFile(filePath, originalName);

    const relativeUrl = `/uploads/resumes/${path.basename(filePath)}`;

    // Update student profile
    const updatedProfile = await db.updateProfile(req.user.user_id, {
      cv_url: relativeUrl,
      cv_filename: originalName,
      cv_extracted_text: extractedText,
    });

    // Extract potential skills automatically if candidate profile skills are empty
    if (!updatedProfile.skills || updatedProfile.skills.length === 0) {
      const detectedSkills: string[] = [];
      const skillKeywords = ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Express.js', 'Python', 'SQL', 'PostgreSQL', 'MySQL', 'Tailwind CSS', 'HTML/CSS', 'Git', 'Figma', 'Accounting', 'Peachtree', 'IFRS'];
      for (const kw of skillKeywords) {
        if (extractedText.toLowerCase().includes(kw.toLowerCase())) {
          detectedSkills.push(kw);
        }
      }
      if (detectedSkills.length > 0) {
        await db.updateProfile(req.user.user_id, { skills: detectedSkills });
      }
    }

    res.json({
      message: 'CV uploaded and text extracted successfully!',
      file: {
        filename: originalName,
        url: relativeUrl,
        size: req.file.size,
      },
      extractedTextSample: extractedText.slice(0, 300) + '...',
      profile: await db.getProfileByUserId(req.user.user_id),
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'CV upload failed.' });
  }
});

// POST /api/resumes/parse-pasted-text (Parse pasted CV text directly)
router.post('/parse-text', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { text, title } = req.body;
    if (!text || text.trim().length < 20) {
      res.status(400).json({ error: 'Please provide valid CV text with at least 20 characters.' });
      return;
    }

    const updatedProfile = await db.updateProfile(req.user.user_id, {
      cv_filename: title || 'Pasted_Candidate_Resume.txt',
      cv_extracted_text: text.trim(),
    });

    res.json({
      message: 'CV text updated in your profile!',
      profile: updatedProfile,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update CV text.' });
  }
});

export default router;
