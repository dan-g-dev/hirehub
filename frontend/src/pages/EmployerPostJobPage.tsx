import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { JobType, WorkplaceType, ExperienceLevel, SalaryType, Category } from '../types';
import api from '../services/api';
import {
  Briefcase,
  Plus,
  Trash2,
  MapPin,
  Banknote,
  Calendar,
  Sparkles,
  Eye,
  Save,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export const EmployerPostJobPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, company } = useAuth();
  const { success, error } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [jobType, setJobType] = useState<JobType>('FULL_TIME');
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType>('HYBRID');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('ENTRY_LEVEL');
  const [locationCity, setLocationCity] = useState('Addis Ababa');
  const [locationSubcity, setLocationSubcity] = useState('Bole');
  
  // Salary
  const [salaryType, setSalaryType] = useState<SalaryType>('RANGE');
  const [salaryMin, setSalaryMin] = useState<number>(20000);
  const [salaryMax, setSalaryMax] = useState<number>(35000);
  const [salaryExact, setSalaryExact] = useState<number>(25000);

  // Lists
  const [requiredSkills, setRequiredSkills] = useState<string[]>(['React', 'TypeScript', 'Tailwind CSS']);
  const [newSkill, setNewSkill] = useState('');
  const [preferredSkills, setPreferredSkills] = useState<string[]>(['Node.js', 'Next.js']);
  const [newPrefSkill, setNewPrefSkill] = useState('');

  const [description, setDescription] = useState(
    'We are looking for an ambitious and talented professional to join our growing engineering team in Addis Ababa. You will collaborate closely with product managers and senior developers to deliver high-quality digital solutions for the Ethiopian market.'
  );

  const [responsibilities, setResponsibilities] = useState<string[]>([
    'Design and implement responsive web applications using modern frameworks.',
    'Collaborate with cross-functional product and design teams in Addis Ababa.',
    'Write clean, maintainable, and well-tested code.',
  ]);
  const [newResp, setNewResp] = useState('');

  const [requirements, setRequirements] = useState<string[]>([
    'B.Sc. in Software Engineering, Computer Science, or related field from a recognized institution.',
    'Solid foundation in modern web development practices and version control (Git).',
    'Fluency in English and Amharic.',
  ]);
  const [newReq, setNewReq] = useState('');

  const [benefits, setBenefits] = useState<string[]>([
    'Competitive salary in ETB with annual performance review',
    'Health insurance coverage and transportation allowance',
    'Continuous training and mentorship programs',
  ]);
  const [newBenefit, setNewBenefit] = useState('');

  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/jobs/categories');
        setCategories(res.data || []);
        if (res.data.length > 0) setCategoryId(res.data[0].category_id);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  const handleAddSkill = () => {
    if (newSkill.trim() && !requiredSkills.includes(newSkill.trim())) {
      setRequiredSkills([...requiredSkills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleAddPrefSkill = () => {
    if (newPrefSkill.trim() && !preferredSkills.includes(newPrefSkill.trim())) {
      setPreferredSkills([...preferredSkills, newPrefSkill.trim()]);
      setNewPrefSkill('');
    }
  };

  const handleAddResp = () => {
    if (newResp.trim()) {
      setResponsibilities([...responsibilities, newResp.trim()]);
      setNewResp('');
    }
  };

  const handleAddReq = () => {
    if (newReq.trim()) {
      setRequirements([...requirements, newReq.trim()]);
      setNewReq('');
    }
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      error('Job title and description are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/jobs', {
        title,
        category_id: categoryId,
        job_type: jobType,
        workplace_type: workplaceType,
        experience_level: experienceLevel,
        location_city: locationCity,
        location_subcity: locationSubcity,
        salary_type: salaryType,
        salary_min: salaryType === 'RANGE' ? salaryMin : undefined,
        salary_max: salaryType === 'RANGE' ? salaryMax : undefined,
        salary_exact: salaryType === 'EXACT' ? salaryExact : undefined,
        required_skills: requiredSkills,
        preferred_skills: preferredSkills,
        description,
        responsibilities,
        requirements,
        benefits,
        deadline,
      });

      success('Ethiopian job vacancy published successfully!');
      navigate(`/jobs/${res.data.job.job_id}`);
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to publish job.');
    } finally {
      setIsSubmitting(false);
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

      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 mb-2">
            <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
            <span>Posting on HireHub Ethiopia</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Publish New Job / Internship</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Reach thousands of qualified Ethiopian professionals, fresh graduates, and university interns.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
        
        {/* Basic Position Details */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">1. Position Overview</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Job Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Backend Engineer, Junior Accountant, Flutter Developer"
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium"
                required
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Job Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Job Type</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value as JobType)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERNSHIP">Internship / Trainee</option>
                <option value="TEMPORARY">Temporary</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Workplace Arrangement</label>
              <select
                value={workplaceType}
                onChange={(e) => setWorkplaceType(e.target.value as WorkplaceType)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="ON_SITE">On-Site</option>
                <option value="HYBRID">Hybrid (Addis Ababa + Remote)</option>
                <option value="REMOTE">100% Remote</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="ENTRY_LEVEL">Fresh Graduate / Entry Level (0-2 yrs)</option>
                <option value="MID_LEVEL">Mid Level (2-5 yrs)</option>
                <option value="SENIOR">Senior (5+ yrs)</option>
                <option value="LEAD">Lead / Managerial</option>
                <option value="INTERNSHIP">Student Internship</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location & Compensation */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">2. Location & ETB Salary</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">City</label>
              <select
                value={locationCity}
                onChange={(e) => setLocationCity(e.target.value)}
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
                value={locationSubcity}
                onChange={(e) => setLocationSubcity(e.target.value)}
                placeholder="e.g. Bole, Kazanchis, Kirkos, Piazza"
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Salary Structure</label>
              <select
                value={salaryType}
                onChange={(e) => setSalaryType(e.target.value as SalaryType)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="RANGE">Salary Range (ETB)</option>
                <option value="EXACT">Fixed Amount (ETB)</option>
                <option value="COMPETITIVE">Competitive / Negotiable</option>
                <option value="UNPAID">Stipend / Unpaid</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Application Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
            </div>

            {salaryType === 'RANGE' && (
              <>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Min Monthly Salary (ETB)</label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Max Monthly Salary (ETB)</label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Skills & Description */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">3. Competencies & Description</h2>

          <div className="space-y-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Required Skills (ATS Evaluated)</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {requiredSkills.map((s, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold">
                    <span>{s}</span>
                    <button type="button" onClick={() => setRequiredSkills(requiredSkills.filter(x => x !== s))}>
                      <Trash2 className="w-3 h-3 hover:text-rose-600" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2 max-w-sm">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add required skill..."
                  className="p-2 rounded-lg border border-slate-200 flex-1 text-xs"
                />
                <button type="button" onClick={handleAddSkill} className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold">
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Job Overview / Description</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-emerald-700 hover:bg-emerald-800 transition-all shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Publishing Vacancy...' : 'Publish Job Vacancy'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
