import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const { success } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      success('Thank you for subscribing to HireHub career updates!');
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#0B1527] text-slate-300 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-12">
          
          {/* Brand Info & Socials */}
          <div className="lg:col-span-3 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 grid grid-cols-2 gap-1 p-1 bg-white rounded-xl shadow-xs">
                <span className="w-full h-full rounded-full bg-emerald-500"></span>
                <span className="w-full h-full rounded-full bg-amber-500"></span>
                <span className="w-full h-full rounded-full bg-blue-600"></span>
                <span className="w-full h-full rounded-full bg-indigo-900"></span>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-white text-xl tracking-tight">HireHub</span>
                <span className="text-[11px] text-slate-400 font-semibold tracking-wide -mt-0.5">Ethiopia</span>
              </div>
            </Link>
            
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Connecting talent with opportunity across Ethiopia.
            </p>

            {/* Social Media Icons */}
            <div className="flex items-center gap-3 pt-2 text-slate-400">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
                aria-label="Facebook"
              >
                f
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-sky-500 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
                aria-label="Twitter"
              >
                𝕏
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-blue-700 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
                aria-label="LinkedIn"
              >
                in
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-pink-600 hover:text-white flex items-center justify-center transition-colors text-xs font-bold"
                aria-label="Instagram"
              >
                📷
              </a>
            </div>

            <p className="text-xs text-slate-400 pt-4">
              © 2025 HireHub Ethiopia. All rights reserved.
            </p>
          </div>

          {/* Navigation Links Columns */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white">For Job Seekers</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/jobs" className="hover:text-white transition-colors">Browse Jobs</Link></li>
              <li><Link to="/student/saved" className="hover:text-white transition-colors">Saved Jobs</Link></li>
              <li><Link to="/student/profile" className="hover:text-white transition-colors">Create Profile</Link></li>
              <li><Link to="/resources" className="hover:text-white transition-colors">Application Tips</Link></li>
              <li><Link to="/resources" className="hover:text-white transition-colors">Career Advice</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white">For Employers</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/employer/jobs/new" className="hover:text-white transition-colors">Post a Job</Link></li>
              <li><Link to="/employer/applicants" className="hover:text-white transition-colors">Browse Candidates</Link></li>
              <li><Link to="/employer/dashboard" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/employer/dashboard" className="hover:text-white transition-colors">Employer Resources</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white">Company</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/learning-guide" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/resources" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/resources" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/resources" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/resources" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Support & Newsletter */}
          <div className="lg:col-span-3 space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Support</h4>
              <ul className="space-y-1.5 text-xs text-slate-400">
                <li><Link to="/resources" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/resources" className="hover:text-white transition-colors">FAQs</Link></li>
                <li><Link to="/resources" className="hover:text-white transition-colors">Community</Link></li>
                <li><Link to="/resources" className="hover:text-white transition-colors">Report an Issue</Link></li>
              </ul>
            </div>

            <div className="pt-2 space-y-2">
              <h4 className="text-sm font-bold text-white">Subscribe to our newsletter</h4>
              <p className="text-xs text-slate-400">Get the latest job opportunities and career tips.</p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Bottom Bar with Ethiopian Flag */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2025 HireHub Ethiopia. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="text-base">🇪🇹</span>
            <span>Made with <span className="text-rose-500">❤️</span> in Ethiopia</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
