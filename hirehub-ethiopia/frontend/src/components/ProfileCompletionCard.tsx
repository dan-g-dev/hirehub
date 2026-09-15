import React from 'react';
import { Link } from 'react-router-dom';
import { StudentProfile } from '../types';
import { CheckCircle2, Circle, ArrowRight, Sparkles, UploadCloud } from 'lucide-react';

interface ProfileCompletionCardProps {
  profile: StudentProfile | null;
}

export const ProfileCompletionCard: React.FC<ProfileCompletionCardProps> = ({ profile }) => {
  if (!profile) return null;

  const percentage = profile.profile_completion_percentage || 20;

  const checks = [
    { label: 'Basic Info & Professional Headline', done: Boolean(profile.headline && profile.headline.length > 5) },
    { label: 'Detailed Biography & Goals', done: Boolean(profile.bio && profile.bio.length > 20) },
    { label: 'Add 3+ Core Skills', done: Boolean(profile.skills && profile.skills.length >= 3) },
    { label: 'Ethiopian University / Education', done: Boolean(profile.education && profile.education.length > 0) },
    { label: 'Work / Internship Experience', done: Boolean(profile.experience && profile.experience.length > 0) },
    { label: 'Upload PDF CV for AI Matching', done: Boolean(profile.cv_url || profile.cv_extracted_text) },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
      
      {/* Title & Progress Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Profile Strength & ATS Readiness</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Higher completion unlocks top employer screening ranking.
          </p>
        </div>
        <span className="text-base font-extrabold font-mono text-emerald-600">
          {percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            percentage >= 80
              ? 'bg-emerald-500'
              : percentage >= 50
              ? 'bg-indigo-600'
              : 'bg-amber-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
        {checks.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {item.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-300 shrink-0" />
              )}
              <span className={item.done ? 'text-slate-700' : 'text-slate-500'}>
                {item.label}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Button */}
      <Link
        to="/student/profile"
        className="flex items-center justify-center gap-1.5 w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-indigo-900 text-white font-bold text-xs transition-colors shadow-2xs"
      >
        <span>Complete My Profile & Upload CV</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>

    </div>
  );
};
