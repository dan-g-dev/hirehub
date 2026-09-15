import React from 'react';
import { Link } from 'react-router-dom';
import { Job } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import {
  MapPin,
  Building2,
  Bookmark,
  Sparkles,
  Clock,
  Banknote,
  CheckCircle,
  ArrowUpRight,
  Briefcase,
} from 'lucide-react';

interface JobCardProps {
  job: Job;
  onOpenAIMatch?: (job: Job) => void;
  onSaveToggle?: (jobId: number, isSaved: boolean) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onOpenAIMatch, onSaveToggle }) => {
  const { isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const [saved, setSaved] = React.useState(job.is_saved || false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Format Salary
  const formatSalary = () => {
    if (job.salary_type === 'COMPETITIVE') return 'Competitive (ETB)';
    if (job.salary_type === 'UNPAID') return 'Stipend / Unpaid';
    if (job.salary_exact) {
      return `ETB ${job.salary_exact.toLocaleString()} / mo`;
    }
    if (job.salary_min && job.salary_max) {
      return `ETB ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} / mo`;
    }
    if (job.salary_min) {
      return `From ETB ${job.salary_min.toLocaleString()} / mo`;
    }
    return 'ETB Competitive';
  };

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      error('Please log in to save jobs to your bookmarks.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await api.post(`/jobs/${job.job_id}/save`);
      const newSavedState = res.data.is_saved;
      setSaved(newSavedState);
      if (onSaveToggle) onSaveToggle(job.job_id, newSavedState);
      success(newSavedState ? 'Saved to bookmarks' : 'Removed from bookmarks');
    } catch {
      error('Failed to update bookmark.');
    } finally {
      setIsSaving(false);
    }
  };

  // Job Type styling
  const getJobTypeBadge = () => {
    switch (job.job_type) {
      case 'INTERNSHIP':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'FULL_TIME':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'PART_TIME':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'CONTRACT':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Time remaining
  const daysRemaining = () => {
    const diff = new Date(job.deadline).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Expired';
    if (days === 0) return 'Last day today';
    return `${days}d left`;
  };

  return (
    <div
      id={`job-card-${job.job_id}`}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 hover:shadow-md hover:border-indigo-300 p-5 flex flex-col justify-between ${
        job.is_featured ? 'border-amber-300/80 bg-linear-to-b from-amber-50/20 to-white shadow-xs' : 'border-slate-200'
      }`}
    >
      <div>
        {/* Header Row: Company Logo, Name, Location, Bookmark */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/80 p-1.5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
              {job.company_logo ? (
                <img
                  src={job.company_logo}
                  alt={job.company_name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <Building2 className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700 truncate max-w-[170px] sm:max-w-xs">
                  {job.company_name}
                </span>
                <CheckCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" title="Verified Ethiopian Enterprise" />
                {job.is_featured && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 uppercase">
                    Featured
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-800 transition-colors line-clamp-1 mt-0.5">
                <Link to={`/jobs/${job.job_id}`} className="focus:outline-none">
                  {job.title}
                </Link>
              </h3>
            </div>
          </div>

          <button
            id={`bookmark-btn-${job.job_id}`}
            onClick={handleToggleSave}
            disabled={isSaving}
            className={`p-2 rounded-xl border transition-all ${
              saved
                ? 'bg-amber-50 border-amber-300 text-amber-600'
                : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            aria-label={saved ? 'Remove bookmark' : 'Bookmark job'}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-amber-500' : ''}`} />
          </button>
        </div>

        {/* Location & Meta Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
          <span className="flex items-center gap-1 text-slate-600 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.location_city}{job.location_subcity ? `, ${job.location_subcity}` : ''}</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${getJobTypeBadge()}`}>
            {job.job_type.replace('_', ' ')}
          </span>
          <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {job.workplace_type}
          </span>
        </div>

        {/* Salary in ETB */}
        <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-800 mb-3 bg-emerald-50/60 border border-emerald-100/80 px-2.5 py-1.5 rounded-lg w-fit">
          <Banknote className="w-4 h-4 text-emerald-600" />
          <span>{formatSalary()}</span>
        </div>

        {/* Skills Pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.required_skills.slice(0, 3).map((skill, idx) => (
            <span
              key={idx}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60"
            >
              {skill}
            </span>
          ))}
          {job.required_skills.length > 3 && (
            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-500">
              +{job.required_skills.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Footer / Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{daysRemaining()}</span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAIMatch && (
            <button
              id={`ai-match-btn-${job.job_id}`}
              onClick={(e) => {
                e.preventDefault();
                onOpenAIMatch(job);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 transition-colors"
              title="Calculate AI ATS Match score for your CV"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>AI Match</span>
            </button>
          )}

          <Link
            to={`/jobs/${job.job_id}`}
            id={`view-job-btn-${job.job_id}`}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold text-white bg-slate-900 hover:bg-indigo-900 transition-colors shadow-2xs"
          >
            <span>View</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
