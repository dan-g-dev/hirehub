import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Job, Category, LocationItem, AIMatchResult } from '../types';
import api from '../services/api';
import { JobCard } from '../components/JobCard';
import { JobFilterSidebar } from '../components/JobFilterSidebar';
import { JobCardSkeleton } from '../components/SkeletonLoader';
import { EmptyState } from '../components/EmptyState';
import { AICVMatchModal } from '../components/AICVMatchModal';
import { ApplyModal } from '../components/ApplyModal';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  ChevronLeft,
  ChevronRight,
  Briefcase,
} from 'lucide-react';

export const JobsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [jobType, setJobType] = useState(searchParams.get('job_type') || 'ALL');
  const [experience, setExperience] = useState(searchParams.get('experience_level') || 'ALL');
  const [workplace, setWorkplace] = useState(searchParams.get('workplace_type') || 'ALL');
  const [minSalary, setMinSalary] = useState<number>(Number(searchParams.get('salary_min')) || 0);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'latest');
  const [currentPage, setCurrentPage] = useState(1);

  // Data States
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Modals
  const [selectedJobForAI, setSelectedJobForAI] = useState<Job | null>(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);
  const [appliedAiMatch, setAppliedAiMatch] = useState<AIMatchResult | undefined>(undefined);

  // Initial load for categories & locations
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          api.get('/jobs/categories'),
          api.get('/jobs/locations'),
        ]);
        setCategories(catRes.data || []);
        setLocations(locRes.data || []);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    fetchMeta();
  }, []);

  // Fetch Jobs based on filters
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('q', searchQuery.trim());
      if (category && category !== 'all') params.append('category', category);
      if (location) params.append('location', location);
      if (jobType && jobType !== 'ALL') params.append('job_type', jobType);
      if (experience && experience !== 'ALL') params.append('experience_level', experience);
      if (workplace && workplace !== 'ALL') params.append('workplace_type', workplace);
      if (minSalary > 0) params.append('salary_min', String(minSalary));
      if (sortBy) params.append('sort', sortBy);
      params.append('page', String(currentPage));
      params.append('limit', '9');

      const res = await api.get(`/jobs?${params.toString()}`);
      setJobs(res.data.jobs || []);
      setTotalJobs(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [category, location, jobType, experience, workplace, minSalary, sortBy, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchJobs();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategory('all');
    setLocation('');
    setJobType('ALL');
    setExperience('ALL');
    setWorkplace('ALL');
    setMinSalary(0);
    setSortBy('latest');
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, company name, required skill (e.g. React, Accounting, Python)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-900 text-white font-bold text-xs sm:text-sm transition-colors shadow-2xs"
          >
            Search
          </button>

          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </form>

        {/* Active Filters Row & Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-slate-500">Active:</span>
            {category && category !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-200 text-[11px] font-medium">
                {category}
                <button onClick={() => setCategory('all')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {location && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] font-medium">
                {location}
                <button onClick={() => setLocation('')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {jobType && jobType !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-medium">
                {jobType.replace('_', ' ')}
                <button onClick={() => setJobType('ALL')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {minSalary > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-medium">
                ETB {minSalary.toLocaleString()}+
                <button onClick={() => setMinSalary(0)}><X className="w-3 h-3" /></button>
              </span>
            )}
            {(!category || category === 'all') && !location && jobType === 'ALL' && minSalary === 0 && (
              <span className="text-slate-400 italic">Showing all Ethiopian vacancies</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold rounded-lg border border-slate-200 p-1.5 bg-white text-slate-800 focus:outline-none"
            >
              <option value="latest">Latest Posted</option>
              <option value="salary_high">Highest Salary (ETB)</option>
              <option value="deadline">Closing Soon</option>
              <option value="applications">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Filter Sidebar (Desktop) */}
        <div className="hidden lg:block lg:col-span-4 xl:col-span-3">
          <JobFilterSidebar
            categories={categories}
            locations={locations}
            selectedCategory={category}
            onSelectCategory={(c) => { setCategory(c); setCurrentPage(1); }}
            selectedLocation={location}
            onSelectLocation={(l) => { setLocation(l); setCurrentPage(1); }}
            selectedJobType={jobType}
            onSelectJobType={(t) => { setJobType(t); setCurrentPage(1); }}
            selectedExperience={experience}
            onSelectExperience={(e) => { setExperience(e); setCurrentPage(1); }}
            selectedWorkplace={workplace}
            onSelectWorkplace={(w) => { setWorkplace(w); setCurrentPage(1); }}
            minSalary={minSalary}
            onChangeMinSalary={(s) => { setMinSalary(s); setCurrentPage(1); }}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFilterOpen && (
          <div className="lg:hidden col-span-12">
            <JobFilterSidebar
              categories={categories}
              locations={locations}
              selectedCategory={category}
              onSelectCategory={(c) => { setCategory(c); setCurrentPage(1); }}
              selectedLocation={location}
              onSelectLocation={(l) => { setLocation(l); setCurrentPage(1); }}
              selectedJobType={jobType}
              onSelectJobType={(t) => { setJobType(t); setCurrentPage(1); }}
              selectedExperience={experience}
              onSelectExperience={(e) => { setExperience(e); setCurrentPage(1); }}
              selectedWorkplace={workplace}
              onSelectWorkplace={(w) => { setWorkplace(w); setCurrentPage(1); }}
              minSalary={minSalary}
              onChangeMinSalary={(s) => { setMinSalary(s); setCurrentPage(1); }}
              onResetFilters={handleResetFilters}
            />
          </div>
        )}

        {/* Right Job Results */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Showing <strong className="text-slate-900">{jobs.length}</strong> of <strong className="text-slate-900">{totalJobs}</strong> vacancies</span>
            <span>Page {currentPage} of {totalPages}</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <JobCardSkeleton key={n} />
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <JobCard
                  key={job.job_id}
                  job={job}
                  onOpenAIMatch={(j) => setSelectedJobForAI(j)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Briefcase}
              title="No Matching Vacancies Found"
              description="Try broadening your search keywords or resetting your location and category filters."
              actionText="Reset All Filters"
              onAction={handleResetFilters}
            />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${
                    currentPage === pageNum
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
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
