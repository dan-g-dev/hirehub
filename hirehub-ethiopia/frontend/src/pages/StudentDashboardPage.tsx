import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Application, Job } from '../types';
import api from '../services/api';
import { ProfileCompletionCard } from '../components/ProfileCompletionCard';
import { JobCard } from '../components/JobCard';
import { STUDENT_GRADUATE_IMAGE } from '../assets/images';
import {
  GraduationCap,
  FileText,
  Clock,
  UserCheck,
  Calendar,
  Bookmark,
  Sparkles,
  ArrowRight,
  Send,
  Building2,
} from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const { user, profile } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [appsRes, savedRes, recRes] = await Promise.all([
          api.get('/applications'),
          api.get('/saved-jobs'),
          api.get('/jobs?limit=4'),
        ]);
        setApplications(appsRes.data || []);
        setSavedJobs(savedRes.data || []);
        setRecommendedJobs(recRes.data.jobs || []);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalSubmitted = applications.length;
  const underReview = applications.filter(a => a.status === 'UNDER_REVIEW').length;
  const shortlisted = applications.filter(a => a.status === 'SHORTLISTED').length;
  const interviews = applications.filter(a => a.status === 'INTERVIEW').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Hero */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar_url || STUDENT_GRADUATE_IMAGE}
            alt={user?.full_name}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-2xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Welcome back, {user?.full_name}!
              </h1>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                Candidate
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {profile?.headline || 'Ethiopian Graduate / Job Seeker'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/student/profile"
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
          >
            Edit Profile / CV
          </Link>
          <Link
            to="/jobs"
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors shadow-2xs"
          >
            Find Vacancies
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-700">
            <Send className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900 font-mono">{totalSubmitted}</span>
            <p className="text-xs text-slate-500 font-medium">Applied Jobs</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900 font-mono">{underReview}</span>
            <p className="text-xs text-slate-500 font-medium">In Review</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900 font-mono">{shortlisted}</span>
            <p className="text-xs text-slate-500 font-medium">Shortlisted</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-700">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900 font-mono">{interviews}</span>
            <p className="text-xs text-slate-500 font-medium">Interviews</p>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Active Applications & Recommendations */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Active Applications */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-700" />
                <span>My Active Applications ({applications.length})</span>
              </h2>
              <Link to="/student/applications" className="text-xs font-bold text-indigo-700 hover:underline">
                View All &rarr;
              </Link>
            </div>

            {applications.length > 0 ? (
              <div className="space-y-3">
                {applications.slice(0, 3).map((app) => (
                  <div
                    key={app.application_id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{app.job_title}</span>
                        {app.ai_match_score && (
                          <span className="px-2 py-0.5 rounded font-mono font-bold bg-emerald-100 text-emerald-800 text-[10px]">
                            {app.ai_match_score}% AI Match
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 mt-0.5">{app.company_name} • {app.job_city}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        app.status === 'SHORTLISTED' ? 'bg-emerald-100 text-emerald-900' :
                        app.status === 'INTERVIEW' ? 'bg-purple-100 text-purple-900' :
                        app.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-900' :
                        'bg-slate-200 text-slate-800'
                      }`}>
                        {app.status.replace('_', ' ')}
                      </span>
                      <Link
                        to="/student/applications"
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
                      >
                        Track
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                You haven't submitted any job applications yet.
              </div>
            )}
          </div>

          {/* Recommended Jobs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <span>Recommended Based on Your Profile</span>
              </h2>
              <Link to="/jobs" className="text-xs font-bold text-emerald-700 hover:underline">
                Explore More &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedJobs.map((job) => (
                <JobCard key={job.job_id} job={job} />
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Profile Strength Card & Bookmarks */}
        <div className="lg:col-span-4 space-y-6">
          
          <ProfileCompletionCard profile={profile} />

          {/* Bookmarks Summary */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Saved Jobs ({savedJobs.length})</span>
              </h3>
              <Link to="/student/saved" className="text-xs font-bold text-slate-600 hover:underline">
                View All
              </Link>
            </div>

            {savedJobs.length > 0 ? (
              <div className="space-y-2.5">
                {savedJobs.slice(0, 3).map((job) => (
                  <Link
                    key={job.job_id}
                    to={`/jobs/${job.job_id}`}
                    className="block p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors"
                  >
                    <p className="font-bold text-slate-900 text-xs truncate">{job.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{job.company_name} • {job.location_city}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No bookmarked vacancies.</p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
