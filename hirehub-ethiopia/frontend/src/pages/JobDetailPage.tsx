import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Job, Company, AIMatchResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { JobCard } from '../components/JobCard';
import { AICVMatchModal } from '../components/AICVMatchModal';
import { ApplyModal } from '../components/ApplyModal';
import {
  Building2,
  MapPin,
  Clock,
  Banknote,
  Sparkles,
  Bookmark,
  Share2,
  CheckCircle2,
  Calendar,
  Eye,
  Users,
  ArrowLeft,
  Send,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useToast();

  const [job, setJob] = useState<Job | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Modals
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [appliedAiMatch, setAppliedAiMatch] = useState<AIMatchResult | undefined>(undefined);

  useEffect(() => {
    const fetchJobDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await api.get(`/jobs/${id}`);
        setJob(res.data.job);
        setCompany(res.data.company);
        setRelatedJobs(res.data.relatedJobs || []);
        setIsSaved(res.data.job.is_saved || false);
      } catch (err) {
        console.error('Failed to load job:', err);
        error('Job listing not found or inactive.');
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetail();
  }, [id]);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      error('Please log in to bookmark jobs.');
      return;
    }
    if (!job) return;

    setIsSaving(true);
    try {
      const res = await api.post(`/jobs/${job.job_id}/save`);
      setIsSaved(res.data.is_saved);
      success(res.data.is_saved ? 'Job saved to your bookmarks.' : 'Job removed from bookmarks.');
    } catch {
      error('Failed to update bookmark.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    success('Job link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-xs text-slate-500 font-medium">Loading Ethiopian vacancy details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-md mx-auto my-16 text-center p-8 bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-800 font-bold mb-4">Job listing not found.</p>
        <Link to="/jobs" className="px-4 py-2 bg-indigo-700 text-white rounded-xl text-xs font-bold">
          Browse All Jobs
        </Link>
      </div>
    );
  }

  const formatSalary = () => {
    if (job.salary_type === 'COMPETITIVE') return 'Competitive (ETB)';
    if (job.salary_type === 'UNPAID') return 'Stipend / Unpaid';
    if (job.salary_exact) return `ETB ${job.salary_exact.toLocaleString()} / mo`;
    if (job.salary_min && job.salary_max) {
      return `ETB ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} / mo`;
    }
    return `From ETB ${job.salary_min?.toLocaleString()} / mo`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to listings</span>
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 border border-slate-200 p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
              {job.company_logo ? (
                <img src={job.company_logo} alt={job.company_name} className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-8 h-8 text-slate-400" />
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Link
                  to={`/companies/${job.company_id}`}
                  className="text-xs font-bold text-slate-700 hover:text-indigo-800 transition-colors"
                >
                  {job.company_name}
                </Link>
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" title="Verified Employer" />
                {job.is_featured && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 uppercase">
                    Featured
                  </span>
                )}
              </div>
              
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{job.location_city}{job.location_subcity ? `, ${job.location_subcity}` : ''}</span>
                </span>
                <span>•</span>
                <span className="font-bold text-slate-700">{job.job_type.replace('_', ' ')}</span>
                <span>•</span>
                <span className="text-slate-600">{job.workplace_type}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:self-start">
            <button
              onClick={handleToggleSave}
              disabled={isSaving}
              className={`p-3 rounded-2xl border transition-all ${
                isSaved
                  ? 'bg-amber-50 border-amber-300 text-amber-600'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title={isSaved ? 'Remove Bookmark' : 'Save Job'}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-amber-500' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
              title="Share vacancy"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button
              id="job-detail-ai-match-btn"
              onClick={() => setIsAIModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-3 rounded-2xl font-bold text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI CV Match</span>
            </button>

            <button
              id="job-detail-apply-btn"
              onClick={() => setIsApplyModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs text-white bg-emerald-700 hover:bg-emerald-800 transition-all shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>Apply Now</span>
            </button>
          </div>

        </div>

        {/* Highlight Meta Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-100 text-xs">
          <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <span className="text-[11px] text-emerald-800 font-semibold block">Offered Salary</span>
            <span className="text-sm font-extrabold text-emerald-950 font-mono mt-0.5 block">{formatSalary()}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-500 font-semibold block">Experience Required</span>
            <span className="text-xs font-bold text-slate-800 mt-0.5 block">{job.experience_level.replace('_', ' ')}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-500 font-semibold block">Category</span>
            <span className="text-xs font-bold text-slate-800 mt-0.5 block">{job.category_name}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] text-slate-500 font-semibold block">Activity</span>
            <span className="text-xs font-bold text-slate-800 mt-0.5 block">{job.applications_count} applicants • {job.views_count} views</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Job Description */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* About the Role */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900">About the Role</h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Key Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900">Key Responsibilities</h2>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                    <span className="leading-relaxed">{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements & Qualifications */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900">Requirements & Qualifications</h2>
              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
                {job.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                    <span className="leading-relaxed">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills Required */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
            <h2 className="text-lg font-bold text-slate-900">Required & Preferred Skills</h2>
            
            <div className="space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Mandatory Competencies
                </span>
                <div className="flex flex-wrap gap-2">
                  {job.required_skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {job.preferred_skills && job.preferred_skills.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Nice to Have
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {job.preferred_skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-900 text-xs font-medium border border-indigo-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900">Benefits & Compensation</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {job.benefits.map((b, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700 flex items-center gap-2"
                  >
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Company Info & Related */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Company Card */}
          {company && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 p-1.5 flex items-center justify-center shrink-0">
                  {company.logo_url ? (
                    <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain" />
                  ) : (
                    <Building2 className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{company.name}</h3>
                  <p className="text-xs text-slate-500">{company.industry}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                {company.about}
              </p>

              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Headquarters:</span>
                  <span className="font-bold text-slate-800">{company.city}, {company.subcity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Company Size:</span>
                  <span className="font-bold text-slate-800">{company.company_size} Employees</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Open Vacancies:</span>
                  <span className="font-bold text-emerald-700">{company.open_positions_count || 1} roles</span>
                </div>
              </div>

              <Link
                to={`/companies/${company.company_id}`}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                <span>View Full Company Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Related Jobs */}
          {relatedJobs.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-sm">Similar Opportunities</h3>
              <div className="space-y-3">
                {relatedJobs.map((relJob) => (
                  <JobCard key={relJob.job_id} job={relJob} />
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* AI CV Match Modal */}
      <AICVMatchModal
        job={job}
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onApplyDirectly={(_j, match) => {
          setAppliedAiMatch(match);
          setIsApplyModalOpen(true);
        }}
      />

      {/* Apply Modal */}
      <ApplyModal
        job={job}
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => {
          if (job) setJob({ ...job, applications_count: job.applications_count + 1 });
        }}
        aiMatch={appliedAiMatch}
      />

    </div>
  );
};
