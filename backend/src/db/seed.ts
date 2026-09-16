// ============================================================
// HIREHUB ETHIOPIA — DATABASE SEEDER
//
// Truncates every table and reloads the realistic Ethiopian demo
// data defined in seedData.ts. Run with `npm run seed`, or via the
// admin "reset demo data" endpoint (POST /api/admin/reset-data).
// ============================================================

import 'dotenv/config';
import { pool } from '../config/db';
import {
  SEED_CATEGORIES,
  SEED_LOCATIONS,
  SEED_USERS,
  SEED_PASSWORDS,
  SEED_STUDENT_PROFILES,
  SEED_COMPANIES,
  SEED_JOBS,
  SEED_APPLICATIONS,
  SEED_SAVED_JOBS,
  SEED_NOTIFICATIONS,
} from './seedData';

export async function seedDatabase(): Promise<void> {
  const conn = await pool.getConnection();
  try {
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of [
      'notifications', 'saved_jobs', 'applications', 'jobs',
      'companies', 'student_profiles', 'users', 'categories', 'locations',
    ]) {
      await conn.query(`TRUNCATE TABLE ${table}`);
    }
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    // 1. Categories
    for (const cat of SEED_CATEGORIES) {
      await conn.query(
        'INSERT INTO categories (category_id, name, name_amharic, slug, icon_name, job_count) VALUES (?, ?, ?, ?, ?, ?)',
        [cat.category_id, cat.name, cat.name_amharic, cat.slug, cat.icon_name, cat.job_count]
      );
    }

    // 2. Locations
    for (const loc of SEED_LOCATIONS) {
      await conn.query(
        'INSERT INTO locations (location_id, city, city_amharic, subcity, region, is_popular) VALUES (?, ?, ?, ?, ?, ?)',
        [loc.location_id, loc.city, loc.city_amharic, loc.subcity, loc.region, loc.is_popular]
      );
    }

    // 3. Users (password hashes come pre-computed from SEED_PASSWORDS —
    // all seeded demo accounts use the password "password123")
    for (const user of SEED_USERS) {
      await conn.query(
        `INSERT INTO users (user_id, full_name, email, password_hash, role, phone_number, avatar_url, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.user_id, user.full_name, user.email, SEED_PASSWORDS[user.user_id],
          user.role, user.phone_number, user.avatar_url, user.is_active,
          new Date(user.created_at), new Date(user.updated_at),
        ]
      );
    }

    // 4. Student profiles
    for (const profile of SEED_STUDENT_PROFILES) {
      await conn.query(
        `INSERT INTO student_profiles
          (profile_id, user_id, headline, bio, city_subcity, portfolio_url, github_url, linkedin_url,
           cv_url, cv_filename, cv_extracted_text, profile_completion_percentage,
           education, experience, certifications, languages, skills)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          profile.profile_id, profile.user_id, profile.headline, profile.bio, profile.city_subcity,
          profile.portfolio_url, profile.github_url, profile.linkedin_url,
          profile.cv_url, profile.cv_filename, profile.cv_extracted_text, profile.profile_completion_percentage,
          JSON.stringify(profile.education), JSON.stringify(profile.experience),
          JSON.stringify(profile.certifications), JSON.stringify(profile.languages), JSON.stringify(profile.skills),
        ]
      );
    }

    // 5. Companies
    for (const company of SEED_COMPANIES) {
      await conn.query(
        `INSERT INTO companies
          (company_id, user_id, name, slug, logo_url, cover_url, industry, website, about,
           company_size, founded_year, city, subcity, approval_status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          company.company_id, company.user_id, company.name, company.slug, company.logo_url, company.cover_url,
          company.industry, company.website_url || company.website || null, company.about,
          company.company_size, company.founded_year || null, company.city, company.subcity,
          company.approval_status || 'APPROVED', new Date(company.created_at),
        ]
      );
    }

    // 6. Jobs
    for (const job of SEED_JOBS) {
      await conn.query(
        `INSERT INTO jobs
          (job_id, company_id, title, category_id, job_type, experience_level,
           location_city, location_subcity, workplace_type, salary_type, salary_min, salary_max, salary_exact,
           currency, description, responsibilities, requirements, required_skills, preferred_skills, benefits,
           deadline, status, is_featured, views_count, applications_count, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          job.job_id, job.company_id, job.title, job.category_id, job.job_type, job.experience_level,
          job.location_city, job.location_subcity, job.workplace_type, job.salary_type,
          job.salary_min ?? null, job.salary_max ?? null, job.salary_exact ?? null,
          job.currency || 'ETB', job.description,
          JSON.stringify(job.responsibilities), JSON.stringify(job.requirements),
          JSON.stringify(job.required_skills), JSON.stringify(job.preferred_skills), JSON.stringify(job.benefits),
          job.deadline, job.status, job.is_featured, job.views_count, job.applications_count,
          new Date(job.created_at),
        ]
      );
    }

    // 7. Applications (denormalized display fields like student_name are
    // reconstructed via JOIN at read time — see store.ts — so only the
    // real columns are inserted here)
    for (const app of SEED_APPLICATIONS) {
      await conn.query(
        `INSERT INTO applications
          (application_id, job_id, user_id, resume_url, resume_filename, resume_extracted_text,
           cover_letter, additional_notes, status, ai_match_score, ai_match_feedback, status_history,
           created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          app.application_id, app.job_id, app.user_id, app.resume_url, app.resume_filename,
          app.resume_extracted_text || null, app.cover_letter || null, app.additional_notes || null,
          app.status, app.ai_match_score ?? null,
          app.ai_match_feedback ? JSON.stringify(app.ai_match_feedback) : null,
          JSON.stringify(app.status_history),
          new Date(app.created_at), new Date(app.updated_at),
        ]
      );
    }

    // 8. Saved jobs
    for (const saved of SEED_SAVED_JOBS) {
      await conn.query(
        'INSERT INTO saved_jobs (saved_id, user_id, job_id, created_at) VALUES (?, ?, ?, ?)',
        [saved.saved_id, saved.user_id, saved.job_id, new Date(saved.created_at)]
      );
    }

    // 9. Notifications
    for (const notif of SEED_NOTIFICATIONS) {
      await conn.query(
        `INSERT INTO notifications (notification_id, user_id, title, message, type, link_url, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          notif.notification_id, notif.user_id, notif.title, notif.message, notif.type,
          notif.link_url || null, notif.is_read, new Date(notif.created_at),
        ]
      );
    }

    // Keep AUTO_INCREMENT counters ahead of the highest seeded ID so new
    // records created through the app don't collide with seed data.
    await conn.query('ALTER TABLE users AUTO_INCREMENT = 100');
    await conn.query('ALTER TABLE student_profiles AUTO_INCREMENT = 100');
    await conn.query('ALTER TABLE companies AUTO_INCREMENT = 100');
    await conn.query('ALTER TABLE jobs AUTO_INCREMENT = 100');
    await conn.query('ALTER TABLE applications AUTO_INCREMENT = 100');
    await conn.query('ALTER TABLE saved_jobs AUTO_INCREMENT = 100');
    await conn.query('ALTER TABLE notifications AUTO_INCREMENT = 100');
  } finally {
    conn.release();
  }
}

// Allow running directly: `npm run seed`
const isMainModule = process.argv[1] && process.argv[1].endsWith('seed.ts');
if (isMainModule) {
  seedDatabase()
    .then(() => {
      console.log('✅ HireHub Ethiopia demo data seeded successfully.');
      return pool.end();
    })
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}
