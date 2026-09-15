import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Company, Job } from '../types';
import api from '../services/api';
import { JobCard } from '../components/JobCard';
import {
  Building2,
  MapPin,
  Globe,
  Users,
  CheckCircle2,
  Briefcase,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

export const CompanyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [company, setCompany] = useState<Company | null>(null);
  const [openJobs, setOpenJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await api.get(`/companies/${id}`);
        setCompany(res.data.company);
        setOpenJobs(res.data.openJobs || []);
      } catch (err) {
        console.error('Failed to load company:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-xs text-slate-500">Loading company profile...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-md mx-auto my-16 text-center p-8 bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-800 font-bold mb-4">Company not found.</p>
        <Link to="/companies" className="px-4 py-2 bg-indigo-700 text-white rounded-xl text-xs font-bold">
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Companies</span>
      </button>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
              {company.logo_url ? (
                <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-10 h-10 text-slate-400" />
              )}
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{company.name}</h1>
                <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" title="Verified Ethiopian Enterprise" />
              </div>
              <p className="text-xs font-bold text-slate-500">{company.industry}</p>
              
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{company.city}, {company.subcity}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{company.company_size} Employees</span>
                </span>
              </div>
            </div>
          </div>

          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors self-start"
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span>Visit Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">About the Company</h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {company.about}
          </p>
        </div>
      </div>

      {/* Open Vacancies */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-emerald-600" />
          <span>Active Vacancies at {company.name} ({openJobs.length})</span>
        </h2>

        {openJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {openJobs.map((job) => (
              <JobCard key={job.job_id} job={job} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
            No active vacancies at this moment. Check back soon!
          </div>
        )}
      </div>

    </div>
  );
};
