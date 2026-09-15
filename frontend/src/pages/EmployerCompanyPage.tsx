import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Building2, Save, ArrowLeft, Globe, MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EmployerCompanyPage: React.FC = () => {
  const navigate = useNavigate();
  const { company, updateCompanyState } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(company?.name || '');
  const [industry, setIndustry] = useState(company?.industry || '');
  const [city, setCity] = useState(company?.city || 'Addis Ababa');
  const [subcity, setSubcity] = useState(company?.subcity || 'Bole');
  const [companySize, setCompanySize] = useState(company?.company_size || '50-250');
  const [website, setWebsite] = useState(company?.website || '');
  const [logoUrl, setLogoUrl] = useState(company?.logo_url || '');
  const [about, setAbout] = useState(company?.about || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (company) {
      setName(company.name);
      setIndustry(company.industry);
      setCity(company.city);
      setSubcity(company.subcity);
      setCompanySize(company.company_size);
      setWebsite(company.website || '');
      setLogoUrl(company.logo_url || '');
      setAbout(company.about);
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.put('/companies/me', {
        name,
        industry,
        city,
        subcity,
        company_size: companySize,
        website,
        logo_url: logoUrl,
        about,
      });

      updateCompanyState(res.data.company);
      success('Company profile updated successfully!');
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to update company profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-900 mb-2">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Employer Profile</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Manage Company Profile</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            This profile is displayed on all published Ethiopian job cards and the directory.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Company Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Industry Sector *</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">City</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="Addis Ababa">Addis Ababa</option>
                <option value="Hawassa">Hawassa</option>
                <option value="Dire Dawa">Dire Dawa</option>
                <option value="Bahir Dar">Bahir Dar</option>
                <option value="Mekelle">Mekelle</option>
                <option value="Adama">Adama</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Subcity / Area</label>
              <input
                type="text"
                value={subcity}
                onChange={(e) => setSubcity(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Company Size</label>
              <select
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="1-10">1-10 (Startup)</option>
                <option value="10-50">10-50 (Small Enterprise)</option>
                <option value="50-250">50-250 (Mid Size)</option>
                <option value="250-1000">250-1,000 (Large Enterprise)</option>
                <option value="1000+">1,000+ (Conglomerate / Global)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Website URL</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Logo Image URL</label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">About Company</label>
              <textarea
                rows={5}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs text-white bg-slate-900 hover:bg-indigo-900 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </div>
      </form>

    </div>
  );
};
