import React, { useState } from 'react';
import {
  Code,
  Database,
  Sparkles,
  ShieldCheck,
  Globe,
  Layers,
  Server,
  FileCode,
  CheckCircle2,
  Terminal,
  Cpu,
} from 'lucide-react';

export const LearningGuidePage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'ARCH' | 'DB' | 'AI' | 'LOCALIZATION' | 'SECURITY'>('ARCH');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-900">
          <Code className="w-3.5 h-3.5 text-indigo-600" />
          <span>Full-Stack Architecture & Engineering Documentation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          HireHub Ethiopia Technical Reference
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Comprehensive documentation detailing the Express.js API gateway, simulated MySQL relational data store, Gemini 3.7 Flash ATS semantic parser, role-based security, and Ethiopian market localization.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveSection('ARCH')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeSection === 'ARCH' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. Architecture & Stack</span>
        </button>

        <button
          onClick={() => setActiveSection('DB')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeSection === 'DB' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>2. Relational Schema (MySQL)</span>
        </button>

        <button
          onClick={() => setActiveSection('AI')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeSection === 'AI' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>3. Gemini 3.7 Flash AI ATS</span>
        </button>

        <button
          onClick={() => setActiveSection('LOCALIZATION')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeSection === 'LOCALIZATION' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>4. Ethiopian Localization</span>
        </button>

        <button
          onClick={() => setActiveSection('SECURITY')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
            activeSection === 'SECURITY' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>5. Auth & RBAC Security</span>
        </button>
      </div>

      {/* Tab 1: Architecture */}
      {activeSection === 'ARCH' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-700" />
              <span>Full-Stack Single-Container Architecture</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-indigo-900 text-sm block">Frontend Layer</span>
                <p className="text-slate-600 leading-relaxed">
                  React 18 + TypeScript + Vite with Tailwind CSS styling. Dynamic context state for authentication and real-time toast feedback.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono">React 18</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono">Vite</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono">Tailwind CSS</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-emerald-900 text-sm block">Backend API Gateway</span>
                <p className="text-slate-600 leading-relaxed">
                  Express.js server mounting modular REST API routes for authentication, jobs, applicants, companies, and AI CV parsing.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono">Express 4</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono">JWT Auth</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono">Multer</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-purple-900 text-sm block">AI & Data Store</span>
                <p className="text-slate-600 leading-relaxed">
                  Server-side Google GenAI (`gemini-3.7-flash`) with structured JSON schema response and thread-safe relational in-memory database store.
                </p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono">Gemini 3.7</span>
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono">MySQL Store</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Relational Schema */}
      {activeSection === 'DB' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-700" />
              <span>Relational Database Entity Relationship Model</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                <pre>{`-- Core Entities & Foreign Keys:
USERS (user_id PK, email, password_hash, role [JOB_SEEKER, EMPLOYER, ADMIN], full_name, phone_number, status)
  ├── STUDENT_PROFILES (profile_id PK, user_id FK -> USERS, headline, bio, city_subcity, cv_url, cv_extracted_text, skills, education, experience)
  ├── SAVED_JOBS (saved_id PK, user_id FK -> USERS, job_id FK -> JOBS, created_at)
  └── NOTIFICATIONS (notification_id PK, user_id FK -> USERS, title, message, is_read, link)

COMPANIES (company_id PK, user_id FK -> USERS, name, industry, city, subcity, company_size, website, logo_url, verification_status)
  └── JOBS (job_id PK, company_id FK -> COMPANIES, title, category_id FK -> CATEGORIES, job_type, workplace_type, experience_level, location_city, salary_type, salary_min, salary_max, required_skills, status, deadline)
        └── APPLICATIONS (application_id PK, job_id FK -> JOBS, user_id FK -> USERS, status [APPLIED, UNDER_REVIEW, SHORTLISTED, INTERVIEW, ACCEPTED, REJECTED], ai_match_score, ai_match_feedback, cover_letter)`}</pre>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">Normalized Relationships</h4>
                  <p className="text-slate-600">
                    Employers own Company profiles which own Job listings. Job seekers submit Applications linked to Jobs with status audit histories.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">State Seed Datasets</h4>
                  <p className="text-slate-600">
                    Pre-populated with authentic Ethiopian companies (Safaricom Ethiopia, CBE, Ethio Telecom, Ride) and real-world tech & finance job roles.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: AI ATS Integration */}
      {activeSection === 'AI' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-700" />
              <span>Gemini 3.7 Flash ATS Semantic Compatibility Engine</span>
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <p className="leading-relaxed">
                HireHub Ethiopia leverages Google GenAI (<code className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">gemini-3.7-flash</code>) executed strictly on the server-side to compare candidate CVs against target Ethiopian job descriptions.
              </p>

              <div className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-slate-800">
                <pre>{`// Server-Side Strict JSON Schema Evaluation:
const response = await ai.models.generateContent({
  model: 'gemini-3.7-flash',
  contents: [systemPrompt, prompt],
  config: {
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER, description: 'ATS score 0-100' },
        matchedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
        missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
        experienceAnalysis: { type: Type.STRING },
        recommendation: { type: Type.STRING }
      },
      required: ['score', 'matchedSkills', 'missingSkills', 'experienceAnalysis', 'recommendation']
    }
  }
});`}</pre>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1 text-xs">
                <span className="font-bold text-emerald-950">Resilience & Offline Fallback:</span>
                <p className="text-emerald-900 leading-relaxed">
                  If the Gemini API key is unconfigured or rate-limited, the system seamlessly transitions to a robust deterministic keyword token analyzer, ensuring zero downtime for candidates.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Ethiopian Localization */}
      {activeSection === 'LOCALIZATION' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-700" />
              <span>Ethiopian Market Localization & Cultural Calibration</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">Ethiopic Typography & Amharic Support</span>
                <p className="text-slate-600">
                  Embedded <strong>Noto Sans Ethiopic</strong> alongside Plus Jakarta Sans to render Amharic headings (<span className="font-ethiopic font-bold">ሀይርሀብ ኢትዮጵያ</span>) with clean typographic baseline alignment.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">Ethiopian Birr (ETB) Currency Standard</span>
                <p className="text-slate-600">
                  All compensation structures are explicitly denominated in Ethiopian Birr (ETB) with localized monthly salary formatting and Ethiopian income tax insights.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">Subcity & Regional Hub Granularity</span>
                <p className="text-slate-600">
                  Subcity-level filtering for Addis Ababa (Bole, Kazanchis, Kirkos, Piazza, Yeka) as well as primary regional economic zones (Hawassa Industrial Park, Dire Dawa Free Trade Zone).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">Ethiopian University Ecosystem</span>
                <p className="text-slate-600">
                  Direct awareness and dedicated pipelines for Addis Ababa University (AAU), Adama Science & Technology University (ASTU), Hawassa University (HU), and Bahir Dar University (BDU).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Security */}
      {activeSection === 'SECURITY' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-700" />
              <span>Authentication, Authorization & Security Hardening</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-900">Role-Based Access Control (RBAC)</h4>
                <p className="text-slate-600 leading-relaxed">
                  Enforced via server middleware (<code className="font-mono text-indigo-700">authenticateToken</code> and <code className="font-mono text-indigo-700">requireRole(['EMPLOYER', 'ADMIN'])</code>). Endpoints validating job creation, company management, and applicant pipeline progression strictly verify caller privileges.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-900">Demo Role Switcher Architecture</h4>
                <p className="text-slate-600 leading-relaxed">
                  The demo top banner allows instantaneous role switching between <strong>Job Seeker (Candidate)</strong>, <strong>Employer (Enterprise Recruiter)</strong>, and <strong>Super Admin</strong>, issuing genuine JWT session tokens with complete state hydration.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
