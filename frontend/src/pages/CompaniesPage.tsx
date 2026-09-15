import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Company } from '../types';
import api from '../services/api';
import {
  Building2,
  Search,
  MapPin,
  CheckCircle2,
  Users,
  Briefcase,
  ArrowRight,
} from 'lucide-react';

export const CompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (selectedCity) params.append('city', selectedCity);
        const res = await api.get(`/companies?${params.toString()}`);
        setCompanies(res.data || []);
      } catch (err) {
        console.error('Failed to load companies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [search, selectedCity]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-900">
          <Building2 className="w-4 h-4 text-indigo-600" />
          <span>Verified Ethiopian Employers</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Explore Ethiopian Enterprises</h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Connect directly with top technology startups, financial conglomerates, telecom leaders, and high-growth companies in Addis Ababa, Hawassa, and Dire Dawa.
        </p>
      </div>

      {/* Search & City Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company by name, sector (Fintech, Telecom)..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
        </div>

        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="text-xs sm:text-sm font-medium rounded-xl border border-slate-200 p-2.5 bg-slate-50 text-slate-700 focus:outline-none"
        >
          <option value="">All Ethiopian Cities</option>
          <option value="Addis Ababa">Addis Ababa</option>
          <option value="Hawassa">Hawassa</option>
          <option value="Dire Dawa">Dire Dawa</option>
          <option value="Bahir Dar">Bahir Dar</option>
          <option value="Mekelle">Mekelle</option>
          <option value="Adama">Adama</option>
        </select>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white p-6 rounded-3xl border border-slate-200 animate-pulse space-y-4">
              <div className="w-14 h-14 bg-slate-200 rounded-2xl" />
              <div className="w-32 h-4 bg-slate-200 rounded" />
              <div className="w-full h-12 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : companies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Link
              key={company.company_id}
              to={`/companies/${company.company_id}`}
              className="group bg-white rounded-3xl border border-slate-200 p-6 hover:border-indigo-300 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 p-2 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                    {company.logo_url ? (
                      <img src={company.logo_url} alt={company.name} className="w-full h-full object-contain" />
                    ) : (
                      <Building2 className="w-7 h-7 text-slate-400" />
                    )}
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {company.open_positions_count || 0} Open Roles
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-800 transition-colors">
                    {company.name}
                  </h3>
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">{company.industry}</p>

                <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                  {company.about}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{company.city}, {company.subcity}</span>
                </span>
                <span className="flex items-center gap-1 font-bold text-indigo-700 group-hover:translate-x-0.5 transition-transform">
                  <span>Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
          No verified companies found matching your search.
        </div>
      )}

    </div>
  );
};
