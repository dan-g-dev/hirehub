import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Application, Job, ApplicationStatus } from '../types';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { ApplicationTimeline } from '../components/ApplicationTimeline';
import {
  Users,
  Search,
  Filter,
  Sparkles,
  CheckCircle2,
  Clock,
  Calendar,
  XCircle,
  FileText,
  Mail,
  Phone,
  ArrowRight,
  X,
  ExternalLink,
  Award,
  AlertTriangle,
} from 'lucide-react';

const STATUS_TABS: Array<{ status: ApplicationStatus | 'ALL'; label: string; countColor: string }> = [
  { status: 'ALL', label: 'All Candidates', countColor: 'bg-slate-100 text-slate-800' },
  { status: 'APPLIED', label: 'Applied', countColor: 'bg-slate-100 text-slate-700' },
  { status: 'UNDER_REVIEW', label: 'Under Review', countColor: 'bg-amber-100 text-amber-800' },
  { status: 'SHORTLISTED', label: 'Shortlisted', countColor: 'bg-indigo-100 text-indigo-800' },
  { status: 'INTERVIEW', label: 'Interviewing', countColor: 'bg-purple-100 text-purple-800' },
  { status: 'ACCEPTED', label: 'Offered / Accepted', countColor: 'bg-emerald-100 text-emerald-800' },
  { status: 'REJECTED', label: 'Rejected', countColor: 'bg-rose-100 text-rose-800' },
];

export const EmployerApplicantsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { success, error } = useToast();

  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>(searchParams.get('job_id') || 'ALL');
  const [activeStatusTab, setActiveStatusTab] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Selected candidate drawer
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('UNDER_REVIEW');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      const [appsRes, jobsRes] = await Promise.all([
        api.get('/applications'),
        api.get('/jobs?limit=50'),
      ]);
      setApplications(appsRes.data || []);
      setJobs(jobsRes.data.jobs || []);

      // If applicant_id in URL, auto select
      const paramAppId = searchParams.get('applicant_id');
      if (paramAppId) {
        const found = (appsRes.data || []).find((a: Application) => a.application_id === Number(paramAppId));
        if (found) setSelectedApp(found);
      }
    } catch (err) {
      console.error('Failed to load applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setIsUpdatingStatus(true);
    try {
      const res = await api.put(`/applications/${selectedApp.application_id}/status`, {
        status: newStatus,
        note: statusNote || undefined,
      });

      success(`Candidate status updated to ${newStatus.replace('_', ' ')}!`);
      setSelectedApp(res.data.application);
      fetchApplicants();
      setStatusNote('');
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to update status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Filtering
  const filteredApplicants = applications.filter((app) => {
    if (selectedJobId !== 'ALL' && String(app.job_id) !== selectedJobId) return false;
    if (activeStatusTab !== 'ALL' && app.status !== activeStatusTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = app.applicant_name.toLowerCase().includes(q);
      const matchEmail = app.applicant_email?.toLowerCase().includes(q);
      const matchJob = app.job_title.toLowerCase().includes(q);
      return matchName || matchEmail || matchJob;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-900 mb-1">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>ATS Candidate Management Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Recruiter Pipeline ({applications.length} Candidates)
          </h1>
        </div>
      </div>

      {/* Filter Row: Job Dropdown & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="md:w-72">
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full text-xs sm:text-sm font-semibold p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none"
          >
            <option value="ALL">All Published Vacancies ({jobs.length})</option>
            {jobs.map((j) => (
              <option key={j.job_id} value={j.job_id}>
                {j.title} ({j.applications_count} applicants)
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidates by name, email, skills..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs font-semibold">
        {STATUS_TABS.map((tab) => {
          const count =
            tab.status === 'ALL'
              ? applications.length
              : applications.filter((a) => a.status === tab.status).length;

          return (
            <button
              key={tab.status}
              onClick={() => setActiveStatusTab(tab.status)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border whitespace-nowrap transition-all ${
                activeStatusTab === tab.status
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeStatusTab === tab.status ? 'bg-slate-800 text-white' : tab.countColor
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Table / Grid View */}
      {loading ? (
        <div className="p-16 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading applicant pipeline...</p>
        </div>
      ) : filteredApplicants.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4 pl-6">Candidate</th>
                  <th className="p-4">Applied Role</th>
                  <th className="p-4">AI ATS Match</th>
                  <th className="p-4">Applied Date</th>
                  <th className="p-4">Current Stage</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplicants.map((app) => (
                  <tr
                    key={app.application_id}
                    onClick={() => {
                      setSelectedApp(app);
                      setNewStatus(app.status);
                    }}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center shrink-0">
                          {app.applicant_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{app.applicant_name}</p>
                          <p className="text-slate-400 text-[11px]">{app.applicant_email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-slate-800">{app.job_title}</span>
                    </td>

                    <td className="p-4">
                      {app.ai_match_score ? (
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono font-extrabold text-xs px-2 py-0.5 rounded ${
                            app.ai_match_score >= 80 ? 'bg-emerald-100 text-emerald-800' :
                            app.ai_match_score >= 65 ? 'bg-indigo-100 text-indigo-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {app.ai_match_score}%
                          </span>
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Unscored</span>
                      )}
                    </td>

                    <td className="p-4 text-slate-500">
                      {new Date(app.created_at).toLocaleDateString()}
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        app.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-900' :
                        app.status === 'SHORTLISTED' ? 'bg-indigo-100 text-indigo-900' :
                        app.status === 'INTERVIEW' ? 'bg-purple-100 text-purple-900' :
                        app.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-900' :
                        app.status === 'REJECTED' ? 'bg-rose-100 text-rose-900' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-4 pr-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApp(app);
                          setNewStatus(app.status);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 font-bold transition-colors"
                      >
                        Review ATS
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
          No candidates found matching the selected filters.
        </div>
      )}

      {/* Candidate Detail ATS Modal / Drawer */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold">{selectedApp.applicant_name}</h2>
                    {selectedApp.ai_match_score && (
                      <span className="px-2.5 py-0.5 rounded-md font-mono font-extrabold bg-emerald-600 text-white text-xs">
                        {selectedApp.ai_match_score}% AI Match
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300">
                    Applying for: <strong className="text-emerald-400">{selectedApp.job_title}</strong>
                  </p>
                </div>

                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contact Bar */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{selectedApp.applicant_email}</span>
                </span>
                {selectedApp.applicant_phone && (
                  <span className="flex items-center gap-1.5 font-mono">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{selectedApp.applicant_phone}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs sm:text-sm">
              
              {/* ATS Status Changer Form */}
              <form onSubmit={handleUpdateStatus} className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950 text-xs">Update ATS Pipeline Stage:</span>
                  <span className="text-[11px] text-indigo-700">Notifies candidate immediately</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                    className="p-2.5 rounded-xl border border-indigo-200 bg-white text-slate-800 font-bold text-xs"
                  >
                    <option value="APPLIED">1. Applied</option>
                    <option value="UNDER_REVIEW">2. Under Review</option>
                    <option value="SHORTLISTED">3. Shortlisted</option>
                    <option value="INTERVIEW">4. Interview Scheduled</option>
                    <option value="ACCEPTED">5. Job Offer / Accepted</option>
                    <option value="REJECTED">6. Rejected</option>
                  </select>

                  <input
                    type="text"
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Optional message / interview date for candidate..."
                    className="p-2.5 rounded-xl border border-indigo-200 bg-white text-slate-800 text-xs"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-bold text-xs shadow-2xs"
                  >
                    {isUpdatingStatus ? 'Updating...' : 'Save & Advance Stage'}
                  </button>
                </div>
              </form>

              {/* Visual Timeline */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-5">
                  Applicant Pipeline Audit History
                </h3>
                <ApplicationTimeline
                  currentStatus={selectedApp.status}
                  history={selectedApp.status_history}
                />
              </div>

              {/* AI ATS Match Breakdown */}
              {selectedApp.ai_match_feedback && (
                <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Gemini ATS Semantic Evaluation Report</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                      <span className="font-bold text-emerald-900 block mb-1">
                        Matched Skills ({selectedApp.ai_match_feedback.matchedSkills?.length || 0})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedApp.ai_match_feedback.matchedSkills?.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-emerald-200/60 text-emerald-900 text-[11px]">
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <span className="font-bold text-amber-900 block mb-1">
                        Missing Skills ({selectedApp.ai_match_feedback.missingSkills?.length || 0})
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {selectedApp.ai_match_feedback.missingSkills?.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-amber-200/60 text-amber-900 text-[11px]">
                            + {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 italic bg-white p-3 rounded-xl border border-slate-200">
                    "{selectedApp.ai_match_feedback.recommendation}"
                  </p>
                </div>
              )}

              {/* Cover Letter */}
              {selectedApp.cover_letter && (
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 text-xs">Candidate Cover Letter</h3>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {selectedApp.cover_letter}
                  </div>
                </div>
              )}

              {/* Candidate Resume Text */}
              {selectedApp.resume_extracted_text && (
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 text-xs">Extracted CV / Resume Text</h3>
                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 font-mono text-xs max-h-48 overflow-y-auto leading-relaxed whitespace-pre-line">
                    {selectedApp.resume_extracted_text}
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                Close ATS Review
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
