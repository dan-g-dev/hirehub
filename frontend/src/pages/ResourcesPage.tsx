import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Sparkles,
  FileCheck,
  Banknote,
  GraduationCap,
  MessageSquare,
  Compass,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>Ethiopian Career Acceleration Playbook</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Graduate & Job Seeker Resource Center
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Comprehensive guides tailored for Ethiopian university graduates (AAU, ASTU, Hawassa, etc.) and professionals navigating tech, finance, and corporate employment in Addis Ababa.
        </p>
      </div>

      {/* Guide Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Guide 1: Resume Formatting */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <FileCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              ATS-Optimized Resumes for Ethiopian Employers
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              How to structure your CV to pass modern Applicant Tracking Systems used by Safaricom, CBE, and Ethiopian tech startups:
            </p>
            <ul className="space-y-2 text-xs text-slate-700 pt-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Keep single-column standard PDF format with clean sans-serif typography.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Clearly highlight your Ethiopian University (AAU, ASTU, etc.), CGPA, and thesis capstone project.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Include bilingual capabilities (Amharic, English, Afaan Oromo) and relevant technical stack keywords.</span>
              </li>
            </ul>
          </div>
          <Link
            to="/student/profile"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 pt-4"
          >
            <span>Test Your CV with AI ATS Matcher</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Guide 2: Ethiopian Salary & Tax Compensation */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Banknote className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Salary Negotiation in Ethiopian Birr (ETB)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Navigating Ethiopian gross vs. net compensation, allowances, and statutory deductions:
            </p>
            <ul className="space-y-2 text-xs text-slate-700 pt-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Entry-Level Range:</strong> Typically ETB 15,000 – 35,000/mo for engineering and finance graduates in Addis Ababa.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Allowances:</strong> Transportation (tax-free up to certain limits), communication, and hardship allowances.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Deductions:</strong> Ethiopian progressive personal income tax (0% up to 35%) and 7% employee pension contribution.</span>
              </li>
            </ul>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 pt-4"
          >
            <span>Browse Jobs with Transparent ETB Salaries</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Guide 3: Interview Prep */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Technical & Corporate Interview Preparation
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              How to excel in multi-stage interviews at Ethiopian fintechs, telecoms, and international NGOs:
            </p>
            <ul className="space-y-2 text-xs text-slate-700 pt-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>Be prepared for live algorithmic challenges and system architecture discussions on Ethiopian payment integrations (Telebirr, CBE Birr).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>Use the STAR method (Situation, Task, Action, Result) to describe team leadership in university hackathons.</span>
              </li>
            </ul>
          </div>
          <Link
            to="/jobs?category=Software%20Development"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 pt-4"
          >
            <span>Explore Tech Openings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Guide 4: Ethiopian Startup Ecosystem */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              The Addis Ababa Tech & Innovation Ecosystem
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Connecting with innovation hubs, incubators, and startup founders in Bole, Kazanchis, and Sarbet:
            </p>
            <ul className="space-y-2 text-xs text-slate-700 pt-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Active sectors: Fintech (National Switch / EthSwitch), Agritech, Logistics/Ride-hailing, Healthtech.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Participate in local tech meetups (Google Developer Groups Addis, ALX Ethiopia, IEEE AAU).</span>
              </li>
            </ul>
          </div>
          <Link
            to="/companies"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 pt-4"
          >
            <span>View Verified Ethiopian Companies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
};
