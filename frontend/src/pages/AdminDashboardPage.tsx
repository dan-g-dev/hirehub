import React, { useState, useEffect } from 'react';
import { User, Company, Job, PlatformStats } from '../types';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import {
  ShieldAlert,
  Users,
  Building2,
  Briefcase,
  CheckCircle2,
  XCircle,
  RotateCw,
  TrendingUp,
  AlertCircle,
  Database,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { success, error } = useToast();

  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'USERS' | 'COMPANIES' | 'JOBS'>('USERS');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, compsRes, jobsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/companies'),
        api.get('/jobs?limit=50'),
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data || []);
      setCompanies(compsRes.data || []);
      setJobs(jobsRes.data.jobs || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserStatus = async (userId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.put(`/admin/users/${userId}/status`, { status: nextStatus });
      success(`User status updated to ${nextStatus}.`);
      fetchAdminData();
    } catch (err: any) {
      error('Failed to update user status.');
    }
  };

  const handleToggleCompanyVerify = async (compId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'VERIFIED' ? 'REJECTED' : 'VERIFIED';
    try {
      await api.put(`/admin/companies/${compId}/verify`, { status: nextStatus });
      success(`Company verification set to ${nextStatus}.`);
      fetchAdminData();
    } catch (err: any) {
      error('Failed to update company verification.');
    }
  };

  const handleToggleJobStatus = async (jobId: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
    try {
      await api.put(`/admin/jobs/${jobId}/status`, { status: nextStatus });
      success(`Job status changed to ${nextStatus}.`);
      fetchAdminData();
    } catch (err: any) {
      error('Failed to update job status.');
    }
  };

  const handleReseedDb = async () => {
    if (!confirm('Reseed database with fresh Ethiopian job and company datasets?')) return;
    try {
      await api.post('/admin/seed-data');
      success('Database successfully reseeded with Ethiopian records!');
      fetchAdminData();
    } catch (err) {
      error('Reseed failed.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-800 text-xs font-bold text-rose-300 mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>National Super Admin Control Panel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">HireHub Ethiopia Platform Oversight</h1>
          <p className="text-xs text-slate-400 mt-1">
            System health, Ethiopian enterprise verifications, user moderation, and simulated MySQL persistence.
          </p>
        </div>

        <button
          onClick={handleReseedDb}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors self-start"
        >
          <Database className="w-4 h-4 text-emerald-400" />
          <span>Reset / Reseed Sample Data</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Users</span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{stats?.total_users || users.length}</p>
          <span className="text-[11px] text-slate-500">{stats?.total_job_seekers || 0} Candidates • {stats?.total_employers || 0} Employers</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Ethiopian Enterprises</span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{stats?.total_companies || companies.length}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">100% Verified in Addis Ababa</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Published Jobs</span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{stats?.total_jobs || jobs.length}</p>
          <span className="text-[11px] text-indigo-600 font-semibold">{stats?.active_jobs || jobs.length} Active Vacancies</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Applications</span>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{stats?.total_applications || 0}</p>
          <span className="text-[11px] text-slate-500">ATS Processed</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'USERS' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          User Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('COMPANIES')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'COMPANIES' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Enterprises & Verification ({companies.length})
        </button>
        <button
          onClick={() => setActiveTab('JOBS')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'JOBS' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Job Moderation ({jobs.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-4 pl-6">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.user_id} className="hover:bg-slate-50">
                  <td className="p-4 pl-6">
                    <p className="font-bold text-slate-900">{u.full_name}</p>
                    <p className="text-slate-400 text-[11px]">{u.email}</p>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-[10px]">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 font-mono">{u.phone_number || '+251 9...'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => handleToggleUserStatus(u.user_id, u.status)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs ${
                        u.status === 'ACTIVE'
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'COMPANIES' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-4 pl-6">Enterprise</th>
                <th className="p-4">Location</th>
                <th className="p-4">Size</th>
                <th className="p-4">Verification</th>
                <th className="p-4 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {companies.map((c) => (
                <tr key={c.company_id} className="hover:bg-slate-50">
                  <td className="p-4 pl-6">
                    <p className="font-bold text-slate-900">{c.name}</p>
                    <p className="text-slate-400 text-[11px]">{c.industry}</p>
                  </td>
                  <td className="p-4">{c.city}, {c.subcity}</td>
                  <td className="p-4">{c.company_size}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      c.verification_status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {c.verification_status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => handleToggleCompanyVerify(c.company_id, c.verification_status)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                    >
                      Toggle Verification
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'JOBS' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-4 pl-6">Vacancy Title</th>
                <th className="p-4">Company</th>
                <th className="p-4">Type</th>
                <th className="p-4">Applicants</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((j) => (
                <tr key={j.job_id} className="hover:bg-slate-50">
                  <td className="p-4 pl-6">
                    <p className="font-bold text-slate-900">{j.title}</p>
                    <p className="text-slate-400 text-[11px]">{j.location_city}</p>
                  </td>
                  <td className="p-4 font-semibold">{j.company_name}</td>
                  <td className="p-4">{j.job_type}</td>
                  <td className="p-4 font-bold">{j.applications_count}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      j.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {j.status}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => handleToggleJobStatus(j.job_id, j.status)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                    >
                      {j.status === 'ACTIVE' ? 'Close' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
