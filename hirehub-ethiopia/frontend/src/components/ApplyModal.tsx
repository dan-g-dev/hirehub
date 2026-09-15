import React, { useState } from 'react';
import { Job, AIMatchResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import {
  X,
  FileText,
  Upload,
  Send,
  Sparkles,
  CheckCircle2,
  Building2,
  AlertCircle,
} from 'lucide-react';

interface ApplyModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  aiMatch?: AIMatchResult;
}

export const ApplyModal: React.FC<ApplyModalProps> = ({
  job,
  isOpen,
  onClose,
  onSuccess,
  aiMatch,
}) => {
  const { user, profile } = useAuth();
  const { success, error } = useToast();

  const [coverLetter, setCoverLetter] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !job) return null;

  const handleGenerateCoverLetter = () => {
    if (!profile) return;
    const generated = `Dear Hiring Team at ${job.company_name},\n\nI am writing to express my strong enthusiasm for the ${job.title} position in ${job.location_city}. As an ambitious Ethiopian professional with background in ${profile.headline || 'my field'}, I have developed strong competencies in ${job.required_skills.slice(0, 3).join(', ')}.\n\nI admire ${job.company_name}'s contribution to Ethiopia's technological and economic landscape, and I am eager to bring my dedicated problem-solving mindset to your team.\n\nThank you for considering my application.\n\nSincerely,\n${user?.full_name || 'Candidate'}\n${user?.phone_number || ''}`;
    setCoverLetter(generated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      error('Please log in as a Job Seeker to submit your application.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/jobs/${job.job_id}/apply`, {
        cover_letter: coverLetter,
        additional_notes: additionalNotes,
        resume_url: profile?.cv_url,
        resume_filename: profile?.cv_filename || 'Candidate_CV.pdf',
        resume_extracted_text: profile?.cv_extracted_text,
        ai_match_score: aiMatch?.score,
        ai_match_feedback: aiMatch,
      });

      setSubmitted(true);
      success(`Application submitted for ${job.title}!`);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSubmitted(false);
      }, 1800);
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to submit application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <h2 className="text-lg font-bold">Apply for Position</h2>
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-300">
            <span className="font-bold text-white">{job.title}</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">{job.company_name}</span>
            <span>•</span>
            <span className="text-slate-400">{job.location_city}</span>
          </div>

          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Application Received!</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Your application has been forwarded to the hiring team at {job.company_name}. You can track the status in your candidate dashboard.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs sm:text-sm max-h-[70vh] overflow-y-auto">
            
            {/* Candidate Summary */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={user?.full_name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <p className="font-bold text-slate-900 text-xs">{user?.full_name}</p>
                  <p className="text-slate-500 text-[11px]">{user?.email} • {user?.phone_number || '+251 9'}</p>
                </div>
              </div>
              {aiMatch && (
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">AI Match</span>
                  <span className="text-base font-extrabold text-emerald-600 font-mono">{aiMatch.score}%</span>
                </div>
              )}
            </div>

            {/* Resume Attachment Info */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 text-xs block">Attached CV / Resume</label>
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-indigo-700 shrink-0" />
                  <span className="font-bold text-slate-800 truncate max-w-[220px]">
                    {profile?.cv_filename || 'Default Ethiopian Candidate Profile CV'}
                  </span>
                </div>
                <span className="text-[11px] text-indigo-800 font-medium bg-indigo-100 px-2 py-0.5 rounded">
                  Profile Attached
                </span>
              </div>
            </div>

            {/* Cover Letter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-800 text-xs">Cover Letter / Note to Employer</label>
                <button
                  type="button"
                  onClick={handleGenerateCoverLetter}
                  className="flex items-center gap-1 text-xs text-indigo-700 font-bold hover:underline"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Draft</span>
                </button>
              </div>
              <textarea
                rows={5}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Introduce yourself and explain why you are the ideal fit for this Ethiopian role..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            {/* Additional Notes / Availability */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-800 text-xs block">
                Availability & Relevant Details (Optional)
              </label>
              <input
                type="text"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="e.g., Available immediately, CGPA 3.8, graduated from AAU..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-all shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Application'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
