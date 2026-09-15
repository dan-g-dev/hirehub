// ============================================================
// HIREHUB ETHIOPIA — MYSQL DATA STORE
//
// All queries go through the mysql2 promise pool in ../config/db.
// Every public method here is async and returns a Promise — route
// handlers must `await` these calls (they already do, see the
// route files under src/routes).
// ============================================================

import bcrypt from 'bcryptjs';
import { pool } from '../config/db';
import {
  User,
  StudentProfile,
  Company,
  Job,
  Application,
  NotificationItem,
  Category,
  LocationItem,
  PlatformStats,
  ApplicationStatus,
  AIMatchResult,
  NotificationType,
} from '../types';

// ------------------------------------------------------------
// Small helpers: turn a MySQL row into the shape the rest of the
// app expects. JSON columns come back already parsed by mysql2,
// but may be `null` for rows created before a field existed, so
// each helper falls back to a sensible empty value.
// ------------------------------------------------------------

function asArray<T>(value: unknown, fallback: T[] = []): T[] {
  if (Array.isArray(value)) return value as T[];
  return fallback;
}

function mapProfileRow(row: any): StudentProfile {
  return {
    profile_id: row.profile_id,
    user_id: row.user_id,
    headline: row.headline || undefined,
    bio: row.bio || undefined,
    city_subcity: row.city_subcity || undefined,
    portfolio_url: row.portfolio_url || undefined,
    github_url: row.github_url || undefined,
    linkedin_url: row.linkedin_url || undefined,
    cv_url: row.cv_url || undefined,
    cv_filename: row.cv_filename || undefined,
    cv_extracted_text: row.cv_extracted_text || undefined,
    profile_completion_percentage: row.profile_completion_percentage ?? 20,
    education: asArray(row.education),
    experience: asArray(row.experience),
    certifications: asArray(row.certifications),
    languages: asArray(row.languages),
    skills: asArray<string>(row.skills),
  };
}

function mapCompanyRow(row: any): Company {
  return {
    company_id: row.company_id,
    user_id: row.user_id,
    name: row.name,
    slug: row.slug,
    logo_url: row.logo_url || undefined,
    cover_url: row.cover_url || undefined,
    industry: row.industry || '',
    website: row.website || undefined,
    about: row.about || '',
    company_size: row.company_size || '',
    founded_year: row.founded_year || undefined,
    city: row.city || '',
    subcity: row.subcity || undefined,
    approval_status: row.approval_status,
    created_at: row.created_at,
    open_positions_count: row.open_positions_count ?? 0,
  };
}

function mapJobRow(row: any): Job {
  return {
    job_id: row.job_id,
    company_id: row.company_id,
    company_name: row.company_name,
    company_logo: row.company_logo || undefined,
    company_slug: row.company_slug || undefined,
    company_city: row.company_city || undefined,
    title: row.title,
    category_id: row.category_id,
    category_name: row.category_name,
    job_type: row.job_type,
    experience_level: row.experience_level,
    location_city: row.location_city,
    location_subcity: row.location_subcity || undefined,
    workplace_type: row.workplace_type,
    salary_type: row.salary_type,
    salary_min: row.salary_min ?? undefined,
    salary_max: row.salary_max ?? undefined,
    salary_exact: row.salary_exact ?? undefined,
    currency: row.currency,
    description: row.description,
    responsibilities: asArray<string>(row.responsibilities),
    requirements: asArray<string>(row.requirements),
    required_skills: asArray<string>(row.required_skills),
    preferred_skills: asArray<string>(row.preferred_skills),
    benefits: asArray<string>(row.benefits),
    deadline: row.deadline,
    status: row.status,
    is_featured: Boolean(row.is_featured),
    views_count: row.views_count,
    applications_count: row.applications_count,
    created_at: row.created_at,
    is_saved: row.is_saved !== undefined ? Boolean(row.is_saved) : undefined,
  };
}

function mapApplicationRow(row: any): Application {
  return {
    application_id: row.application_id,
    job_id: row.job_id,
    user_id: row.user_id,
    student_name: row.student_name,
    student_email: row.student_email,
    student_phone: row.student_phone || undefined,
    student_avatar: row.student_avatar || undefined,
    student_headline: row.student_headline || undefined,
    job_title: row.job_title,
    company_name: row.company_name || undefined,
    company_logo: row.company_logo || undefined,
    job_type: row.job_type || undefined,
    job_city: row.job_city || undefined,
    job_subcity: row.job_subcity || undefined,
    resume_url: row.resume_url || undefined,
    resume_filename: row.resume_filename || undefined,
    resume_extracted_text: row.resume_extracted_text || undefined,
    cover_letter: row.cover_letter || undefined,
    additional_notes: row.additional_notes || undefined,
    status: row.status,
    ai_match_score: row.ai_match_score ?? undefined,
    ai_match_feedback: row.ai_match_feedback || undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
    status_history: asArray(row.status_history),
  };
}

// Shared SELECT fragment used everywhere a fully "joined" Job is needed.
const JOB_SELECT = `
  SELECT
    j.*,
    c.name AS company_name,
    c.logo_url AS company_logo,
    c.slug AS company_slug,
    c.city AS company_city,
    cat.name AS category_name
  FROM jobs j
  JOIN companies c ON c.company_id = j.company_id
  JOIN categories cat ON cat.category_id = j.category_id
`;

// Shared SELECT fragment for a fully "joined" Application.
const APPLICATION_SELECT = `
  SELECT
    a.*,
    u.full_name AS student_name,
    u.email AS student_email,
    u.phone_number AS student_phone,
    u.avatar_url AS student_avatar,
    sp.headline AS student_headline,
    j.title AS job_title,
    j.job_type AS job_type,
    j.location_city AS job_city,
    j.location_subcity AS job_subcity,
    c.name AS company_name,
    c.logo_url AS company_logo
  FROM applications a
  JOIN users u ON u.user_id = a.user_id
  JOIN jobs j ON j.job_id = a.job_id
  JOIN companies c ON c.company_id = j.company_id
  LEFT JOIN student_profiles sp ON sp.user_id = a.user_id
`;

// password_hash must NEVER be selected as part of a User object that
// might be sent back to a client — only verifyPassword() below reads it.
const USER_PUBLIC_COLUMNS = 'user_id, full_name, email, role, phone_number, avatar_url, is_active, created_at, updated_at';

class DatabaseStore {
  // ------------------------------------------------------------
  // AUTH & USERS
  // ------------------------------------------------------------
  public async findUserByEmail(email: string): Promise<User | undefined> {
    const [rows] = await pool.query(
      `SELECT ${USER_PUBLIC_COLUMNS} FROM users WHERE email = ?`,
      [email.trim().toLowerCase()]
    );
    const list = rows as any[];
    return list[0] as User | undefined;
  }

  public async findUserById(id: number): Promise<User | undefined> {
    const [rows] = await pool.query(`SELECT ${USER_PUBLIC_COLUMNS} FROM users WHERE user_id = ?`, [id]);
    const list = rows as any[];
    return list[0] as User | undefined;
  }

  public async getUsers(filter: { role?: string; search?: string; is_active?: boolean }): Promise<User[]> {
    const conditions: string[] = [];
    const params: any[] = [];

    if (filter.role && filter.role !== 'ALL') {
      conditions.push('role = ?');
      params.push(filter.role);
    }
    if (filter.is_active !== undefined) {
      conditions.push('is_active = ?');
      params.push(filter.is_active);
    }
    if (filter.search) {
      conditions.push('(full_name LIKE ? OR email LIKE ?)');
      const q = `%${filter.search}%`;
      params.push(q, q);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(
      `SELECT ${USER_PUBLIC_COLUMNS} FROM users ${where} ORDER BY created_at DESC`,
      params
    );
    return rows as User[];
  }

  public async updateUser(userId: number, updates: Partial<User>): Promise<User> {
    const allowed: (keyof User)[] = ['full_name', 'phone_number', 'avatar_url'];
    const fields: string[] = [];
    const params: any[] = [];

    for (const key of allowed) {
      if (updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(updates[key]);
      }
    }

    if (fields.length > 0) {
      params.push(userId);
      await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`, params);
    }

    const updated = await this.findUserById(userId);
    if (!updated) throw new Error('User not found');
    return updated;
  }

  public async createUser(data: {
    full_name: string;
    email: string;
    password: string;
    role: 'JOB_SEEKER' | 'EMPLOYER' | 'ADMIN';
    phone_number?: string;
    company_name?: string;
  }): Promise<{ user: User; company?: Company; profile?: StudentProfile }> {
    const existing = await this.findUserByEmail(data.email);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const passwordHash = bcrypt.hashSync(data.password, 10);
    const avatarUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80';

    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role, phone_number, avatar_url, is_active)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [data.full_name, data.email.toLowerCase().trim(), passwordHash, data.role, data.phone_number || '+251 9', avatarUrl]
    );
    const userId = (result as any).insertId as number;
    const newUser = await this.findUserById(userId);
    if (!newUser) throw new Error('Failed to create user');

    let createdProfile: StudentProfile | undefined;
    let createdCompany: Company | undefined;

    if (data.role === 'JOB_SEEKER') {
      await pool.query(
        `INSERT INTO student_profiles
          (user_id, headline, bio, city_subcity, profile_completion_percentage, education, experience, certifications, languages, skills)
         VALUES (?, ?, '', 'Addis Ababa', 20, '[]', '[]', '[]', ?, '[]')`,
        [
          userId,
          'Student / Job Seeker looking for opportunities',
          JSON.stringify([
            { language_id: 1, language_name: 'Amharic', proficiency: 'NATIVE' },
            { language_id: 2, language_name: 'English', proficiency: 'FLUENT' },
          ]),
        ]
      );
      createdProfile = await this.getProfileByUserId(userId);
    } else if (data.role === 'EMPLOYER') {
      const cName = data.company_name || `${data.full_name}'s Organization`;
      const baseSlug = cName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const [companyResult] = await pool.query(
        `INSERT INTO companies (user_id, name, slug, industry, about, company_size, city, subcity, approval_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'APPROVED')`,
        [
          userId,
          cName,
          `${baseSlug}-${userId}`,
          'Technology & Business Services',
          'Innovative Ethiopian company creating opportunities for local talent.',
          '11-50',
          'Addis Ababa',
          'Bole',
        ]
      );
      const companyId = (companyResult as any).insertId as number;
      createdCompany = await this.getCompanyById(companyId);
    }

    await this.createNotification({
      user_id: userId,
      title: 'Welcome to HireHub Ethiopia! 🇪🇹',
      message: `Welcome ${data.full_name}. Complete your profile and discover premier Ethiopian career opportunities.`,
      type: 'SYSTEM',
      link_url: data.role === 'JOB_SEEKER' ? '/student/profile' : '/employer/dashboard',
    });

    return { user: newUser, profile: createdProfile, company: createdCompany };
  }

  public async verifyPassword(userId: number, plain: string): Promise<boolean> {
    const [rows] = await pool.query('SELECT password_hash FROM users WHERE user_id = ?', [userId]);
    const list = rows as any[];
    if (!list[0]) return false;
    return bcrypt.compareSync(plain, list[0].password_hash);
  }

  public async toggleUserActive(userId: number): Promise<User> {
    const user = await this.findUserById(userId);
    if (!user) throw new Error('User not found');
    await pool.query('UPDATE users SET is_active = ? WHERE user_id = ?', [!user.is_active, userId]);
    const updated = await this.findUserById(userId);
    if (!updated) throw new Error('User not found');
    return updated;
  }

  // ------------------------------------------------------------
  // PROFILES
  // ------------------------------------------------------------
  public async getProfileByUserId(userId: number): Promise<StudentProfile | undefined> {
    const [rows] = await pool.query('SELECT * FROM student_profiles WHERE user_id = ?', [userId]);
    const list = rows as any[];
    return list[0] ? mapProfileRow(list[0]) : undefined;
  }

  public calculateProfileCompletion(profile: StudentProfile): number {
    let score = 20; // base account
    if (profile.headline && profile.headline.length > 5) score += 10;
    if (profile.bio && profile.bio.length > 20) score += 15;
    if (profile.skills && profile.skills.length >= 3) score += 15;
    if (profile.education && profile.education.length > 0) score += 15;
    if (profile.experience && profile.experience.length > 0) score += 10;
    if (profile.cv_url || profile.cv_extracted_text) score += 15;
    return Math.min(100, score);
  }

  public async updateProfile(userId: number, updates: Partial<StudentProfile>): Promise<StudentProfile> {
    let profile = await this.getProfileByUserId(userId);
    if (!profile) {
      await pool.query(
        `INSERT INTO student_profiles (user_id, profile_completion_percentage, education, experience, certifications, languages, skills)
         VALUES (?, 20, '[]', '[]', '[]', '[]', '[]')`,
        [userId]
      );
      profile = await this.getProfileByUserId(userId);
      if (!profile) throw new Error('Failed to create profile');
    }

    const merged: StudentProfile = { ...profile, ...updates };
    merged.profile_completion_percentage = this.calculateProfileCompletion(merged);

    const jsonFields: (keyof StudentProfile)[] = ['education', 'experience', 'certifications', 'languages', 'skills'];
    const scalarFields: (keyof StudentProfile)[] = [
      'headline', 'bio', 'city_subcity', 'portfolio_url', 'github_url', 'linkedin_url',
      'cv_url', 'cv_filename', 'cv_extracted_text',
    ];

    const fields: string[] = [];
    const params: any[] = [];

    for (const key of scalarFields) {
      if (updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(updates[key]);
      }
    }
    for (const key of jsonFields) {
      if (updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(JSON.stringify(updates[key]));
      }
    }
    fields.push('profile_completion_percentage = ?');
    params.push(merged.profile_completion_percentage);

    params.push(userId);
    await pool.query(`UPDATE student_profiles SET ${fields.join(', ')} WHERE user_id = ?`, params);

    const finalProfile = await this.getProfileByUserId(userId);
    if (!finalProfile) throw new Error('Failed to update profile');
    return finalProfile;
  }

  // ------------------------------------------------------------
  // COMPANIES
  // ------------------------------------------------------------
  private companyBaseSelect(): string {
    return `
      SELECT c.*, (
        SELECT COUNT(*) FROM jobs j WHERE j.company_id = c.company_id AND j.status = 'OPEN'
      ) AS open_positions_count
      FROM companies c
    `;
  }

  public async getCompanies(params?: { search?: string; status?: string; city?: string }): Promise<Company[]> {
    const conditions: string[] = [];
    const values: any[] = [];

    if (params?.status) {
      conditions.push('c.approval_status = ?');
      values.push(params.status);
    }
    if (params?.city) {
      conditions.push('LOWER(c.city) = LOWER(?)');
      values.push(params.city);
    }
    if (params?.search) {
      conditions.push('(c.name LIKE ? OR c.industry LIKE ?)');
      const q = `%${params.search}%`;
      values.push(q, q);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(`${this.companyBaseSelect()} ${where} ORDER BY c.created_at DESC`, values);
    return (rows as any[]).map(mapCompanyRow);
  }

  public async getCompanyById(id: number): Promise<Company | undefined> {
    const [rows] = await pool.query(`${this.companyBaseSelect()} WHERE c.company_id = ?`, [id]);
    const list = rows as any[];
    return list[0] ? mapCompanyRow(list[0]) : undefined;
  }

  public async getCompanyByUserId(userId: number): Promise<Company | undefined> {
    const [rows] = await pool.query(
      `${this.companyBaseSelect()} WHERE c.user_id = ? ORDER BY c.company_id ASC LIMIT 1`,
      [userId]
    );
    const list = rows as any[];
    return list[0] ? mapCompanyRow(list[0]) : undefined;
  }

  public async updateCompany(companyId: number, updates: Partial<Company>): Promise<Company> {
    const allowed: (keyof Company)[] = [
      'name', 'logo_url', 'cover_url', 'industry', 'website', 'about',
      'company_size', 'founded_year', 'city', 'subcity',
    ];
    const fields: string[] = [];
    const params: any[] = [];

    for (const key of allowed) {
      if ((updates as any)[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push((updates as any)[key]);
      }
    }

    if (fields.length > 0) {
      params.push(companyId);
      await pool.query(`UPDATE companies SET ${fields.join(', ')} WHERE company_id = ?`, params);
    }

    const updated = await this.getCompanyById(companyId);
    if (!updated) throw new Error('Company not found');
    return updated;
  }

  public async setCompanyApproval(companyId: number, status: 'APPROVED' | 'REJECTED' | 'PENDING'): Promise<Company> {
    await pool.query('UPDATE companies SET approval_status = ? WHERE company_id = ?', [status, companyId]);
    const updated = await this.getCompanyById(companyId);
    if (!updated) throw new Error('Company not found');
    return updated;
  }

  // ------------------------------------------------------------
  // JOBS (SEARCH, FILTERS, CRUD)
  // ------------------------------------------------------------
  public async getJobs(params: {
    q?: string;
    location?: string;
    category?: string;
    job_type?: string;
    experience_level?: string;
    workplace_type?: string;
    salary_min?: number;
    salary_max?: number;
    company_id?: number;
    is_featured?: boolean;
    status?: string;
    sort?: string;
    page?: number;
    limit?: number;
    current_user_id?: number;
  }): Promise<{ jobs: Job[]; total: number; page: number; totalPages: number }> {
    const conditions: string[] = [];
    const values: any[] = [];

    // Status filter: explicit status filters by that status; 'ALL' means no
    // filter at all (used by the admin job list); no status means OPEN only.
    if (params.status && params.status !== 'ALL') {
      conditions.push('j.status = ?');
      values.push(params.status);
    } else if (!params.status) {
      conditions.push("j.status = 'OPEN'");
    }

    if (params.company_id) {
      conditions.push('j.company_id = ?');
      values.push(params.company_id);
    }
    if (params.is_featured !== undefined) {
      conditions.push('j.is_featured = ?');
      values.push(params.is_featured);
    }
    if (params.q && params.q.trim()) {
      const q = `%${params.q.trim()}%`;
      conditions.push(`(
        j.title LIKE ? OR c.name LIKE ? OR cat.name LIKE ? OR
        CAST(j.required_skills AS CHAR) LIKE ? OR
        j.location_subcity LIKE ? OR j.description LIKE ?
      )`);
      values.push(q, q, q, q, q, q);
    }
    if (params.location && params.location.trim()) {
      const loc = `%${params.location.trim()}%`;
      conditions.push('(j.location_city LIKE ? OR j.location_subcity LIKE ?)');
      values.push(loc, loc);
    }
    if (params.category && params.category.trim() && params.category !== 'all') {
      conditions.push('(cat.name LIKE ? OR j.category_id = ?)');
      values.push(`%${params.category}%`, Number(params.category) || 0);
    }
    if (params.job_type && params.job_type !== 'ALL') {
      conditions.push('j.job_type = ?');
      values.push(params.job_type);
    }
    if (params.experience_level && params.experience_level !== 'ALL') {
      conditions.push('j.experience_level = ?');
      values.push(params.experience_level);
    }
    if (params.workplace_type && params.workplace_type !== 'ALL') {
      conditions.push('j.workplace_type = ?');
      values.push(params.workplace_type);
    }
    if (params.salary_min) {
      conditions.push('COALESCE(j.salary_exact, j.salary_max, j.salary_min, 0) >= ?');
      values.push(params.salary_min);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM jobs j
       JOIN companies c ON c.company_id = j.company_id
       JOIN categories cat ON cat.category_id = j.category_id
       ${where}`,
      values
    );
    const total = (countRows as any[])[0].total as number;

    let orderBy = 'j.created_at DESC';
    if (params.sort === 'salary_high') orderBy = 'COALESCE(j.salary_max, j.salary_exact, 0) DESC';
    else if (params.sort === 'applications') orderBy = 'j.applications_count DESC';
    else if (params.sort === 'deadline') orderBy = 'j.deadline ASC';

    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const offset = (page - 1) * limit;

    let isSavedSelect = '';
    let isSavedJoin = '';
    if (params.current_user_id) {
      isSavedSelect = ', (sj.saved_id IS NOT NULL) AS is_saved';
      isSavedJoin = 'LEFT JOIN saved_jobs sj ON sj.job_id = j.job_id AND sj.user_id = ?';
      values.unshift(params.current_user_id);
    }

    const dataQuery = `
      SELECT
        j.*,
        c.name AS company_name, c.logo_url AS company_logo, c.slug AS company_slug, c.city AS company_city,
        cat.name AS category_name
        ${isSavedSelect}
      FROM jobs j
      JOIN companies c ON c.company_id = j.company_id
      JOIN categories cat ON cat.category_id = j.category_id
      ${isSavedJoin}
      ${where}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(dataQuery, [...values, limit, offset]);

    return {
      jobs: (rows as any[]).map(mapJobRow),
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  public async getJobsByCompany(companyId: number, status?: string): Promise<Job[]> {
    const conditions = ['j.company_id = ?'];
    const values: any[] = [companyId];
    if (status) {
      conditions.push('j.status = ?');
      values.push(status);
    }
    const [rows] = await pool.query(
      `${JOB_SELECT} WHERE ${conditions.join(' AND ')} ORDER BY j.created_at DESC`,
      values
    );
    return (rows as any[]).map(mapJobRow);
  }

  public async getRelatedJobs(categoryName: string, excludeJobId: number, limit = 3): Promise<Job[]> {
    const [rows] = await pool.query(
      `${JOB_SELECT} WHERE cat.name = ? AND j.job_id != ? AND j.status = 'OPEN' ORDER BY j.created_at DESC LIMIT ?`,
      [categoryName, excludeJobId, limit]
    );
    return (rows as any[]).map(mapJobRow);
  }

  public async getJobSuggestions(query: string): Promise<string[]> {
    if (!query || query.trim().length < 2) return [];
    const q = `%${query.trim()}%`;
    const [rows] = await pool.query(
      `SELECT j.title, c.name AS company_name, j.required_skills
       FROM jobs j JOIN companies c ON c.company_id = j.company_id
       WHERE j.status = 'OPEN' AND (j.title LIKE ? OR c.name LIKE ? OR CAST(j.required_skills AS CHAR) LIKE ?)
       LIMIT 25`,
      [q, q, q]
    );

    const needle = query.trim().toLowerCase();
    const suggestions = new Set<string>();
    for (const row of rows as any[]) {
      if (row.title.toLowerCase().includes(needle)) suggestions.add(row.title);
      if (row.company_name.toLowerCase().includes(needle)) suggestions.add(row.company_name);
      for (const skill of asArray<string>(row.required_skills)) {
        if (skill.toLowerCase().includes(needle)) suggestions.add(skill);
      }
    }
    return Array.from(suggestions).slice(0, 6);
  }

  // Fetch a job WITHOUT incrementing its view counter — used internally
  // whenever we just need the current record (e.g. after create/update).
  public async getJobRaw(id: number): Promise<Job | undefined> {
    const [rows] = await pool.query(`${JOB_SELECT} WHERE j.job_id = ?`, [id]);
    const list = rows as any[];
    return list[0] ? mapJobRow(list[0]) : undefined;
  }

  public async getJobById(id: number, currentUserId?: number): Promise<Job | undefined> {
    const existing = await this.getJobRaw(id);
    if (!existing) return undefined;

    await pool.query('UPDATE jobs SET views_count = views_count + 1 WHERE job_id = ?', [id]);

    let is_saved = false;
    if (currentUserId) {
      const [savedRows] = await pool.query(
        'SELECT 1 FROM saved_jobs WHERE user_id = ? AND job_id = ?',
        [currentUserId, id]
      );
      is_saved = (savedRows as any[]).length > 0;
    }

    return { ...existing, views_count: existing.views_count + 1, is_saved };
  }

  public async createJob(companyId: number, data: Partial<Job>): Promise<Job> {
    const company = await this.getCompanyById(companyId);
    if (!company) throw new Error('Company not found');

    const responsibilities = Array.isArray(data.responsibilities) ? data.responsibilities : [data.responsibilities || 'Execute assigned duties.'];
    const requirements = Array.isArray(data.requirements) ? data.requirements : [data.requirements || 'Relevant degree or portfolio.'];
    const requiredSkills = Array.isArray(data.required_skills) ? data.required_skills : ['Problem Solving'];
    const preferredSkills = Array.isArray(data.preferred_skills) ? data.preferred_skills : [];
    const benefits = Array.isArray(data.benefits) ? data.benefits : ['Competitive Ethiopian Birr Salary', 'Health Insurance'];
    const deadline = data.deadline || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    const [result] = await pool.query(
      `INSERT INTO jobs (
        company_id, title, category_id, job_type, experience_level,
        location_city, location_subcity, workplace_type, salary_type,
        salary_min, salary_max, salary_exact, currency, description,
        responsibilities, requirements, required_skills, preferred_skills, benefits,
        deadline, status, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ETB', ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?)`,
      [
        company.company_id,
        data.title || 'Untitled Position',
        data.category_id || 1,
        data.job_type || 'FULL_TIME',
        data.experience_level || 'ENTRY_LEVEL',
        data.location_city || company.city || 'Addis Ababa',
        data.location_subcity || company.subcity || 'Bole',
        data.workplace_type || 'HYBRID',
        data.salary_type || 'RANGE',
        data.salary_min ?? null,
        data.salary_max ?? null,
        data.salary_exact ?? null,
        data.description || '',
        JSON.stringify(responsibilities),
        JSON.stringify(requirements),
        JSON.stringify(requiredSkills),
        JSON.stringify(preferredSkills),
        JSON.stringify(benefits),
        deadline,
        Boolean(data.is_featured),
      ]
    );

    const jobId = (result as any).insertId as number;
    const created = await this.getJobRaw(jobId);
    if (!created) throw new Error('Failed to create job');
    return created;
  }

  public async updateJob(jobId: number, updates: Partial<Job>): Promise<Job> {
    const existing = await this.getJobRaw(jobId);
    if (!existing) throw new Error('Job not found');

    const scalarFields: (keyof Job)[] = [
      'title', 'category_id', 'job_type', 'experience_level', 'location_city', 'location_subcity',
      'workplace_type', 'salary_type', 'salary_min', 'salary_max', 'salary_exact', 'description',
      'deadline', 'status', 'is_featured',
    ];
    const jsonFields: (keyof Job)[] = ['responsibilities', 'requirements', 'required_skills', 'preferred_skills', 'benefits'];

    const fields: string[] = [];
    const params: any[] = [];

    for (const key of scalarFields) {
      if ((updates as any)[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push((updates as any)[key]);
      }
    }
    for (const key of jsonFields) {
      if ((updates as any)[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(JSON.stringify((updates as any)[key]));
      }
    }

    if (fields.length > 0) {
      params.push(jobId);
      await pool.query(`UPDATE jobs SET ${fields.join(', ')} WHERE job_id = ?`, params);
    }

    const updated = await this.getJobRaw(jobId);
    if (!updated) throw new Error('Job not found');
    return updated;
  }

  public async toggleJobFeatured(jobId: number): Promise<Job> {
    const existing = await this.getJobRaw(jobId);
    if (!existing) throw new Error('Job not found');
    await pool.query('UPDATE jobs SET is_featured = ? WHERE job_id = ?', [!existing.is_featured, jobId]);
    const updated = await this.getJobRaw(jobId);
    if (!updated) throw new Error('Job not found');
    return updated;
  }

  public async deleteJob(jobId: number): Promise<boolean> {
    const [result] = await pool.query('DELETE FROM jobs WHERE job_id = ?', [jobId]);
    return (result as any).affectedRows > 0;
  }

  // ------------------------------------------------------------
  // CATEGORIES & LOCATIONS
  // ------------------------------------------------------------
  public async getCategoriesWithCounts(): Promise<Category[]> {
    const [rows] = await pool.query(`
      SELECT cat.*, (
        SELECT COUNT(*) FROM jobs j WHERE j.category_id = cat.category_id AND j.status = 'OPEN'
      ) AS job_count
      FROM categories cat
      ORDER BY cat.category_id ASC
    `);
    return rows as Category[];
  }

  public async getLocations(): Promise<LocationItem[]> {
    const [rows] = await pool.query('SELECT * FROM locations ORDER BY is_popular DESC, city ASC');
    return (rows as any[]).map(row => ({ ...row, is_popular: Boolean(row.is_popular) }));
  }

  // ------------------------------------------------------------
  // APPLICATIONS & ATS PIPELINE
  // ------------------------------------------------------------
  public async createApplication(data: {
    job_id: number;
    user_id: number;
    cover_letter?: string;
    additional_notes?: string;
    resume_url?: string;
    resume_filename?: string;
    resume_extracted_text?: string;
    ai_match_score?: number;
    ai_match_feedback?: AIMatchResult;
  }): Promise<Application> {
    const job = await this.getJobRaw(data.job_id);
    if (!job) throw new Error('Job listing not found');

    const [existingRows] = await pool.query(
      'SELECT 1 FROM applications WHERE job_id = ? AND user_id = ?',
      [data.job_id, data.user_id]
    );
    if ((existingRows as any[]).length > 0) {
      throw new Error('You have already submitted an application for this position.');
    }

    const user = await this.findUserById(data.user_id);
    if (!user) throw new Error('User not found');
    const profile = await this.getProfileByUserId(data.user_id);

    const now = new Date().toISOString();
    const statusHistory = [
      { status: 'APPLIED', note: 'Application successfully received via HireHub Ethiopia.', timestamp: now, changed_by: 'Candidate' },
    ];

    const [result] = await pool.query(
      `INSERT INTO applications (
        job_id, user_id, resume_url, resume_filename, resume_extracted_text,
        cover_letter, additional_notes, status, ai_match_score, ai_match_feedback, status_history
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'APPLIED', ?, ?, ?)`,
      [
        data.job_id,
        data.user_id,
        data.resume_url || profile?.cv_url || '',
        data.resume_filename || profile?.cv_filename || 'Candidate_CV.pdf',
        data.resume_extracted_text || profile?.cv_extracted_text || '',
        data.cover_letter || '',
        data.additional_notes || '',
        data.ai_match_score ?? null,
        data.ai_match_feedback ? JSON.stringify(data.ai_match_feedback) : null,
        JSON.stringify(statusHistory),
      ]
    );

    const applicationId = (result as any).insertId as number;
    await pool.query('UPDATE jobs SET applications_count = applications_count + 1 WHERE job_id = ?', [data.job_id]);

    await this.createNotification({
      user_id: user.user_id,
      title: 'Application Submitted 📨',
      message: `Your application for "${job.title}" at ${job.company_name} was successfully submitted.`,
      type: 'APPLICATION_UPDATE',
      link_url: '/student/applications',
    });

    const company = await this.getCompanyById(job.company_id);
    if (company) {
      await this.createNotification({
        user_id: company.user_id,
        title: `New Applicant for ${job.title}`,
        message: `${user.full_name} submitted an application (${data.ai_match_score ? data.ai_match_score + '% Match' : 'New'}).`,
        type: 'APPLICATION_UPDATE',
        link_url: '/employer/applicants',
      });
    }

    const created = await this.getApplicationById(applicationId);
    if (!created) throw new Error('Failed to create application');
    return created;
  }

  public async getApplications(filter: {
    user_id?: number;
    employer_company_id?: number;
    job_id?: number;
    status?: ApplicationStatus | 'ALL';
    search?: string;
  }): Promise<Application[]> {
    const conditions: string[] = [];
    const values: any[] = [];

    if (filter.user_id) {
      conditions.push('a.user_id = ?');
      values.push(filter.user_id);
    }
    if (filter.job_id) {
      conditions.push('a.job_id = ?');
      values.push(filter.job_id);
    }
    if (filter.employer_company_id) {
      conditions.push('j.company_id = ?');
      values.push(filter.employer_company_id);
    }
    if (filter.status && filter.status !== 'ALL') {
      conditions.push('a.status = ?');
      values.push(filter.status);
    }
    if (filter.search && filter.search.trim()) {
      const q = `%${filter.search.trim()}%`;
      conditions.push('(u.full_name LIKE ? OR j.title LIKE ? OR u.email LIKE ?)');
      values.push(q, q, q);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query(`${APPLICATION_SELECT} ${where} ORDER BY a.created_at DESC`, values);
    return (rows as any[]).map(mapApplicationRow);
  }

  public async getApplicationById(id: number): Promise<Application | undefined> {
    const [rows] = await pool.query(`${APPLICATION_SELECT} WHERE a.application_id = ?`, [id]);
    const list = rows as any[];
    return list[0] ? mapApplicationRow(list[0]) : undefined;
  }

  public async updateApplicationStatus(
    applicationId: number,
    newStatus: ApplicationStatus,
    note?: string,
    changedByName?: string
  ): Promise<Application> {
    const app = await this.getApplicationById(applicationId);
    if (!app) throw new Error('Application not found');

    const historyItem = {
      status: newStatus,
      note: note || `Application status updated to ${newStatus.replace('_', ' ')}.`,
      timestamp: new Date().toISOString(),
      changed_by: changedByName || 'Employer',
    };
    const updatedHistory = [...app.status_history, historyItem];

    await pool.query(
      'UPDATE applications SET status = ?, status_history = ? WHERE application_id = ?',
      [newStatus, JSON.stringify(updatedHistory), applicationId]
    );

    let notifTitle = 'Application Status Updated';
    let notifType: NotificationType = 'APPLICATION_UPDATE';
    if (newStatus === 'SHORTLISTED') {
      notifTitle = 'You Were Shortlisted! 🌟';
      notifType = 'SHORTLISTED';
    } else if (newStatus === 'INTERVIEW') {
      notifTitle = 'Interview Invitation 📅';
      notifType = 'INTERVIEW_INVITE';
    } else if (newStatus === 'ACCEPTED') {
      notifTitle = 'Offer Accepted / Congratulatory Notice 🎉';
    }

    await this.createNotification({
      user_id: app.user_id,
      title: notifTitle,
      message: note || `Your application for "${app.job_title}" is now ${newStatus.replace('_', ' ')}.`,
      type: notifType,
      link_url: '/student/applications',
    });

    const updated = await this.getApplicationById(applicationId);
    if (!updated) throw new Error('Application not found');
    return updated;
  }

  public async withdrawApplication(applicationId: number, userId: number): Promise<Application> {
    const app = await this.getApplicationById(applicationId);
    if (!app) throw new Error('Application not found');
    if (app.user_id !== userId) throw new Error('Unauthorized to withdraw this application');

    const historyItem = {
      status: 'WITHDRAWN' as ApplicationStatus,
      note: 'Candidate withdrew application.',
      timestamp: new Date().toISOString(),
      changed_by: 'Candidate',
    };
    const updatedHistory = [...app.status_history, historyItem];

    await pool.query(
      "UPDATE applications SET status = 'WITHDRAWN', status_history = ? WHERE application_id = ?",
      [JSON.stringify(updatedHistory), applicationId]
    );

    const updated = await this.getApplicationById(applicationId);
    if (!updated) throw new Error('Application not found');
    return updated;
  }

  // ------------------------------------------------------------
  // SAVED JOBS (BOOKMARKS)
  // ------------------------------------------------------------
  public async toggleSaveJob(userId: number, jobId: number): Promise<{ is_saved: boolean }> {
    const [rows] = await pool.query('SELECT saved_id FROM saved_jobs WHERE user_id = ? AND job_id = ?', [userId, jobId]);
    if ((rows as any[]).length > 0) {
      await pool.query('DELETE FROM saved_jobs WHERE user_id = ? AND job_id = ?', [userId, jobId]);
      return { is_saved: false };
    }
    await pool.query('INSERT INTO saved_jobs (user_id, job_id) VALUES (?, ?)', [userId, jobId]);
    return { is_saved: true };
  }

  public async getSavedJobs(userId: number): Promise<Job[]> {
    const [rows] = await pool.query(
      `SELECT
        j.*, c.name AS company_name, c.logo_url AS company_logo, c.slug AS company_slug, c.city AS company_city,
        cat.name AS category_name
       FROM saved_jobs sj
       JOIN jobs j ON j.job_id = sj.job_id
       JOIN companies c ON c.company_id = j.company_id
       JOIN categories cat ON cat.category_id = j.category_id
       WHERE sj.user_id = ?
       ORDER BY sj.created_at DESC`,
      [userId]
    );
    return (rows as any[]).map(row => ({ ...mapJobRow(row), is_saved: true }));
  }

  // ------------------------------------------------------------
  // NOTIFICATIONS
  // ------------------------------------------------------------
  public async createNotification(data: {
    user_id: number;
    title: string;
    message: string;
    type: NotificationType;
    link_url?: string;
  }): Promise<NotificationItem> {
    const [result] = await pool.query(
      'INSERT INTO notifications (user_id, title, message, type, link_url, is_read) VALUES (?, ?, ?, ?, ?, FALSE)',
      [data.user_id, data.title, data.message, data.type, data.link_url || null]
    );
    const notificationId = (result as any).insertId as number;
    const [rows] = await pool.query('SELECT * FROM notifications WHERE notification_id = ?', [notificationId]);
    const row = (rows as any[])[0];
    return { ...row, is_read: Boolean(row.is_read) };
  }

  public async getNotifications(userId: number): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    const [rows] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
      [userId]
    );
    const [countRows] = await pool.query(
      'SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );
    return {
      notifications: (rows as any[]).map(row => ({ ...row, is_read: Boolean(row.is_read) })),
      unreadCount: (countRows as any[])[0].unread as number,
    };
  }

  public async markNotificationAsRead(notificationId: number, userId: number): Promise<boolean> {
    const [result] = await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE notification_id = ? AND user_id = ?',
      [notificationId, userId]
    );
    return (result as any).affectedRows > 0;
  }

  public async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
    return true;
  }

  // ------------------------------------------------------------
  // ADMIN PLATFORM STATISTICS
  // ------------------------------------------------------------
  public async getPlatformStats(): Promise<PlatformStats> {
    const [[userStats]] = await pool.query(`
      SELECT
        COUNT(*) AS totalUsers,
        SUM(role = 'JOB_SEEKER') AS totalStudents,
        SUM(role = 'EMPLOYER') AS totalEmployers
      FROM users
    `) as any;
    const [[jobStats]] = await pool.query(`
      SELECT COUNT(*) AS totalJobs, SUM(status = 'OPEN') AS activeJobs FROM jobs
    `) as any;
    const [[appStats]] = await pool.query(`SELECT COUNT(*) AS totalApplications FROM applications`) as any;
    const [[companyStats]] = await pool.query(`
      SELECT COUNT(*) AS totalCompanies, SUM(approval_status = 'PENDING') AS pendingCompanies FROM companies
    `) as any;

    return {
      totalUsers: Number(userStats.totalUsers) || 0,
      totalStudents: Number(userStats.totalStudents) || 0,
      totalEmployers: Number(userStats.totalEmployers) || 0,
      totalJobs: Number(jobStats.totalJobs) || 0,
      activeJobs: Number(jobStats.activeJobs) || 0,
      totalApplications: Number(appStats.totalApplications) || 0,
      totalCompanies: Number(companyStats.totalCompanies) || 0,
      pendingCompanies: Number(companyStats.pendingCompanies) || 0,
    };
  }
}

export const db = new DatabaseStore();
