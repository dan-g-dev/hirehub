import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserRole } from '../types';
import { UserPlus, User, Building2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { success, error } = useToast();

  const [role, setRole] = useState<UserRole>('JOB_SEEKER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        role,
        full_name: fullName,
        email,
        phone_number: phoneNumber,
        password,
        company_name: role === 'EMPLOYER' ? companyName : undefined,
      });

      success('Account registered successfully! Welcome to HireHub Ethiopia.');
      if (role === 'JOB_SEEKER') navigate('/student/profile');
      else navigate('/employer/dashboard');
    } catch (err: any) {
      error(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Create Your HireHub Account</h1>
        <p className="text-xs text-slate-500">
          Join Ethiopia's verified career & hiring network.
        </p>
      </div>

      {/* Role Selector Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl text-xs font-bold">
        <button
          type="button"
          onClick={() => setRole('JOB_SEEKER')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
            role === 'JOB_SEEKER' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4 text-emerald-600" />
          <span>I'm a Job Seeker</span>
        </button>

        <button
          type="button"
          onClick={() => setRole('EMPLOYER')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${
            role === 'EMPLOYER' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4 text-indigo-600" />
          <span>I'm an Employer</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs sm:text-sm">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Almaz Ayana"
            className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            required
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="almaz@example.com"
            className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            required
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Phone Number (Ethiopia) *</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+251 91 234 5678"
            className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono"
            required
          />
        </div>

        {role === 'EMPLOYER' && (
          <div>
            <label className="font-bold text-slate-700 block mb-1">Company / Organization Name *</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Addis Tech Labs"
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              required
            />
          </div>
        )}

        <div>
          <label className="font-bold text-slate-700 block mb-1">Password *</label>
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
          {loading ? 'Creating Account...' : 'Complete Registration'}
        </button>

        <p className="text-center text-xs text-slate-500 pt-2">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-700 hover:underline">
            Sign in
          </Link>
        </p>
      </form>

    </div>
  );
};
