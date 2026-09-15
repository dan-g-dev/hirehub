import React, { useState, useEffect } from 'react';
import { Job, AIMatchResult } from '../types';
import api from '../services/api';
import { JobCard } from '../components/JobCard';
import { JobCardSkeleton } from '../components/SkeletonLoader';
import { AICVMatchModal } from '../components/AICVMatchModal';
import { ApplyModal } from '../components/ApplyModal';
import { STUDENTS_HERO_IMAGE, STUDENT_GRADUATE_IMAGE } from '../assets/images';
import {
  GraduationCap,
  Sparkles,
  Award,
  BookOpen,
  MapPin,
  CheckCircle2,
  Users,
  Building2,
} from 'lucide-react';

export const InternshipsPage: React.FC = () => {
  const [internships, setInternships] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUniversity, setSelectedUniversity] = useState('ALL');

  // Modals
  const [selectedJobForAI, setSelectedJobForAI] = useState<Job | null>(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);
  const [appliedAiMatch, setAppliedAiMatch] = useState<AIMatchResult | undefined>(undefined);

  useEffect(() => {
    const fetchInternships = async () => {
      setLoading(true);
      try {
        const res = await api.get('/jobs?job_type=INTERNSHIP&limit=20');
        setInternships(res.data.jobs || []);
      } catch (err) {
        console.error('Failed to load internships:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInternships();
  }, []);

  return (
    <div className="space-y-10 pb-16">
      
      {/* Header Banner with Student Pictures */}
      <section className="bg-linear-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white py-12 border-b border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-700 text-xs font-semibold text-emerald-400">
                <GraduationCap className="w-4 h-4" />
                <span>Ethiopian University Graduate Pipeline</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                Student & Graduate Internships in Ethiopia
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Kickstart your career with verified internships, apprenticeships, and graduate trainee programs at leading technology startups, financial institutions, and global organizations in Addis Ababa, Hawassa, and nationwide.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Verified Stipends in ETB</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>University Credit Approved</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Direct Hiring Fast-Track</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 group">
                <img
                  src={STUDENTS_HERO_IMAGE}
                  alt="Ethiopian university students"
                  className="w-full h-56 sm:h-64 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                
                <div className="absolute bottom-3 left-3 right-3 p-3 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-emerald-400 font-bold block">3,200+ Internships Placed</span>
                    <span className="text-[11px] text-slate-300">Top partners: Ethio Telecom, CBE, Ride, Safaricom</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px]">
                    2025 Cohort
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* University Fast-Filter Tabs */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Targeting Ethiopian University Students:</span>
            <p className="text-[11px] text-slate-500">Curated opportunities welcoming final-year and recent graduates.</p>
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            {['ALL', 'Addis Ababa (AAU)', 'Adama (ASTU)', 'Hawassa (HU)', 'Bahir Dar (BDU)'].map((uni) => (
              <button
                key={uni}
                onClick={() => setSelectedUniversity(uni)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all border ${
                  selectedUniversity === uni
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {uni}
              </button>
            ))}
          </div>
        </div>

        {/* Internships Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              Open Internship Vacancies ({internships.length})
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <JobCardSkeleton key={n} />
              ))}
            </div>
          ) : internships.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {internships.map((job) => (
                <JobCard
                  key={job.job_id}
                  job={job}
                  onOpenAIMatch={(j) => setSelectedJobForAI(j)}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
              No internships currently open. Check back shortly or browse standard entry-level vacancies.
            </div>
          )}
        </div>

      </div>

      {/* AI CV Match Modal */}
      <AICVMatchModal
        job={selectedJobForAI}
        isOpen={!!selectedJobForAI}
        onClose={() => setSelectedJobForAI(null)}
        onApplyDirectly={(job, match) => {
          setSelectedJobForApply(job);
          setAppliedAiMatch(match);
        }}
      />

      {/* Apply Modal */}
      <ApplyModal
        job={selectedJobForApply}
        isOpen={!!selectedJobForApply}
        onClose={() => setSelectedJobForApply(null)}
        onSuccess={() => {}}
        aiMatch={appliedAiMatch}
      />

    </div>
  );
};
