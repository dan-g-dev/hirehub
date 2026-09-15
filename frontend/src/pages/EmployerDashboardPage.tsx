import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Job, Application } from '../types';
import api from '../services/api';
import {
  Building2,
  Briefcase,
  Users,
  Calendar,
  Sparkles,
  Plus,
  ArrowRight,
  Eye,
  Clock,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export const EmployerDashboardPage: React.FC = () => {
  const { user, company } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [jobsRes, appsRes] = await Promise.all([
          api.get('/jobs?limit=10'),
          api.get('/applications'),
        ]);

        // Filter to employer's company if set
        const compJobs = company
          ? (jobsRes.data.jobs || []).filter((j: Job) => j.company_id === company.company_id)
          : jobsRes.data.jobs || [];

        setJobs(compJobs);
        setApplications(appsRes.data || []);
      } catch (err) {
        console.error('Failed to load employer dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [company]);

  const totalApplicants = applications.length;
  const activePostings = jobs.length;
  const inInterview = applications.filter((a) => a.status === 'INTERVIEW').length;
  const avgMatch =
    applications.length > 0
      ? Math.round(
          applications.reduce((acc, curr) => acc + (curr.ai_match_score || 75), 0) /
            applications.length
        )
      : 82;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 p-2 flex items-center justify-center shrink-0">
            {company?.logo_url ? (
              <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain" />
            ) : (
              <Building2 className="w-8 h-8 text-emerald-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold">{company?.name || 'Ethiopian Enterprise'}</h1>
              <span className="px-2 py-0.5 rounded bg-indigo-900/60 border border-indigo-700 text-indigo-300 text-[10px] font-bold uppercase">
                Employer ATS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {company?.city}, {company?.subcity} • {company?.industry}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/employer/company"
            className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold transition-colors"
          >
            Edit Company Profile
          </Link>
          <Link
            id="employer-post-job-btn"
            to="/employer/jobs/new"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Vacancy</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900 font-mono">{activePostings}</span>
            <p className="text-xs text-slate-500 font-medium">Active Postings</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-700">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900 font-mono">{totalApplicants}</span>
            <p className="text-xs text-slate-500 font-medium">Total Applicants</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-700">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900 font-mono">{inInterview}</span>
            <p className="text-xs text-slate-500 font-medium">In Interview</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900 font-mono">{avgMatch}%</span>
            <p className="text-xs text-slate-500 font-medium">Avg AI ATS Fit</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Posted Jobs & Recent Applicants */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Active Job Postings */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-700" />
              <span>Published Vacancies ({jobs.length})</span>
            </h2>
            <Link to="/employer/jobs/new" className="text-xs font-bold text-indigo-700 hover:underline">
              + Add New
            </Link>
          </div>

          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.job_id}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/jobs/${job.job_id}`}
                      className="font-bold text-slate-900 text-sm hover:text-indigo-700"
                    >
                      {job.title}
                    </Link>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {job.job_type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-1">
                    {job.location_city} • Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <span className="text-slate-600 font-bold">
                    {job.applications_count} applicants
                  </span>
                  <Link
                    to={`/employer/applicants?job_id=${job.job_id}`}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-indigo-900 transition-colors"
                  >
                    View ATS
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Applicants with AI Match */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>Recent Candidate Submissions</span>
            </h2>
            <Link to="/employer/applicants" className="text-xs font-bold text-emerald-700 hover:underline">
              Full Pipeline &rarr;
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 shadow-xs">
            {applications.length > 0 ? (
              applications.slice(0, 4).map((app) => (
                <Link
                  key={app.application_id}
                  to={`/employer/applicants?applicant_id=${app.application_id}`}
                  className="block p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-indigo-50/50 hover:border-indigo-200 transition-all text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900">{app.applicant_name}</p>
                      <p className="text-slate-500 text-[11px]">{app.job_title}</p>
                    </div>
                    {app.ai_match_score && (
                      <span className="px-2 py-0.5 rounded font-mono font-bold bg-emerald-100 text-emerald-800 text-[10px]">
                        {app.ai_match_score}% Match
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-400">
                    <span>Applied {new Date(app.created_at).toLocaleDateString()}</span>
                    <span className="font-bold text-slate-700">{app.status.replace('_', ' ')}</span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No applicants received yet.</p>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
