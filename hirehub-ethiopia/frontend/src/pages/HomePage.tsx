import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Job, Category, Company, AIMatchResult } from '../types';
import api from '../services/api';
import { AICVMatchModal } from '../components/AICVMatchModal';
import { ApplyModal } from '../components/ApplyModal';
import { ETHIOPIAN_HERO_PROFESSIONALS } from '../assets/images';
import { useToast } from '../context/ToastContext';
import {
  Search,
  MapPin,
  Sparkles,
  Building2,
  GraduationCap,
  Briefcase,
  ArrowRight,
  Code2,
  Megaphone,
  Calculator,
  Settings,
  Headphones,
  Palette,
  Grid,
  Bookmark,
  ChevronRight,
  FileText,
  Target,
  Send,
  CheckCircle2,
  ShieldCheck,
  Star,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { success } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Addis Ababa, Ethiopia');
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Record<string, boolean>>({});

  // Modal States
  const [selectedJobForAI, setSelectedJobForAI] = useState<Job | null>(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);
  const [appliedAiMatch, setAppliedAiMatch] = useState<AIMatchResult | undefined>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, compsRes] = await Promise.all([
          api.get('/jobs?limit=10'),
          api.get('/companies?limit=10'),
        ]);

        setFeaturedJobs(jobsRes.data.jobs || []);
        setCompanies(compsRes.data || []);
      } catch (err) {
        console.error('Failed to load home page data:', err);
      }
    };

    fetchData();
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('q', searchQuery.trim());
    if (selectedLocation && selectedLocation !== 'Addis Ababa, Ethiopia') {
      params.append('location', selectedLocation);
    }
    navigate(`/jobs?${params.toString()}`);
  };

  const toggleBookmark = (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedJobs((prev) => {
      const isBookmarked = !prev[jobId];
      if (isBookmarked) {
        success('Saved to your bookmarks!');
      }
      return { ...prev, [jobId]: isBookmarked };
    });
  };

  // 8 Specific Categories matching design
  const popularCategories = [
    {
      id: 'software',
      name: 'Software Development',
      jobs: '2,350 jobs',
      icon: Code2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'marketing',
      name: 'Marketing',
      jobs: '1,250 jobs',
      icon: Megaphone,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      id: 'finance',
      name: 'Accounting & Finance',
      jobs: '1,120 jobs',
      icon: Calculator,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      id: 'engineering',
      name: 'Engineering',
      jobs: '1,450 jobs',
      icon: Settings,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'internships',
      name: 'Internships',
      jobs: '2,100 jobs',
      icon: GraduationCap,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
      link: '/internships',
    },
    {
      id: 'support',
      name: 'Customer Service',
      jobs: '980 jobs',
      icon: Headphones,
      color: 'text-sky-600',
      bgColor: 'bg-sky-50',
    },
    {
      id: 'design',
      name: 'Design',
      jobs: '850 jobs',
      icon: Palette,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
    {
      id: 'all',
      name: 'View All Categories',
      jobs: 'Explore more',
      icon: Grid,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/jobs',
    },
  ];

  // Specific 4 Featured Jobs matching the exact screenshot
  const displayFeaturedJobs = [
    {
      id: 'job-1',
      title: 'Frontend Developer',
      company: 'Safaricom Ethiopia',
      companyLogo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
      companyBadgeColor: 'bg-emerald-600',
      location: 'Addis Ababa',
      type: 'Full-time',
      salary: 'ETB 25K – 40K',
      skills: ['React', 'JavaScript', 'TypeScript'],
      extraSkillsCount: 2,
      posted: '2 days ago',
    },
    {
      id: 'job-2',
      title: 'Accountant',
      company: 'Zemen Bank',
      companyLogo: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=120&q=80',
      companyBadgeColor: 'bg-blue-900',
      location: 'Addis Ababa',
      type: 'Full-time',
      salary: 'ETB 18K – 30K',
      skills: ['Excel', 'Finance', 'Report'],
      posted: '3 days ago',
    },
    {
      id: 'job-3',
      title: 'UI/UX Designer',
      company: 'Marcy Tech',
      companyLogo: 'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?auto=format&fit=crop&w=120&q=80',
      companyBadgeColor: 'bg-purple-600',
      location: 'Remote',
      type: 'Full-time',
      salary: 'ETB 18K – 32K',
      skills: ['Figma', 'UI Design', 'UX Research'],
      posted: '1 day ago',
    },
    {
      id: 'job-4',
      title: 'Intern – Software Dev',
      company: 'A2T',
      companyLogo: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=120&q=80',
      companyBadgeColor: 'bg-emerald-500',
      location: 'Addis Ababa',
      type: 'Internship',
      salary: 'ETB 10K – 15K',
      skills: ['React', 'Node.js', 'Git'],
      posted: '5 days ago',
    },
  ];

  // Specific Top Companies matching the screenshot
  const displayTopCompanies = [
    {
      id: 'comp-1',
      name: 'Safaricom Ethiopia',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
      openPositions: '120 open positions',
      color: 'text-emerald-600',
    },
    {
      id: 'comp-2',
      name: 'Zemen Bank',
      logo: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=120&q=80',
      openPositions: '85 open positions',
      color: 'text-amber-500',
    },
    {
      id: 'comp-3',
      name: 'Heineken Ethiopia',
      logo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      openPositions: '45 open positions',
      color: 'text-emerald-700',
    },
    {
      id: 'comp-4',
      name: 'Ethio Telecom',
      logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=120&q=80',
      openPositions: '100 open positions',
      color: 'text-blue-500',
    },
    {
      id: 'comp-5',
      name: 'Dashen Bank',
      logo: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=120&q=80',
      openPositions: '50 open positions',
      color: 'text-indigo-800',
    },
    {
      id: 'comp-all',
      name: 'View All Companies',
      isViewAll: true,
      openPositions: 'Explore all 8K+ verified companies',
      color: 'text-blue-600',
    },
  ];

  return (
    <div className="space-y-12 pb-16 bg-[#F8FAFC]">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Heading, Subtitle & Search */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>#1 Job Platform in Ethiopia</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                  Find Your Next <br />
                  <span className="text-blue-600">Opportunity</span>
                </h1>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg">
                  Discover jobs, internships and career opportunities across Ethiopia. Your future starts here.
                </p>
              </div>

              {/* Search Bar Container */}
              <form
                onSubmit={handleHeroSearch}
                className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-stretch gap-2"
              >
                <div className="flex-1 flex items-center gap-2.5 px-3 py-2">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Job title, skill or company"
                    className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-none placeholder:text-slate-400 font-medium text-slate-800"
                  />
                </div>

                <div className="hidden sm:block w-px bg-slate-200 self-stretch my-1" />

                <div className="flex items-center gap-2 px-3 py-2 sm:w-56">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-none text-slate-700 font-medium cursor-pointer"
                  >
                    <option value="Addis Ababa, Ethiopia">Addis Ababa, Ethiopia</option>
                    <option value="Bole, Addis Ababa">Bole, Addis Ababa</option>
                    <option value="Kazanchis, Addis Ababa">Kazanchis, Addis Ababa</option>
                    <option value="Hawassa">Hawassa</option>
                    <option value="Dire Dawa">Dire Dawa</option>
                    <option value="Bahir Dar">Bahir Dar</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                <button
                  type="submit"
                  id="hero-search-btn"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl transition-colors shadow-xs shrink-0"
                >
                  Search Jobs
                </button>
              </form>

              {/* Popular Searches */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Popular searches:</span>
                {['Software Developer', 'Accountant', 'Marketing', 'Internship', 'Remote'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearchQuery(term);
                      navigate(`/jobs?q=${encodeURIComponent(term)}`);
                    }}
                    className="px-3 py-1 rounded-full bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 text-xs font-medium border border-slate-200 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>

            </div>

            {/* Right Column: Hero Graphic of Smiling Ethiopian Professionals with Visual Accents */}
            <div className="lg:col-span-5 relative flex justify-center items-center">
              
              {/* Background Blue Curved Arch Shape */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 rounded-full bg-blue-600/90 -z-10 blur-0" />
              
              {/* Decorative Floating Marks */}
              <div className="absolute top-4 left-6 text-blue-500 text-2xl font-light select-none pointer-events-none">+</div>
              <div className="absolute top-12 right-12 text-blue-400 text-xl font-light select-none pointer-events-none">+</div>
              
              {/* Yellow Squiggle */}
              <svg className="absolute top-16 left-12 w-12 h-6 text-amber-400" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round">
                <path d="M 5,15 Q 25,0 45,15 T 85,15" />
              </svg>

              {/* Dot Grid on Right */}
              <div className="absolute bottom-8 right-2 grid grid-cols-5 gap-2 opacity-60">
                {[...Array(15)].map((_, i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/80"></span>
                ))}
              </div>

              {/* Professionals Cutout Portrait */}
              <div className="relative z-10 max-w-sm sm:max-w-md">
                <img
                  src={ETHIOPIAN_HERO_PROFESSIONALS}
                  alt="Ethiopian professionals on HireHub"
                  className="w-full h-auto object-cover rounded-3xl drop-shadow-2xl"
                />
              </div>

            </div>

          </div>

          {/* Floating Stats Bar */}
          <div className="mt-8 bg-white rounded-2xl shadow-xs border border-slate-100 p-4 sm:p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              
              {/* Active Jobs */}
              <div className="flex items-center gap-4 px-2 sm:px-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">12K+</h3>
                  <p className="text-xs text-slate-500 font-medium">Active Jobs</p>
                </div>
              </div>

              {/* Companies */}
              <div className="flex items-center gap-4 px-2 sm:px-4 pt-4 sm:pt-0">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">8K+</h3>
                  <p className="text-xs text-slate-500 font-medium">Companies</p>
                </div>
              </div>

              {/* Job Seekers */}
              <div className="flex items-center gap-4 px-2 sm:px-4 pt-4 sm:pt-0">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">25K+</h3>
                  <p className="text-xs text-slate-500 font-medium">Job Seekers</p>
                </div>
              </div>

              {/* Internships */}
              <div className="flex items-center gap-4 px-2 sm:px-4 pt-4 sm:pt-0">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">3K+</h3>
                  <p className="text-xs text-slate-500 font-medium">Internships</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Main Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Popular Categories */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Popular Categories
            </h2>
            <Link
              to="/jobs"
              className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>View all categories</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {popularCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  to={cat.link || `/jobs?category=${encodeURIComponent(cat.name)}`}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all flex flex-col items-start justify-between min-h-[140px] group"
                >
                  <div className={`w-10 h-10 rounded-xl ${cat.bgColor} ${cat.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-xs text-slate-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {cat.jobs}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured Jobs */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Featured Jobs
            </h2>
            <Link
              to="/jobs"
              className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>View all jobs</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayFeaturedJobs.map((job) => {
                const isBookmarked = !!bookmarkedJobs[job.id];
                return (
                  <div
                    key={job.id}
                    onClick={() => {
                      // Open AI CV modal or view job
                      const found = featuredJobs.find((j) => j.title.toLowerCase().includes(job.title.toLowerCase().split(' ')[0])) || featuredJobs[0];
                      if (found) setSelectedJobForAI(found);
                    }}
                    className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
                  >
                    {/* Header: Company & Bookmark */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
                          <img src={job.companyLogo} alt={job.company} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-semibold text-slate-800">{job.company}</span>
                      </div>
                      <button
                        onClick={(e) => toggleBookmark(job.id, e)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isBookmarked ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                        aria-label="Bookmark"
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-blue-600' : ''}`} />
                      </button>
                    </div>

                    {/* Job Title & Meta */}
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{job.location}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>{job.type}</span>
                        </span>
                      </div>
                    </div>

                    {/* Salary */}
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 font-mono">
                        {job.salary}
                      </span>
                    </div>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.extraSkillsCount && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px] font-medium">
                          +{job.extraSkillsCount}
                        </span>
                      )}
                    </div>

                    {/* Footer Date */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{job.posted}</span>
                      <span className="text-blue-600 font-semibold group-hover:translate-x-0.5 transition-transform text-xs">
                        Details &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Carousel Indicator Arrow Button */}
            <button
              onClick={() => navigate('/jobs')}
              className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md border border-slate-200 items-center justify-center text-slate-600 hover:text-blue-600 hover:scale-105 transition-all z-10"
              aria-label="View more jobs"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Top Companies */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Top Companies
            </h2>
            <Link
              to="/companies"
              className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>View all companies</span>
              <span>&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {displayTopCompanies.map((comp) => {
              if (comp.isViewAll) {
                return (
                  <Link
                    key={comp.id}
                    to="/companies"
                    className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col items-center text-center justify-center min-h-[150px] group space-y-2"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Grid className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {comp.name}
                    </span>
                  </Link>
                );
              }

              return (
                <Link
                  key={comp.id}
                  to="/companies"
                  className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col items-center text-center justify-between min-h-[150px] group space-y-2"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 group-hover:scale-105 transition-transform overflow-hidden">
                    <img src={comp.logo} alt={comp.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {comp.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {comp.openPositions}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* CTA Profile & AI Matching Banner (Exact match to screenshot bottom card) */}
        <section className="bg-[#EEF5FF] rounded-3xl p-6 sm:p-10 border border-blue-100 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Headline & Action */}
            <div className="lg:col-span-4 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Create a profile and let <br />
                <span className="text-blue-600">opportunities</span> find you.
              </h2>
              <Link
                to="/register"
                className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs"
              >
                Get Started
              </Link>
            </div>

            {/* Middle: 3 Feature Steps */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Upload Your CV</h4>
                  <p className="text-[11px] text-slate-500">Get AI-powered job matches.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">AI CV Matching</h4>
                  <p className="text-[11px] text-slate-500">Increase your chances with smart matching.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Apply Easily</h4>
                  <p className="text-[11px] text-slate-500">Apply to jobs with one click.</p>
                </div>
              </div>
            </div>

            {/* Right: Graphic Card Illustration */}
            <div className="lg:col-span-3 flex justify-center lg:justify-end relative">
              <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 w-56 relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                    👤
                  </div>
                  <div className="space-y-1">
                    <div className="w-16 h-2 bg-slate-200 rounded"></div>
                    <div className="w-10 h-1.5 bg-slate-100 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="w-full h-2 bg-slate-100 rounded"></div>
                  <div className="w-4/5 h-2 bg-slate-100 rounded"></div>
                  <div className="w-3/5 h-2 bg-slate-100 rounded"></div>
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-xs">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <Star className="w-3 h-3 fill-amber-400" />
                  <Star className="w-3 h-3 fill-amber-400" />
                  <Star className="w-3 h-3 fill-amber-400" />
                  <Star className="w-3 h-3 fill-amber-400" />
                </div>
              </div>

              {/* Decorative magnifying glass */}
              <div className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 z-20">
                <Search className="w-8 h-8" />
              </div>
            </div>

          </div>
        </section>

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
        onSuccess={() => {
          success('Application submitted successfully!');
        }}
        aiMatch={appliedAiMatch}
      />

    </div>
  );
};
