import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Application } from '../types';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { ApplicationTimeline } from '../components/ApplicationTimeline';
import {
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  XCircle,
} from 'lucide-react';

export const StudentApplicationsPage: React.FC = () => {
  const { success, error } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAppId, setExpandedAppId] = useState<number | null>(null);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await api.get('/applications');
      setApplications(res.data || []);
      if (res.data.length > 0) {
        setExpandedAppId(res.data[0].application_id);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleWithdraw = async (id: number) => {
    if (!confirm('Are you sure you want to withdraw this application?')) return;

    try {
      await api.post(`/applications/${id}/withdraw`);
      success('Application withdrawn.');
      fetchApps();
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to withdraw application.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          My Application Tracking Pipeline
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Track real-time employer reviews, interview scheduling, and ATS feedback for your submitted Ethiopian vacancies.
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-16 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading your applications...</p>
        </div>
      ) : applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app) => {
            const isExpanded = expandedAppId === app.application_id;

            return (
              <div
                key={app.application_id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden transition-all"
              >
                {/* Header Summary */}
                <div
                  onClick={() => setExpandedAppId(isExpanded ? null : app.application_id)}
                  className="p-5 sm:p-6 cursor-pointer hover:bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-indigo-700">
                      <Building2 className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                          {app.job_title}
                        </h3>
                        {app.ai_match_score && (
                          <span className="px-2 py-0.5 rounded font-mono font-bold bg-emerald-100 text-emerald-800 text-[10px]">
                            {app.ai_match_score}% AI Match
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 mt-1">
                        <span className="font-semibold text-slate-700">{app.company_name}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{app.job_city}</span>
                        </span>
                        <span>•</span>
                        <span className="text-slate-400">
                          Applied {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        app.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-900' :
                        app.status === 'SHORTLISTED' ? 'bg-indigo-100 text-indigo-900' :
                        app.status === 'INTERVIEW' ? 'bg-purple-100 text-purple-900' :
                        app.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-900' :
                        app.status === 'REJECTED' ? 'bg-rose-100 text-rose-900' :
                        'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {app.status.replace('_', ' ')}
                    </span>

                    <button className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details & ATS Pipeline */}
                {isExpanded && (
                  <div className="p-6 bg-slate-50/70 border-t border-slate-200 space-y-6 animate-in fade-in duration-150">
                    
                    {/* Visual Timeline */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-6">
                        ATS Pipeline Progress
                      </h4>
                      <ApplicationTimeline
                        currentStatus={app.status}
                        history={app.status_history}
                      />
                    </div>

                    {/* Cover Letter & Candidate Notes */}
                    {app.cover_letter && (
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                        <h4 className="font-bold text-slate-900">Submitted Cover Note</h4>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-xl">
                          {app.cover_letter}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 text-xs">
                      <Link
                        to={`/jobs/${app.job_id}`}
                        className="inline-flex items-center gap-1.5 font-bold text-indigo-700 hover:underline"
                      >
                        <span>View Original Job Vacancy</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      {app.status !== 'REJECTED' && app.status !== 'WITHDRAWN' && app.status !== 'ACCEPTED' && (
                        <button
                          onClick={() => handleWithdraw(app.application_id)}
                          className="text-rose-600 hover:text-rose-800 font-bold"
                        >
                          Withdraw Application
                        </button>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center mx-auto">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No Applications Yet</h3>
          <p className="text-xs text-slate-500">
            You haven't submitted applications to any Ethiopian vacancies. Browse our open positions and use 1-click apply!
          </p>
          <Link
            to="/jobs"
            className="inline-block px-5 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-xs hover:bg-emerald-800 shadow-xs"
          >
            Find Vacancies
          </Link>
        </div>
      )}

    </div>
  );
};
