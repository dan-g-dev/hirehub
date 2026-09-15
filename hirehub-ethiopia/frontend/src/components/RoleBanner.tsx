import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  GraduationCap,
  UserCheck,
  Briefcase,
  ShieldAlert,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Minimize2,
  Maximize2,
  Check,
} from 'lucide-react';

export const RoleBanner: React.FC = () => {
  const { user, demoLogin } = useAuth();
  const { success } = useToast();
  
  // Floating widget states: expanded modal/drawer or compact pill
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleSwitch = async (role: 'JOB_SEEKER' | 'EMPLOYER' | 'ADMIN' | 'STUDENT_DESIGNER', label: string) => {
    try {
      await demoLogin(role);
      success(`Switched to demo role: ${label}`);
      setIsOpen(false);
    } catch {
      // ignore
    }
  };

  const getActiveRoleDetails = () => {
    if (user?.role === 'ADMIN') {
      return {
        label: 'Admin (Solomon)',
        roleTag: 'Platform Super Admin',
        color: 'bg-amber-500 text-white',
        border: 'border-amber-400',
        icon: ShieldAlert,
      };
    }
    if (user?.role === 'EMPLOYER') {
      return {
        label: 'Employer (EthioTech HR)',
        roleTag: 'Recruiter & Hiring Lead',
        color: 'bg-indigo-600 text-white',
        border: 'border-indigo-400',
        icon: Briefcase,
      };
    }
    if (user?.role === 'JOB_SEEKER' && user.email.includes('bethlehem')) {
      return {
        label: 'UI/UX Candidate (Bethlehem)',
        roleTag: 'Mid-Level Product Designer',
        color: 'bg-emerald-600 text-white',
        border: 'border-emerald-400',
        icon: UserCheck,
      };
    }
    return {
      label: 'Student (Yohannes - AAU)',
      roleTag: 'AAU Software Engineering Intern',
      color: 'bg-blue-600 text-white',
      border: 'border-blue-400',
      icon: GraduationCap,
    };
  };

  const activeRole = getActiveRoleDetails();
  const ActiveIcon = activeRole.icon;

  // Fully minimized state: discreet floating chip in bottom-left
  if (isMinimized) {
    return (
      <aside
        id="demo-role-banner"
        aria-label="Demo role switcher"
        className="fixed bottom-5 left-5 z-40"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-900/95 hover:bg-slate-900 text-white shadow-xl border border-slate-700/80 backdrop-blur-md text-xs font-semibold hover:scale-105 transition-all group"
          title="Open Role Demo Switcher"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] text-emerald-400 font-bold">Demo:</span>
          <span className="max-w-[130px] truncate text-[11px] text-slate-200">{activeRole.label}</span>
          <Maximize2 className="w-3 h-3 text-slate-400 group-hover:text-white" />
        </button>
      </aside>
    );
  }

  return (
    <aside
      id="demo-role-banner"
      aria-label="Demo role switcher"
      className="fixed bottom-5 left-5 z-40 max-w-xs sm:max-w-sm select-none"
    >
      {/* Expanded Popup Menu */}
      {isOpen && (
        <div className="mb-2.5 bg-slate-950/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-800 p-3.5 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
          
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-base">🇪🇹</span>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Role Demo Switcher</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-mono">
                    Live
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400">Switch perspectives to test user workflows</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close menu"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* 4 Demo Roles List */}
          <div className="space-y-1.5">
            
            {/* Student Yohannes */}
            <button
              id="demo-btn-student"
              onClick={() => handleSwitch('JOB_SEEKER', 'Student / Candidate (Yohannes)')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${
                user?.role === 'JOB_SEEKER' && user.email.includes('yohannes')
                  ? 'bg-blue-950/70 border-blue-600/80 text-white shadow-xs'
                  : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Student (Yohannes)</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-blue-900/60 text-blue-300 font-mono">AAU</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Undergrad / Internship Seeker</p>
                </div>
              </div>
              {user?.role === 'JOB_SEEKER' && user.email.includes('yohannes') && (
                <Check className="w-4 h-4 text-blue-400 shrink-0" />
              )}
            </button>

            {/* UI/UX Bethlehem */}
            <button
              id="demo-btn-designer"
              onClick={() => handleSwitch('STUDENT_DESIGNER', 'UI/UX Student (Bethlehem)')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${
                user?.role === 'JOB_SEEKER' && user.email.includes('bethlehem')
                  ? 'bg-emerald-950/70 border-emerald-600/80 text-white shadow-xs'
                  : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">UI/UX Candidate (Bethlehem)</div>
                  <p className="text-[10px] text-slate-400">Mid-level portfolio & CV profile</p>
                </div>
              </div>
              {user?.role === 'JOB_SEEKER' && user.email.includes('bethlehem') && (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
            </button>

            {/* Employer EthioTech */}
            <button
              id="demo-btn-employer"
              onClick={() => handleSwitch('EMPLOYER', 'Employer HR (EthioTech)')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${
                user?.role === 'EMPLOYER'
                  ? 'bg-indigo-950/70 border-indigo-600/80 text-white shadow-xs'
                  : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Employer (EthioTech HR)</div>
                  <p className="text-[10px] text-slate-400">Post vacancies & screen applicants</p>
                </div>
              </div>
              {user?.role === 'EMPLOYER' && (
                <Check className="w-4 h-4 text-indigo-400 shrink-0" />
              )}
            </button>

            {/* Admin Solomon */}
            <button
              id="demo-btn-admin"
              onClick={() => handleSwitch('ADMIN', 'Platform Super Admin (Solomon)')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${
                user?.role === 'ADMIN'
                  ? 'bg-amber-950/70 border-amber-600/80 text-white shadow-xs'
                  : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Admin (Solomon)</div>
                  <p className="text-[10px] text-slate-400">Platform approvals & analytics</p>
                </div>
              </div>
              {user?.role === 'ADMIN' && (
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
              )}
            </button>

          </div>

          <div className="pt-1 text-center border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>🇪🇹 ሀይርሀብ ኢትዮጵያ</span>
            <button
              onClick={() => {
                setIsOpen(false);
                setIsMinimized(true);
              }}
              className="hover:text-slate-200 underline"
            >
              Minimize widget
            </button>
          </div>
        </div>
      )}

      {/* Docked Compact Floating Pill Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-950/90 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-800 text-white">
        
        {/* Main Role Indicator Pill Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition-all text-xs group"
          title="Click to switch demo role"
        >
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <ActiveIcon className="w-3.5 h-3.5 text-emerald-400" />
          </div>

          <div className="flex flex-col text-left leading-none">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Demo Role</span>
            <span className="text-xs font-bold text-white truncate max-w-[150px] sm:max-w-[180px] mt-0.5">
              {activeRole.label}
            </span>
          </div>

          <div className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors ml-1">
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </div>
        </button>

        {/* Quick Minimize Button */}
        <button
          onClick={() => setIsMinimized(true)}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
          title="Minimize demo dock"
        >
          <Minimize2 className="w-3.5 h-3.5" />
        </button>
      </div>

    </aside>
  );
};
