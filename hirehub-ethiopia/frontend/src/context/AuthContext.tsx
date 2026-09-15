import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { User, StudentProfile, Company, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | null;
  company: Company | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  demoLogin: (role: 'JOB_SEEKER' | 'EMPLOYER' | 'ADMIN' | 'STUDENT_DESIGNER') => Promise<void>;
  switchDemoRole: (role: 'JOB_SEEKER' | 'EMPLOYER' | 'ADMIN' | 'STUDENT_DESIGNER') => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfileState: (profile: StudentProfile) => void;
  updateCompanyState: (company: Company) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('hirehub_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const storedToken = localStorage.getItem('hirehub_token');
    if (!storedToken) {
      setUser(null);
      setProfile(null);
      setCompany(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      setProfile(res.data.profile || null);
      setCompany(res.data.company || null);
    } catch (err) {
      console.warn('[Auth] Session invalid or expired:', err);
      localStorage.removeItem('hirehub_token');
      setToken(null);
      setUser(null);
      setProfile(null);
      setCompany(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser, profile: receivedProfile, company: receivedCompany } = res.data;
    localStorage.setItem('hirehub_token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    setProfile(receivedProfile || null);
    setCompany(receivedCompany || null);
  };

  const register = async (data: any) => {
    const res = await api.post('/auth/register', data);
    const { token: receivedToken, user: receivedUser, profile: receivedProfile, company: receivedCompany } = res.data;
    localStorage.setItem('hirehub_token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    setProfile(receivedProfile || null);
    setCompany(receivedCompany || null);
  };

  const demoLogin = async (role: 'JOB_SEEKER' | 'EMPLOYER' | 'ADMIN' | 'STUDENT_DESIGNER') => {
    const res = await api.post('/auth/demo-login', { role });
    const { token: receivedToken, user: receivedUser, profile: receivedProfile, company: receivedCompany } = res.data;
    localStorage.setItem('hirehub_token', receivedToken);
    setToken(receivedToken);
    setUser(receivedUser);
    setProfile(receivedProfile || null);
    setCompany(receivedCompany || null);
  };

  const logout = () => {
    localStorage.removeItem('hirehub_token');
    setToken(null);
    setUser(null);
    setProfile(null);
    setCompany(null);
  };

  const updateProfileState = (updatedProfile: StudentProfile) => {
    setProfile(updatedProfile);
  };

  const updateCompanyState = (updatedCompany: Company) => {
    setCompany(updatedCompany);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        company,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        demoLogin,
        switchDemoRole: demoLogin,
        logout,
        refreshUser,
        updateProfileState,
        updateCompanyState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
