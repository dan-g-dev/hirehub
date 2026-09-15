import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LogIn, Sparkles, Shield, User, Building2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, switchDemoRole } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      success('Logged in successfully!');
      navigate('/');
    } catch (err: any) {
      error(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = async (role: 'JOB_SEEKER' | 'EMPLOYER' | 'ADMIN') => {
    await switchDemoRole(role);
    success(`Switched to demo ${role.replace('_', ' ')}!`);
    if (role === 'JOB_SEEKER') navigate('/student/dashboard');
    else if (role === 'EMPLOYER') navigate('/employer/dashboard');
    else navigate('/admin/dashboard');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto">
          <LogIn className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Sign in to HireHub Ethiopia</h1>
        <p className="text-xs text-slate-500">
          Enter your credentials or choose a 1-click demo role below.
        </p>
      </div>

      {/* 1-Click Demo Logins */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center">
          ⚡ 1-Click Instant Demo Login
        </span>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleDemoSelect('JOB_SEEKER')}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-800 font-bold transition-all flex flex-col items-center gap-1 shadow-2xs"
          >
            <User className="w-4 h-4 text-emerald-600" />
            <span>Job Seeker</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoSelect('EMPLOYER')}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 text-slate-800 font-bold transition-all flex flex-col items-center gap-1 shadow-2xs"
          >
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Employer</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoSelect('ADMIN')}
            className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-rose-500 hover:bg-rose-50/50 text-slate-800 font-bold transition-all flex flex-col items-center gap-1 shadow-2xs"
          >
            <Shield className="w-4 h-4 text-rose-600" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs sm:text-sm">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="abebe.bikila@hirehub.et"
            className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            required
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-indigo-900 text-white font-bold transition-colors shadow-xs"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-center text-xs text-slate-500 pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-indigo-700 hover:underline">
            Register now
          </Link>
        </p>
      </form>

    </div>
  );
};
