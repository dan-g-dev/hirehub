-- ============================================================
-- HIREHUB ETHIOPIA — ሀይርሀብ ኢትዮጵያ
-- DATABASE SCHEMA (MySQL 8.0+)
--
-- Design note: core entities (users, companies, jobs, applications,
-- categories, locations, saved_jobs, notifications) are normalized
-- relational tables with foreign keys. Repeatable sub-data that has
-- no independent identity of its own outside its parent record
-- (a job's list of required skills, a profile's education entries,
-- an application's status timeline) is stored as native MySQL JSON
-- columns rather than separate join tables. This keeps the schema
-- small enough to actually read in one sitting while still being a
-- real, persistent, query-able MySQL database — not an in-memory
-- store. See README.md for the trade-off this implies.
-- ============================================================

CREATE DATABASE IF NOT EXISTS hirehub_ethiopia
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hirehub_ethiopia;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS saved_jobs;
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS student_profiles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS locations;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. USERS
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('JOB_SEEKER', 'EMPLOYER', 'ADMIN') NOT NULL DEFAULT 'JOB_SEEKER',
  phone_number VARCHAR(30) NULL,
  avatar_url VARCHAR(255) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- 2. CATEGORIES
CREATE TABLE categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  name_amharic VARCHAR(100) NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  icon_name VARCHAR(50) NOT NULL DEFAULT 'Briefcase',
  job_count INT DEFAULT 0
) ENGINE=InnoDB;

-- 3. LOCATIONS (Ethiopian cities & subcities, used for search suggestions)
CREATE TABLE locations (
  location_id INT AUTO_INCREMENT PRIMARY KEY,
  city VARCHAR(100) NOT NULL,
  city_amharic VARCHAR(100) NULL,
  subcity VARCHAR(100) NULL,
  region VARCHAR(100) NULL,
  is_popular BOOLEAN DEFAULT FALSE,
  INDEX idx_locations_city (city)
) ENGINE=InnoDB;

-- 4. STUDENT PROFILES (one-to-one with a JOB_SEEKER user)
CREATE TABLE student_profiles (
  profile_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  headline VARCHAR(255) NULL,
  bio TEXT NULL,
  city_subcity VARCHAR(150) NULL,
  portfolio_url VARCHAR(255) NULL,
  github_url VARCHAR(255) NULL,
  linkedin_url VARCHAR(255) NULL,
  cv_url VARCHAR(255) NULL,
  cv_filename VARCHAR(255) NULL,
  cv_extracted_text MEDIUMTEXT NULL,
  profile_completion_percentage INT NOT NULL DEFAULT 20,
  education JSON NULL,
  experience JSON NULL,
  certifications JSON NULL,
  languages JSON NULL,
  skills JSON NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. COMPANIES (one-to-one with an EMPLOYER user's primary account)
CREATE TABLE companies (
  company_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(180) NOT NULL UNIQUE,
  logo_url VARCHAR(255) NULL,
  cover_url VARCHAR(255) NULL,
  industry VARCHAR(150) NULL,
  about TEXT NULL,
  company_size VARCHAR(50) NULL,
  founded_year INT NULL,
  website VARCHAR(255) NULL,
  city VARCHAR(100) NULL,
  subcity VARCHAR(100) NULL,
  approval_status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'APPROVED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_companies_status (approval_status)
) ENGINE=InnoDB;

-- 6. JOBS
CREATE TABLE jobs (
  job_id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  category_id INT NOT NULL,
  job_type ENUM('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT', 'FREELANCE', 'REMOTE', 'HYBRID') NOT NULL DEFAULT 'FULL_TIME',
  experience_level ENUM('INTERN', 'ENTRY_LEVEL', 'MID_LEVEL', 'SENIOR_LEVEL', 'DIRECTOR') NOT NULL DEFAULT 'ENTRY_LEVEL',
  location_city VARCHAR(100) NOT NULL DEFAULT 'Addis Ababa',
  location_subcity VARCHAR(100) NULL,
  workplace_type ENUM('ON_SITE', 'REMOTE', 'HYBRID') NOT NULL DEFAULT 'HYBRID',
  salary_type ENUM('EXACT', 'RANGE', 'NEGOTIABLE', 'UNDISCLOSED') NOT NULL DEFAULT 'NEGOTIABLE',
  salary_min INT NULL,
  salary_max INT NULL,
  salary_exact INT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'ETB',
  description TEXT NOT NULL,
  responsibilities JSON NULL,
  requirements JSON NULL,
  required_skills JSON NULL,
  preferred_skills JSON NULL,
  benefits JSON NULL,
  deadline DATE NOT NULL,
  status ENUM('OPEN', 'CLOSED', 'ARCHIVED') NOT NULL DEFAULT 'OPEN',
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  views_count INT NOT NULL DEFAULT 0,
  applications_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(category_id),
  INDEX idx_jobs_status (status),
  INDEX idx_jobs_category (category_id),
  INDEX idx_jobs_city (location_city),
  INDEX idx_jobs_type (job_type),
  FULLTEXT INDEX idx_jobs_fulltext (title, description)
) ENGINE=InnoDB;

-- 7. APPLICATIONS
CREATE TABLE applications (
  application_id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  user_id INT NOT NULL,
  resume_url VARCHAR(255) NULL,
  resume_filename VARCHAR(255) NULL,
  resume_extracted_text MEDIUMTEXT NULL,
  cover_letter TEXT NULL,
  additional_notes TEXT NULL,
  status ENUM('APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'ACCEPTED', 'REJECTED', 'WITHDRAWN') NOT NULL DEFAULT 'APPLIED',
  ai_match_score INT NULL,
  ai_match_feedback JSON NULL,
  status_history JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_job_application (job_id, user_id),
  FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_applications_status (status)
) ENGINE=InnoDB;

-- 8. SAVED JOBS (bookmarks)
CREATE TABLE saved_jobs (
  saved_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  job_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_saved_job (user_id, job_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(job_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. NOTIFICATIONS
CREATE TABLE notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
  link_url VARCHAR(255) NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_notifications_user (user_id)
) ENGINE=InnoDB;
