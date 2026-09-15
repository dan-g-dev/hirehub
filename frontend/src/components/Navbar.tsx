import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { NotificationItem } from '../types';
import {
  Briefcase,
  GraduationCap,
  Building2,
  Bell,
  Search,
  PlusCircle,
  Menu,
  X,
  User,
  LogOut,
  Bookmark,
  FileText,
  ShieldCheck,
  ChevronDown,
  Layers,
  MessageSquare,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, demoLogin } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [announcementDismissed, setAnnouncementDismissed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(3);
  const [navSearchQuery, setNavSearchQuery] = useState('');

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
    setUserDropdownOpen(false);
    setSearchModalOpen(false);
  }, [location.pathname]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount !== undefined ? res.data.unreadCount : 3);
    } catch {
      // fallback silent
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // silent
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      success('All notifications marked as read.');
    } catch {
      // silent
    }
  };

  const handleNavSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearchQuery.trim()) {
      navigate(`/jobs?q=${encodeURIComponent(navSearchQuery.trim())}`);
      setNavSearchQuery('');
      setSearchModalOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    success('Logged out successfully.');
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-xs">
      {/* Top Announcement Bar from Design */}
      {!announcementDismissed && (
        <div className="bg-[#0B1527] text-white text-xs py-2 px-4 border-b border-slate-800 transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center justify-center flex-1 gap-2 text-center text-slate-200">
              <span className="text-amber-400">🎉</span>
              <span className="font-medium">
                New: 2025 Ethiopia Tech Salary Guide is now available!
              </span>
              <Link
                to="/resources"
                className="font-bold text-white hover:text-blue-400 inline-flex items-center gap-1 underline underline-offset-2 ml-1"
              >
                <span>Download Free</span>
                <span>&rarr;</span>
              </Link>
            </div>
            <button
              onClick={() => setAnnouncementDismissed(true)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Dismiss announcement"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <nav className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Logo & Brand (4-circle icon mark from image) */}
            <div className="flex items-center gap-8">
              <Link to="/" id="nav-brand-logo" className="flex items-center gap-3 group">
                <div className="w-10 h-10 grid grid-cols-2 gap-1 p-1 bg-white rounded-xl shadow-xs border border-slate-100 group-hover:scale-105 transition-transform">
                  <span className="w-full h-full rounded-full bg-emerald-500"></span>
                  <span className="w-full h-full rounded-full bg-amber-500"></span>
                  <span className="w-full h-full rounded-full bg-blue-600"></span>
                  <span className="w-full h-full rounded-full bg-indigo-900"></span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-slate-900 text-xl tracking-tight">HireHub</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold tracking-wide -mt-0.5">Ethiopia</span>
                </div>
              </Link>

              {/* Desktop Navigation Links */}
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  to="/jobs"
                  id="nav-link-jobs"
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive('/jobs')
                      ? 'text-blue-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Jobs
                </Link>
                <Link
                  to="/companies"
                  id="nav-link-companies"
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive('/companies')
                      ? 'text-blue-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Companies
                </Link>
                <Link
                  to="/internships"
                  id="nav-link-internships"
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive('/internships')
                      ? 'text-blue-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Internships
                </Link>
                <Link
                  to="/resources"
                  id="nav-link-resources"
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive('/resources')
                      ? 'text-blue-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Career Resources
                </Link>
                <Link
                  to="/employer/dashboard"
                  id="nav-link-employers"
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive('/employer')
                      ? 'text-blue-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  For Employers
                </Link>
                <Link
                  to="/components"
                  id="nav-link-ui-components"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    isActive('/components')
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-purple-600 hover:bg-purple-50'
                  }`}
                  title="Interactive HireHub UI Components Showcase"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>UI System</span>
                </Link>
              </div>
            </div>

            {/* Right Action Icons & Auth Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Quick Search Icon Trigger */}
              <button
                onClick={() => setSearchModalOpen(!searchModalOpen)}
                className="p-2.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Search"
                title="Search vacancies"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Chat / Message Icon */}
              <Link
                to="/resources"
                className="p-2.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors hidden sm:flex"
                aria-label="Messages & Career Support"
                title="Messages & Career Support"
              >
                <MessageSquare className="w-5 h-5" />
              </Link>

              {/* Notifications Bell with Badge '3' */}
              <div className="relative" ref={notifRef}>
                <button
                  id="nav-notifications-btn"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                  aria-label="View notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold shadow-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500 text-white">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-xs text-slate-300 hover:text-white underline font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">
                          No notifications at the moment.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.notification_id}
                            onClick={() => {
                              handleMarkAsRead(n.notification_id);
                              if (n.link_url) navigate(n.link_url);
                            }}
                            className={`p-3.5 text-xs cursor-pointer transition-colors ${
                              n.is_read ? 'bg-white hover:bg-slate-50 text-slate-600' : 'bg-blue-50/70 hover:bg-blue-50 text-slate-900 font-medium'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-slate-900">{n.title}</span>
                              {!n.is_read && (
                                <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0 mt-1"></span>
                              )}
                            </div>
                            <p className="mt-1 text-slate-600 line-clamp-2">{n.message}</p>
                            <span className="mt-1.5 inline-block text-[10px] text-slate-400">
                              {new Date(n.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                      <Link
                        to={user?.role === 'JOB_SEEKER' ? '/student/applications' : '/employer/dashboard'}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                      >
                        View Full Pipeline &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* User Logged In State vs Public Login / Sign Up */}
              {isAuthenticated ? (
                <div className="relative" ref={userRef}>
                  <button
                    id="nav-user-dropdown-btn"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 pr-3 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                  >
                    <img
                      src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={user?.full_name}
                      className="w-7 h-7 rounded-full object-cover border border-slate-200"
                    />
                    <span className="hidden md:inline text-xs font-bold text-slate-800 max-w-[120px] truncate">
                      {user?.full_name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="font-bold text-slate-900 truncate">{user?.full_name}</p>
                        <p className="text-slate-500 truncate text-[11px]">{user?.email}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 uppercase">
                          {user?.role?.replace('_', ' ')}
                        </span>
                      </div>

                      {user?.role === 'JOB_SEEKER' && (
                        <>
                          <Link
                            to="/student/dashboard"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium"
                          >
                            <GraduationCap className="w-4 h-4 text-slate-500" />
                            <span>Job Seeker Dashboard</span>
                          </Link>
                          <Link
                            to="/student/profile"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium"
                          >
                            <User className="w-4 h-4 text-slate-500" />
                            <span>My CV & Profile</span>
                          </Link>
                          <Link
                            to="/student/applications"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium"
                          >
                            <FileText className="w-4 h-4 text-slate-500" />
                            <span>My Applications</span>
                          </Link>
                          <Link
                            to="/student/saved"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium"
                          >
                            <Bookmark className="w-4 h-4 text-slate-500" />
                            <span>Saved Jobs</span>
                          </Link>
                        </>
                      )}

                      {user?.role === 'EMPLOYER' && (
                        <>
                          <Link
                            to="/employer/dashboard"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium"
                          >
                            <Briefcase className="w-4 h-4 text-slate-500" />
                            <span>Employer Dashboard</span>
                          </Link>
                          <Link
                            to="/employer/applicants"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium"
                          >
                            <User className="w-4 h-4 text-slate-500" />
                            <span>ATS Pipeline</span>
                          </Link>
                          <Link
                            to="/employer/jobs/new"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium"
                          >
                            <PlusCircle className="w-4 h-4 text-slate-500" />
                            <span>Post a Vacancy</span>
                          </Link>
                          <Link
                            to="/employer/company"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium"
                          >
                            <Building2 className="w-4 h-4 text-slate-500" />
                            <span>Company Profile</span>
                          </Link>
                        </>
                      )}

                      {user?.role === 'ADMIN' && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-slate-700 hover:bg-blue-50 hover:text-blue-700 font-medium"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          <span>Admin Portal</span>
                        </Link>
                      )}

                      <div className="border-t border-slate-100 my-1 pt-1.5 px-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                          Switch Demo Persona
                        </span>
                        <div className="grid grid-cols-2 gap-1 text-[11px]">
                          <button
                            type="button"
                            onClick={async () => {
                              await demoLogin('JOB_SEEKER');
                              success('Switched to Student (Yohannes)');
                              setUserDropdownOpen(false);
                            }}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-left font-medium truncate"
                          >
                            🎓 Student
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await demoLogin('STUDENT_DESIGNER');
                              success('Switched to UI/UX (Bethlehem)');
                              setUserDropdownOpen(false);
                            }}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-left font-medium truncate"
                          >
                            👤 Designer
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await demoLogin('EMPLOYER');
                              success('Switched to Employer HR');
                              setUserDropdownOpen(false);
                            }}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-left font-medium truncate"
                          >
                            💼 Employer
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await demoLogin('ADMIN');
                              success('Switched to Admin (Solomon)');
                              setUserDropdownOpen(false);
                            }}
                            className="p-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-700 text-left font-medium truncate"
                          >
                            🛡️ Admin
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50 font-medium text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    id="nav-login-btn"
                    className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-slate-900 border border-slate-300 hover:border-slate-400 rounded-xl transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    id="nav-signup-btn"
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                id="mobile-menu-toggle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

            </div>
          </div>
        </div>

        {/* Quick Search Modal / Overlay */}
        {searchModalOpen && (
          <div className="border-t border-slate-100 bg-slate-50 p-4 animate-in slide-in-from-top-1 duration-150">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleNavSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search by job title, skill (e.g. React, Python), or company in Ethiopia..."
                    value={navSearchQuery}
                    onChange={(e) => setNavSearchQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-4 pb-6 space-y-3 shadow-lg">
            <div className="flex flex-col space-y-1">
              <Link
                to="/jobs"
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive('/jobs') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Jobs
              </Link>
              <Link
                to="/companies"
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive('/companies') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Companies
              </Link>
              <Link
                to="/internships"
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive('/internships') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Internships
              </Link>
              <Link
                to="/resources"
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive('/resources') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                Career Resources
              </Link>
              <Link
                to="/employer/dashboard"
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive('/employer') ? 'bg-blue-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                For Employers
              </Link>
              <Link
                to="/components"
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold text-purple-600 ${
                  isActive('/components') ? 'bg-purple-50' : 'hover:bg-purple-50'
                }`}
              >
                UI Components Explorer
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
