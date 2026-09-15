import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { EducationItem, ExperienceItem, CertificationItem, LanguageItem } from '../types';
import { STUDENT_GRADUATE_IMAGE, STUDENT_AVATARS } from '../assets/images';
import {
  User,
  Upload,
  FileText,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Award,
  Globe,
  Save,
  Link as LinkIcon,
  RotateCw,
  Camera,
} from 'lucide-react';

const POPULAR_SKILLS = [
  'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Django',
  'SQL', 'PostgreSQL', 'MySQL', 'Tailwind CSS', 'Next.js', 'Flutter',
  'Mobile App Development', 'Figma', 'UI/UX Design', 'Accounting',
  'IFRS Financial Reporting', 'Peachtree / QuickBooks', 'Data Analysis',
  'Project Management', 'Digital Marketing', 'Customer Support',
];

export const StudentProfilePage: React.FC = () => {
  const { user, profile, updateProfileState, refreshUser } = useAuth();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [headline, setHeadline] = useState(profile?.headline || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [citySubcity, setCitySubcity] = useState(profile?.city_subcity || 'Addis Ababa (Bole)');
  const [portfolioUrl, setPortfolioUrl] = useState(profile?.portfolio_url || '');
  const [githubUrl, setGithubUrl] = useState(profile?.github_url || '');
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url || '');

  // Skills
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Complex lists
  const [education, setEducation] = useState<EducationItem[]>(profile?.education || []);
  const [experience, setExperience] = useState<ExperienceItem[]>(profile?.experience || []);
  const [certifications, setCertifications] = useState<CertificationItem[]>(profile?.certifications || []);
  const [languages, setLanguages] = useState<LanguageItem[]>(
    profile?.languages && profile.languages.length > 0
      ? profile.languages
      : [
          { language_id: 1, language_name: 'Amharic', proficiency: 'NATIVE' },
          { language_id: 2, language_name: 'English', proficiency: 'FLUENT' },
        ]
  );

  // Resume Upload
  const [uploadingResume, setUploadingResume] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pastedCvText, setPastedCvText] = useState(profile?.cv_extracted_text || '');
  const [showPastedInput, setShowPastedInput] = useState(false);

  useEffect(() => {
    if (profile) {
      setHeadline(profile.headline || '');
      setBio(profile.bio || '');
      setCitySubcity(profile.city_subcity || 'Addis Ababa');
      setPortfolioUrl(profile.portfolio_url || '');
      setGithubUrl(profile.github_url || '');
      setLinkedinUrl(profile.linkedin_url || '');
      setSkills(profile.skills || []);
      setEducation(profile.education || []);
      setExperience(profile.experience || []);
      setCertifications(profile.certifications || []);
      setPastedCvText(profile.cv_extracted_text || '');
    }
  }, [profile]);

  // Handle CV File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setUploadingResume(true);
    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateProfileState(res.data.profile);
      setPastedCvText(res.data.profile.cv_extracted_text || '');
      if (res.data.profile.skills && res.data.profile.skills.length > skills.length) {
        setSkills(res.data.profile.skills);
      }
      success('CV uploaded and parsed successfully! Profile strength updated.');
    } catch (err: any) {
      error(err.response?.data?.error || 'CV upload failed.');
    } finally {
      setUploadingResume(false);
    }
  };

  // Add / Remove Skill
  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  // Education Helpers
  const handleAddEducation = () => {
    setEducation([
      ...education,
      {
        education_id: Date.now(),
        institution: 'Addis Ababa University (AAU)',
        degree: 'B.Sc. in Software Engineering',
        field_of_study: 'Computer Science & Engineering',
        start_year: '2021',
        end_year: '2025',
        gpa: '3.85',
      },
    ]);
  };

  const handleRemoveEducation = (id: number) => {
    setEducation(education.filter(e => e.education_id !== id));
  };

  // Experience Helpers
  const handleAddExperience = () => {
    setExperience([
      ...experience,
      {
        experience_id: Date.now(),
        title: 'Junior Developer Intern',
        company_name: 'Tech Startup Addis',
        location: 'Addis Ababa, Bole',
        start_date: '2024-06',
        end_date: '2024-09',
        is_current: false,
        description: 'Assisted in building responsive frontend interfaces using React and Tailwind CSS.',
      },
    ]);
  };

  const handleRemoveExperience = (id: number) => {
    setExperience(experience.filter(e => e.experience_id !== id));
  };

  // Save Full Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.put('/profile', {
        full_name: fullName,
        phone_number: phoneNumber,
        headline,
        bio,
        city_subcity: citySubcity,
        portfolio_url: portfolioUrl,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
        education,
        experience,
        certifications,
        languages,
        skills,
      });

      updateProfileState(res.data.profile);
      await refreshUser();
      success('Profile and ATS resume details saved successfully!');
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Profile Completion: {profile?.profile_completion_percentage || 20}%</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Candidate CV & Professional Profile</h1>
          <p className="text-xs text-slate-500 mt-1">
            Build a comprehensive ATS-optimized profile. Upload your Ethiopian CV for automatic AI compatibility benchmarking.
          </p>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs text-white bg-slate-900 hover:bg-indigo-900 transition-all shadow-md self-start"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-8">
        
        {/* Section 1: CV Upload / Extraction */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-700" />
              <span>Resume / CV Document (PDF, DOCX)</span>
            </h2>
            <button
              type="button"
              onClick={() => setShowPastedInput(!showPastedInput)}
              className="text-xs font-bold text-indigo-700 hover:underline"
            >
              {showPastedInput ? 'Hide Pasted Text' : 'Paste CV Text Instead'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Upload Box */}
            <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
              <input
                type="file"
                id="resume-file-input"
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
              />
              <label htmlFor="resume-file-input" className="cursor-pointer block space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto">
                  {uploadingResume ? (
                    <RotateCw className="w-6 h-6 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold text-indigo-700 block hover:underline">
                    {uploadingResume ? 'Uploading & Extracting Text...' : 'Click to Upload PDF or DOCX Resume'}
                  </span>
                  <span className="text-[11px] text-slate-400">Max size: 10MB</span>
                </div>
              </label>
            </div>

            {/* Current Attached CV */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between text-xs">
              <div>
                <span className="text-slate-400 font-bold block mb-1">Active Profile CV:</span>
                <p className="font-bold text-slate-900 text-sm truncate">
                  {profile?.cv_filename || 'No CV file uploaded yet'}
                </p>
                <p className="text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                  {profile?.cv_extracted_text
                    ? `Extracted: ${profile.cv_extracted_text.slice(0, 150)}...`
                    : 'Upload your CV above to enable 1-click AI scoring on every job.'}
                </p>
              </div>
              <div className="pt-3 flex items-center gap-2">
                <span className="text-emerald-700 font-bold">✓ Ready for AI Matching</span>
              </div>
            </div>

          </div>

          {/* Pasted text option */}
          {showPastedInput && (
            <div className="pt-3 space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Pasted Resume Content:
              </label>
              <textarea
                rows={5}
                value={pastedCvText}
                onChange={(e) => setPastedCvText(e.target.value)}
                placeholder="Paste the full text of your CV here..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          )}
        </div>

        {/* Section 2: Basic Contact & Professional Headline */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-700" />
            <span>Candidate Photo & Personal Information</span>
          </h2>

          {/* Student Photo & Avatar Display */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="relative group">
              <img
                src={user?.avatar_url || STUDENT_GRADUATE_IMAGE}
                alt="Student profile"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-white shadow-md"
              />
              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity flex items-center justify-center text-white text-xs font-bold pointer-events-none">
                <Camera className="w-5 h-5" />
              </div>
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <span className="text-xs font-bold text-slate-900 block">Student Profile Picture</span>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-md">
                A clear, professional picture helps Ethiopian recruiters recognize you during candidate ATS screenings and interview invitations.
              </p>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <span className="text-[11px] font-semibold text-slate-600">Sample Avatars:</span>
                {[
                  STUDENT_GRADUATE_IMAGE,
                  ...STUDENT_AVATARS,
                ].map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (user) user.avatar_url = imgUrl;
                      success('Profile picture selected!');
                    }}
                    className="w-7 h-7 rounded-full overflow-hidden border-2 border-slate-200 hover:border-blue-600 focus:ring-2 focus:ring-blue-600 transition-all"
                  >
                    <img src={imgUrl} alt="Avatar option" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Phone Number (Ethiopia)</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+251 91 123 4567"
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Professional Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Software Engineering Graduate | React & TypeScript Developer"
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Location in Ethiopia</label>
              <select
                value={citySubcity}
                onChange={(e) => setCitySubcity(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              >
                <option value="Addis Ababa (Bole)">Addis Ababa — Bole</option>
                <option value="Addis Ababa (Kazanchis / Kirkos)">Addis Ababa — Kazanchis / Kirkos</option>
                <option value="Addis Ababa (Piazza / Arada)">Addis Ababa — Piazza / Arada</option>
                <option value="Addis Ababa (Yeka)">Addis Ababa — Yeka</option>
                <option value="Addis Ababa (Nifas Silk)">Addis Ababa — Nifas Silk</option>
                <option value="Hawassa">Hawassa (Sidama)</option>
                <option value="Dire Dawa">Dire Dawa Free Zone</option>
                <option value="Bahir Dar">Bahir Dar</option>
                <option value="Mekelle">Mekelle</option>
                <option value="Adama">Adama</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Portfolio / Website Link</label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="https://myportfolio.et"
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Short Biography & Goals</label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Summarize your technical foundation, academic honors, and career aspirations in Ethiopia..."
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Skills Selection */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span>Key Skills & Technical Competencies</span>
          </h2>

          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map((s, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-900 border border-indigo-200 text-xs font-bold"
              >
                <span>{s}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(s)}
                  className="p-0.5 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill(newSkillInput);
                }
              }}
              placeholder="Add skill (e.g. Next.js, Financial Modeling)..."
              className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
            <button
              type="button"
              onClick={() => handleAddSkill(newSkillInput)}
              className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-indigo-900"
            >
              Add
            </button>
          </div>

          {/* Quick Add Suggestions */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
              Popular in Ethiopian Tech & Business:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SKILLS.filter(s => !skills.includes(s)).map((popSkill) => (
                <button
                  key={popSkill}
                  type="button"
                  onClick={() => handleAddSkill(popSkill)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                >
                  + {popSkill}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Education History */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-700" />
              <span>Education & University Qualifications</span>
            </h2>
            <button
              type="button"
              onClick={handleAddEducation}
              className="flex items-center gap-1 text-xs font-bold text-indigo-700 hover:underline"
            >
              <Plus className="w-4 h-4" />
              <span>Add Education</span>
            </button>
          </div>

          <div className="space-y-4">
            {education.map((edu, idx) => (
              <div key={edu.education_id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative text-xs">
                <button
                  type="button"
                  onClick={() => handleRemoveEducation(edu.education_id)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-rose-600"
                  aria-label="Remove education"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => {
                        const updated = [...education];
                        updated[idx].institution = e.target.value;
                        setEducation(updated);
                      }}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => {
                        const updated = [...education];
                        updated[idx].degree = e.target.value;
                        setEducation(updated);
                      }}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Years (e.g. 2021 - 2025)</label>
                    <input
                      type="text"
                      value={`${edu.start_year} - ${edu.end_year || 'Present'}`}
                      onChange={(e) => {
                        const parts = e.target.value.split('-');
                        const updated = [...education];
                        updated[idx].start_year = parts[0]?.trim() || '';
                        updated[idx].end_year = parts[1]?.trim() || '';
                        setEducation(updated);
                      }}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">GPA / Honors</label>
                    <input
                      type="text"
                      value={edu.gpa || ''}
                      onChange={(e) => {
                        const updated = [...education];
                        updated[idx].gpa = e.target.value;
                        setEducation(updated);
                      }}
                      placeholder="e.g. 3.85 / Very Great Distinction"
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5: Work & Internship Experience */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-700" />
              <span>Work & Project Experience</span>
            </h2>
            <button
              type="button"
              onClick={handleAddExperience}
              className="flex items-center gap-1 text-xs font-bold text-indigo-700 hover:underline"
            >
              <Plus className="w-4 h-4" />
              <span>Add Experience</span>
            </button>
          </div>

          <div className="space-y-4">
            {experience.map((exp, idx) => (
              <div key={exp.experience_id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative text-xs">
                <button
                  type="button"
                  onClick={() => handleRemoveExperience(exp.experience_id)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-rose-600"
                  aria-label="Remove experience"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Job Title</label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => {
                        const updated = [...experience];
                        updated[idx].title = e.target.value;
                        setExperience(updated);
                      }}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Company / Organization</label>
                    <input
                      type="text"
                      value={exp.company_name}
                      onChange={(e) => {
                        const updated = [...experience];
                        updated[idx].company_name = e.target.value;
                        setExperience(updated);
                      }}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">Description & Impact</label>
                    <textarea
                      rows={2}
                      value={exp.description || ''}
                      onChange={(e) => {
                        const updated = [...experience];
                        updated[idx].description = e.target.value;
                        setExperience(updated);
                      }}
                      className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-emerald-700 hover:bg-emerald-800 transition-all shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Profile...' : 'Save & Update Profile'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
