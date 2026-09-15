import React from 'react';
import { Category, LocationItem } from '../types';
import { Filter, X, MapPin, Briefcase, RotateCcw, Banknote, Sparkles } from 'lucide-react';

interface JobFilterSidebarProps {
  categories: Category[];
  locations: LocationItem[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedLocation: string;
  onSelectLocation: (location: string) => void;
  selectedJobType: string;
  onSelectJobType: (jobType: string) => void;
  selectedExperience: string;
  onSelectExperience: (level: string) => void;
  selectedWorkplace: string;
  onSelectWorkplace: (workplace: string) => void;
  minSalary: number;
  onChangeMinSalary: (salary: number) => void;
  onResetFilters: () => void;
  isInternshipsOnly?: boolean;
}

export const JobFilterSidebar: React.FC<JobFilterSidebarProps> = ({
  categories,
  locations,
  selectedCategory,
  onSelectCategory,
  selectedLocation,
  onSelectLocation,
  selectedJobType,
  onSelectJobType,
  selectedExperience,
  onSelectExperience,
  selectedWorkplace,
  onSelectWorkplace,
  minSalary,
  onChangeMinSalary,
  onResetFilters,
  isInternshipsOnly = false,
}) => {
  const hasActiveFilters = 
    (selectedCategory && selectedCategory !== 'all') ||
    selectedLocation ||
    (selectedJobType && selectedJobType !== 'ALL') ||
    (selectedExperience && selectedExperience !== 'ALL') ||
    (selectedWorkplace && selectedWorkplace !== 'ALL') ||
    minSalary > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-6 shadow-xs">
      
      {/* Title & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <Filter className="w-4 h-4 text-indigo-700" />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Job Category
        </label>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            onClick={() => onSelectCategory('all')}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left ${
              !selectedCategory || selectedCategory === 'all'
                ? 'bg-indigo-50 text-indigo-900 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.category_id}
              onClick={() => onSelectCategory(cat.name)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left ${
                selectedCategory.toLowerCase() === cat.name.toLowerCase()
                  ? 'bg-indigo-50 text-indigo-900 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="truncate pr-2">{cat.name}</span>
              {cat.job_count !== undefined && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold shrink-0">
                  {cat.job_count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Ethiopian Location */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          <span>Location (Ethiopia)</span>
        </label>
        <select
          value={selectedLocation}
          onChange={(e) => onSelectLocation(e.target.value)}
          className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 text-slate-800 font-medium"
        >
          <option value="">All Locations in Ethiopia</option>
          <optgroup label="Addis Ababa Subcities">
            <option value="Bole">Addis Ababa — Bole</option>
            <option value="Kazanchis">Addis Ababa — Kazanchis / Kirkos</option>
            <option value="Piazza">Addis Ababa — Piazza / Arada</option>
            <option value="Yeka">Addis Ababa — Yeka</option>
            <option value="Nifas Silk">Addis Ababa — Nifas Silk-Lafto</option>
            <option value="Lideta">Addis Ababa — Lideta</option>
            <option value="Addis Ababa">Addis Ababa (General)</option>
          </optgroup>
          <optgroup label="Regional Technology Hubs">
            <option value="Hawassa">Hawassa (Sidama)</option>
            <option value="Dire Dawa">Dire Dawa Free Trade Zone</option>
            <option value="Bahir Dar">Bahir Dar (Amhara)</option>
            <option value="Mekelle">Mekelle (Tigray)</option>
            <option value="Adama">Adama / Nazret (Oromia)</option>
            <option value="Jimma">Jimma (Oromia)</option>
            <option value="Debre Berhan">Debre Berhan (Industrial Hub)</option>
          </optgroup>
        </select>
      </div>

      {/* Job Type (if not forced to internships) */}
      {!isInternshipsOnly && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Employment Type
          </label>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {[
              { id: 'ALL', label: 'All Types' },
              { id: 'FULL_TIME', label: 'Full Time' },
              { id: 'INTERNSHIP', label: 'Internship 🎓' },
              { id: 'PART_TIME', label: 'Part Time' },
              { id: 'CONTRACT', label: 'Contract' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectJobType(t.id)}
                className={`px-2.5 py-2 rounded-lg text-center font-medium transition-colors border ${
                  selectedJobType === t.id
                    ? 'bg-indigo-900 text-white border-indigo-900 font-bold shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Workplace Type */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Workplace Model
        </label>
        <div className="flex gap-1.5 text-xs">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'ON_SITE', label: 'On-site' },
            { id: 'HYBRID', label: 'Hybrid' },
            { id: 'REMOTE', label: 'Remote' },
          ].map((w) => (
            <button
              key={w.id}
              onClick={() => onSelectWorkplace(w.id)}
              className={`flex-1 py-1.5 rounded-lg text-center font-medium transition-colors border ${
                selectedWorkplace === w.id
                  ? 'bg-emerald-800 text-white border-emerald-800 font-bold'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Experience Level
        </label>
        <select
          value={selectedExperience}
          onChange={(e) => onSelectExperience(e.target.value)}
          className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600 text-slate-800 font-medium"
        >
          <option value="ALL">All Experience Levels</option>
          <option value="INTERNSHIP">Internship / Student</option>
          <option value="ENTRY_LEVEL">Entry Level / Fresh Graduate (0-1 yrs)</option>
          <option value="MID_LEVEL">Mid Level (2-4 yrs)</option>
          <option value="SENIOR_LEVEL">Senior Level (5+ yrs)</option>
          <option value="DIRECTOR">Lead / Director</option>
        </select>
      </div>

      {/* Minimum Salary in ETB */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs">
          <label className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
            <Banknote className="w-3.5 h-3.5 text-emerald-600" />
            <span>Min Salary (ETB)</span>
          </label>
          <span className="font-bold text-emerald-800 font-mono">
            {minSalary > 0 ? `ETB ${minSalary.toLocaleString()}+` : 'Any'}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="80000"
          step="5000"
          value={minSalary}
          onChange={(e) => onChangeMinSalary(Number(e.target.value))}
          className="w-full accent-emerald-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>0 ETB</span>
          <span>40,000 ETB</span>
          <span>80,000+ ETB</span>
        </div>
      </div>

    </div>
  );
};
