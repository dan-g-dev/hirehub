import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { RoleBanner } from './components/RoleBanner';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { JobsPage } from './pages/JobsPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { InternshipsPage } from './pages/InternshipsPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { CompanyDetailPage } from './pages/CompanyDetailPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { StudentApplicationsPage } from './pages/StudentApplicationsPage';
import { StudentSavedJobsPage } from './pages/StudentSavedJobsPage';
import { EmployerDashboardPage } from './pages/EmployerDashboardPage';
import { EmployerApplicantsPage } from './pages/EmployerApplicantsPage';
import { EmployerPostJobPage } from './pages/EmployerPostJobPage';
import { EmployerCompanyPage } from './pages/EmployerCompanyPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { LearningGuidePage } from './pages/LearningGuidePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
            <RoleBanner />
            <Navbar />
            
            <main className="flex-1">
              <Routes>
                {/* Public Browsing */}
                <Route path="/" element={<HomePage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/jobs/:id" element={<JobDetailPage />} />
                <Route path="/internships" element={<InternshipsPage />} />
                <Route path="/companies" element={<CompaniesPage />} />
                <Route path="/companies/:id" element={<CompanyDetailPage />} />
                <Route path="/resources" element={<ResourcesPage />} />
                <Route path="/docs" element={<LearningGuidePage />} />
                
                {/* Authentication */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                
                {/* Job Seeker / Candidate Suite */}
                <Route path="/student/dashboard" element={<StudentDashboardPage />} />
                <Route path="/student/profile" element={<StudentProfilePage />} />
                <Route path="/student/applications" element={<StudentApplicationsPage />} />
                <Route path="/student/saved" element={<StudentSavedJobsPage />} />
                
                {/* Employer Recruiter Suite */}
                <Route path="/employer/dashboard" element={<EmployerDashboardPage />} />
                <Route path="/employer/applicants" element={<EmployerApplicantsPage />} />
                <Route path="/employer/jobs/new" element={<EmployerPostJobPage />} />
                <Route path="/employer/company" element={<EmployerCompanyPage />} />
                
                {/* Admin Platform Oversight */}
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
