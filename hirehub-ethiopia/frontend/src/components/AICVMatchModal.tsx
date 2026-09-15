import React, { useState, useEffect } from 'react';
import { Job, AIMatchResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Briefcase,
  ArrowRight,
  TrendingUp,
  RotateCw,
  Award,
} from 'lucide-react';

interface AICVMatchModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyDirectly?: (job: Job, matchResult?: AIMatchResult) => void;
}

export const AICVMatchModal: React.FC<AICVMatchModalProps> = ({
  job,
  isOpen,
  onClose,
  onApplyDirectly,
}) => {
  const { user, profile } = useAuth();
  const { error } = useToast();

  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<AIMatchResult | null>(null);
  const [customText, setCustomText] = useState('');
  const [isEditingResume, setIsEditingResume] = useState(false);

  useEffect(() => {
    if (isOpen && job) {
      runMatch();
    } else {
      setMatchResult(null);
      setIsEditingResume(false);
    }
  }, [isOpen, job]);

  const runMatch = async (textOverride?: string) => {
    if (!job) return;
    setLoading(true);

    try {
      const res = await api.post('/ai/cv-match', {
        job_id: job.job_id,
        resume_text: textOverride || customText || profile?.cv_extracted_text,
      });
      setMatchResult(res.data.match);
    } catch (err: any) {
      error(err.response?.data?.error || 'AI CV match evaluation failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !job) return null;

  const score = matchResult?.score || 0;
  const getScoreColor = () => {
    if (score >= 80) return 'text-emerald-500 stroke-emerald-500';
    if (score >= 65) return 'text-indigo-500 stroke-indigo-500';
    if (score >= 50) return 'text-amber-500 stroke-amber-500';
    return 'text-rose-500 stroke-rose-500';
  };

  const getScoreBadge = () => {
    if (score >= 80) return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', label: 'Exceptional Match 🌟' };
    if (score >= 65) return { bg: 'bg-indigo-50 text-indigo-800 border-indigo-200', label: 'Strong Fit 💼' };
    if (score >= 50) return { bg: 'bg-amber-50 text-amber-800 border-amber-200', label: 'Moderate Fit ⚡' };
    return { bg: 'bg-rose-50 text-rose-800 border-rose-200', label: 'Skills Gap Identified ⚠️' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="p-2 rounded-xl bg-indigo-600/30 text-emerald-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold">AI ATS Compatibility Evaluator</h2>
              <p className="text-xs text-slate-400 font-medium">
                Gemini 3.7 Flash ATS semantic parser for Ethiopian vacancies
              </p>
            </div>
          </div>

          <div className="mt-3 bg-slate-800/80 rounded-xl p-3 border border-slate-700/80 flex items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400">Position:</span>{' '}
              <strong className="text-white">{job.title}</strong>
              <span className="text-slate-400 mx-1.5">•</span>
              <span className="text-emerald-400 font-semibold">{job.company_name}</span>
            </div>
            <span className="text-slate-400 font-mono text-[11px] shrink-0">{job.location_city}</span>
          </div>

          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs sm:text-sm">
          
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <RotateCw className="w-10 h-10 text-indigo-600 animate-spin" />
                <Sparkles className="w-4 h-4 text-emerald-500 absolute top-0 right-0 animate-pulse" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm">Evaluating CV Compatibility...</p>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Parsing technical skills, Ethiopian university qualifications, and role responsibilities.
                </p>
              </div>
            </div>
          ) : matchResult ? (
            <>
              {/* Score Meter & Fit Badge */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-slate-200"
                        fill="transparent"
                      />
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        className={getScoreColor()}
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * score) / 100}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-extrabold text-slate-900 font-mono">{score}%</span>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Match</span>
                    </div>
                  </div>

                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border mb-2 ${getScoreBadge().bg}`}>
                      {getScoreBadge().label}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">Automated ATS Fit Score</h4>
                    <p className="text-xs text-slate-500 mt-0.5 max-w-xs">
                      Evaluated against {job.required_skills.length} core job competencies.
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex sm:flex-col gap-2">
                  <button
                    onClick={() => setIsEditingResume(!isEditingResume)}
                    className="flex-1 sm:flex-none px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs text-center transition-colors"
                  >
                    {isEditingResume ? 'Hide Text' : 'Test With Different CV'}
                  </button>
                </div>
              </div>

              {/* Collapsible custom CV input */}
              {isEditingResume && (
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
                  <label className="font-bold text-slate-800 text-xs block">
                    Paste Candidate CV / Portfolio Text to Re-evaluate:
                  </label>
                  <textarea
                    rows={4}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Paste CV text, experience details, projects..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono"
                  />
                  <button
                    onClick={() => runMatch(customText)}
                    className="px-4 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-bold text-xs"
                  >
                    Re-calculate Score
                  </button>
                </div>
              )}

              {/* Skills Analysis Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Matched Skills */}
                <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Matched Competencies ({matchResult.matchedSkills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.matchedSkills.length > 0 ? (
                      matchResult.matchedSkills.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-900 text-xs font-medium">
                          ✓ {s}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">No direct required skills detected in current text.</p>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Skills To Highlight / Missing ({matchResult.missingSkills.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.missingSkills.length > 0 ? (
                      matchResult.missingSkills.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 text-xs font-medium">
                          + {s}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-emerald-700 font-medium">All mandatory skills matched!</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Experience Analysis & Recommendations */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    <span>Experience & Academic Alignment</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {matchResult.experienceAnalysis}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 space-y-1.5">
                  <h4 className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-indigo-700" />
                    <span>Hiring Recommendation & Advice</span>
                  </h4>
                  <p className="text-xs text-indigo-900 leading-relaxed">
                    {matchResult.recommendation}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <p>No CV text found in profile.</p>
              <button
                onClick={() => setIsEditingResume(true)}
                className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Paste CV Text to Evaluate
              </button>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
          >
            Close
          </button>

          {onApplyDirectly && (
            <button
              onClick={() => {
                onClose();
                onApplyDirectly(job, matchResult || undefined);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-all shadow-xs"
            >
              <span>Continue to Easy Apply</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
