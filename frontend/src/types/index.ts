// ============================================================
// HIREHUB ETHIOPIA — TYPES & DATA MODELS
// ============================================================

export type UserRole = 'JOB_SEEKER' | 'EMPLOYER' | 'ADMIN';

export type JobType = 
  | 'FULL_TIME' 
  | 'PART_TIME' 
  | 'INTERNSHIP' 
  | 'CONTRACT' 
  | 'FREELANCE' 
  | 'REMOTE' 
  | 'HYBRID';

export type ExperienceLevel = 
  | 'INTERN' 
  | 'ENTRY_LEVEL' 
  | 'MID_LEVEL' 
  | 'SENIOR_LEVEL' 
  | 'DIRECTOR';

export type WorkplaceType = 'ON_SITE' | 'HYBRID' | 'REMOTE';

export type SalaryType = 'EXACT' | 'RANGE' | 'NEGOTIABLE' | 'UNDISCLOSED';

export type ApplicationStatus = 
  | 'APPLIED' 
  | 'UNDER_REVIEW' 
  | 'SHORTLISTED' 
  | 'INTERVIEW' 
  | 'ACCEPTED' 
  | 'REJECTED' 
  | 'WITHDRAWN';

export type CompanyApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type NotificationType = 
  | 'APPLICATION_UPDATE' 
  | 'INTERVIEW_INVITE' 
  | 'JOB_ALERT' 
  | 'SYSTEM' 
  | 'SHORTLISTED';

export type ApplicationStatusHistory = ApplicationTimelineItem;
export type EducationItem = Education;
export type ExperienceItem = Experience;
export type CertificationItem = Certification;
export type LanguageItem = Language;

export interface User {
  user_id: number;
  full_name: string;
  email: string;
  role: UserRole;
  phone_number?: string;
  avatar_url?: string;
  is_active: boolean;
  status?: string;
  created_at: string;
  updated_at: string;
}

export interface Education {
  education_id: number;
  profile_id?: number;
  institution: string;
  degree: string;
  field_of_study?: string;
  start_year: number | string;
  end_year?: number | string;
  is_current?: boolean;
  gpa?: string;
  gpa_or_grade?: string;
}

export interface Experience {
  experience_id: number;
  profile_id?: number;
  title: string;
  company_name: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
}

export interface Certification {
  cert_id: number;
  name: string;
  issuing_org: string;
  issue_date?: string;
  credential_url?: string;
}

export interface Language {
  language_id: number;
  language_name: string;
  proficiency: 'BASIC' | 'CONVERSATIONAL' | 'FLUENT' | 'NATIVE';
}

export interface StudentProfile {
  profile_id: number;
  user_id: number;
  headline?: string;
  bio?: string;
  city_subcity?: string;
  portfolio_url?: string;
  github_url?: string;
  linkedin_url?: string;
  cv_url?: string;
  cv_filename?: string;
  cv_extracted_text?: string;
  profile_completion_percentage: number;
  education: Education[];
  experience: Experience[];
  certifications: Certification[];
  languages: Language[];
  skills: string[];
}

export interface Company {
  company_id: number;
  user_id: number;
  name: string;
  name_amharic?: string;
  slug?: string;
  logo_url?: string;
  cover_url?: string;
  industry: string;
  website?: string;
  website_url?: string;
  about: string;
  company_size: string;
  founded_year?: number;
  city: string;
  subcity?: string;
  address_details?: string;
  verification_status?: string;
  approval_status?: CompanyApprovalStatus;
  created_at: string;
  open_positions_count?: number;
}

export interface Job {
  job_id: number;
  company_id: number;
  company_name: string;
  company_logo?: string;
  company_slug?: string;
  company_city?: string;
  title: string;
  category_id: number;
  category_name: string;
  job_type: JobType;
  experience_level: ExperienceLevel;
  location_city: string;
  location_subcity?: string;
  workplace_type: WorkplaceType;
  
  salary_type: SalaryType;
  salary_min?: number;
  salary_max?: number;
  salary_exact?: number;
  currency: string;
  
  description: string;
  responsibilities: string[];
  requirements: string[];
  required_skills: string[];
  preferred_skills: string[];
  benefits: string[];
  deadline: string;
  status: 'OPEN' | 'CLOSED' | 'ARCHIVED';
  is_featured: boolean;
  views_count: number;
  applications_count: number;
  created_at: string;
  is_saved?: boolean;
}

export interface ApplicationTimelineItem {
  status: ApplicationStatus;
  note?: string;
  timestamp: string;
  changed_by?: string;
}

export interface Application {
  application_id: number;
  job_id: number;
  user_id: number;
  applicant_name?: string;
  applicant_email?: string;
  applicant_phone?: string;
  student_name: string;
  student_email: string;
  student_phone?: string;
  student_avatar?: string;
  student_headline?: string;
  job_title: string;
  company_name?: string;
  company_logo?: string;
  job_type?: JobType;
  job_city?: string;
  job_subcity?: string;
  resume_url?: string;
  resume_filename?: string;
  resume_extracted_text?: string;
  cover_letter?: string;
  additional_notes?: string;
  status: ApplicationStatus;
  ai_match_score?: number;
  ai_match_feedback?: AIMatchResult;
  created_at: string;
  updated_at: string;
  status_history: ApplicationTimelineItem[];
}

export interface AIMatchResult {
  score: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceAnalysis: string;
  recommendation: string;
  strengthsSummary?: string[];
  fitLevel?: 'High' | 'Moderate' | 'Low' | 'Exceptional';
}

export interface NotificationItem {
  notification_id: number;
  user_id: number;
  title: string;
  message: string;
  type: NotificationType;
  link_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface Category {
  category_id: number;
  name: string;
  name_amharic: string;
  slug: string;
  icon_name: string;
  job_count: number;
}

export interface LocationItem {
  location_id: number;
  city: string;
  city_amharic: string;
  subcity?: string;
  region: string;
  is_popular: boolean;
}

export interface PlatformStats {
  total_users?: number;
  total_job_seekers?: number;
  total_employers?: number;
  total_jobs?: number;
  active_jobs?: number;
  total_applications?: number;
  total_companies?: number;
  totalUsers?: number;
  totalStudents?: number;
  totalEmployers?: number;
  totalJobs?: number;
  activeJobs?: number;
  totalApplications?: number;
  pendingCompanies?: number;
  totalCompanies?: number;
}
