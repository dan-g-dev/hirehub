import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Job } from '../types';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { JobCard } from '../components/JobCard';
import { Bookmark, Briefcase } from 'lucide-react';

export const StudentSavedJobsPage: React.FC = () => {
  const { error } = useToast();
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await api.get('/saved-jobs');
      setSavedJobs(res.data || []);
    } catch (err) {
      console.error('Failed to load saved jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900">
          <Bookmark className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
          <span>Bookmarked Vacancies</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Saved Ethiopian Jobs ({savedJobs.length})
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Review saved positions and apply when you are ready.
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-16 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading your saved jobs...</p>
        </div>
      ) : savedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedJobs.map((job) => (
            <JobCard key={job.job_id} job={job} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No Saved Jobs</h3>
          <p className="text-xs text-slate-500">
            Click the bookmark icon on any job card to save it here for later.
          </p>
          <Link
            to="/jobs"
            className="inline-block px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-indigo-900 shadow-xs"
          >
            Browse Vacancies
          </Link>
        </div>
      )}

    </div>
  );
};
