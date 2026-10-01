import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole, School } from '../../types';
import { RegisterSchoolModal } from './RegisterSchoolModal';
import {
  Shield,
  ShieldCheck,
  Building2,
  GraduationCap,
  Users,
  BookOpen,
  DollarSign,
  Search,
  Check,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  User,
  UserCheck,
  Sun,
  Moon,
  Monitor,
  Cloud,
  TrendingUp,
  ChevronRight,
  Edit3,
  AlertCircle,
  X,
  RotateCcw,
  Sparkles,
  HelpCircle,
  HeartHandshake,
  KeyRound,
  ArrowRight,
} from 'lucide-react';

interface SchoolPortalLoginProps {
  onSuccess?: () => void;
}

// Heraldic School Crest Icon Component with custom emblems
const SchoolCrest: React.FC<{ school: School; className?: string }> = ({ school, className = 'w-10 h-10' }) => {
  const code = (school.code || '').toUpperCase();

  // Color schemes for known schools
  let crestBg = 'from-indigo-900 to-slate-900 border-indigo-700/60 text-indigo-300';
  let emblemIcon = <GraduationCap className="w-5 h-5 text-indigo-200" />;

  if (code.includes('GH') || school.name.toLowerCase().includes('green hill')) {
    crestBg = 'from-amber-700/80 via-slate-900 to-blue-950 border-amber-500/60 text-amber-300';
    emblemIcon = (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" fill="#1e3a8a" fillOpacity="0.4" stroke="#f59e0b" />
        <path d="M12 7v10M8 12h8" stroke="#fbbf24" strokeWidth="1.75" />
      </svg>
    );
  } else if (code.includes('HIS') || school.name.toLowerCase().includes('horizon')) {
    crestBg = 'from-emerald-800/80 via-slate-900 to-teal-950 border-emerald-500/60 text-emerald-300';
    emblemIcon = (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" stroke="#10b981" />
        <path d="M12 3v18M3 12h18" stroke="#34d399" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="4" fill="#047857" fillOpacity="0.5" stroke="#6ee7b7" />
      </svg>
    );
  } else if (code.includes('BFA') || school.name.toLowerCase().includes('bright')) {
    crestBg = 'from-amber-600/80 via-slate-900 to-orange-950 border-amber-400/60 text-amber-200';
    emblemIcon = (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z" fill="#d97706" fillOpacity="0.4" stroke="#fbbf24" />
      </svg>
    );
  } else if (code.includes('UMS') || school.name.toLowerCase().includes('unity')) {
    crestBg = 'from-cyan-800/80 via-slate-900 to-blue-950 border-cyan-500/60 text-cyan-300';
    emblemIcon = (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L4 6v6c0 5 3.5 9.7 8 11 4.5-1.3 8-6 8-11V6l-8-4z" fill="#0891b2" fillOpacity="0.3" stroke="#22d3ee" />
        <circle cx="12" cy="12" r="3" fill="#0e7490" stroke="#a5f3fc" />
      </svg>
    );
  } else if (code.includes('KPS') || school.name.toLowerCase().includes('knowledge')) {
    crestBg = 'from-rose-900/80 via-slate-900 to-purple-950 border-rose-500/60 text-rose-300';
    emblemIcon = (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="#f43f5e" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" fill="#be123c" fillOpacity="0.3" stroke="#fb7185" />
      </svg>
    );
  }

  return (
    <div
      className={`${className} rounded-xl bg-gradient-to-b ${crestBg} border flex items-center justify-center shadow-sm shrink-0 overflow-hidden relative`}
    >
      {emblemIcon}
    </div>
  );
};

// SVG Campus Architectural Illustration
const CampusIllustration: React.FC = () => {
  return (
    <div className="relative w-full h-44 sm:h-52 my-3 rounded-2xl overflow-hidden bg-gradient-to-b from-purple-100/50 via-slate-50 to-white dark:from-slate-800/40 dark:via-slate-900/60 dark:to-slate-950 border border-slate-200/70 dark:border-slate-800/80 flex items-end justify-center">
      {/* Soft atmospheric gradient sky */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-purple-500/5 to-purple-500/10 pointer-events-none" />

      {/* Sun glow / architectural lighting */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-36 h-36 bg-purple-400/15 dark:bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />

      <svg
        viewBox="0 0 500 220"
        className="w-full max-w-md h-auto text-slate-300 dark:text-slate-700/80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft Background Trees */}
        <circle cx="80" cy="140" r="30" className="fill-emerald-100 dark:fill-emerald-950/40 opacity-70" />
        <circle cx="110" cy="145" r="24" className="fill-emerald-200 dark:fill-emerald-900/30 opacity-60" />
        <circle cx="390" cy="145" r="26" className="fill-emerald-200 dark:fill-emerald-900/30 opacity-60" />
        <circle cx="420" cy="140" r="32" className="fill-emerald-100 dark:fill-emerald-950/40 opacity-70" />

        {/* School Building Base & Wings */}
        <rect x="70" y="100" width="360" height="75" rx="3" className="fill-slate-100 dark:fill-slate-800/90 stroke-slate-300 dark:stroke-slate-700" strokeWidth="1.5" />
        
        {/* Central Portico / Hall */}
        <rect x="175" y="70" width="150" height="105" className="fill-slate-50 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-600" strokeWidth="2" />
        
        {/* Pediment (Triangle Roof) */}
        <polygon points="165,70 250,25 335,70" className="fill-slate-200 dark:fill-slate-700/90 stroke-slate-400 dark:stroke-slate-600" strokeWidth="2" />
        
        {/* Clock Tower / Round Window */}
        <circle cx="250" cy="50" r="10" className="fill-white dark:fill-slate-900 stroke-purple-500 dark:stroke-purple-400" strokeWidth="2" />
        <line x1="250" y1="50" x2="250" y2="44" className="stroke-purple-600 dark:stroke-purple-300" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="250" y1="50" x2="254" y2="50" className="stroke-purple-600 dark:stroke-purple-300" strokeWidth="1.5" strokeLinecap="round" />

        {/* Windows Left Wing */}
        <rect x="90" y="112" width="18" height="24" rx="2" className="fill-blue-100/80 dark:fill-blue-950/60 stroke-slate-400 dark:stroke-slate-600" strokeWidth="1" />
        <rect x="120" y="112" width="18" height="24" rx="2" className="fill-blue-100/80 dark:fill-blue-950/60 stroke-slate-400 dark:stroke-slate-600" strokeWidth="1" />
        <rect x="150" y="112" width="18" height="24" rx="2" className="fill-blue-100/80 dark:fill-blue-950/60 stroke-slate-400 dark:stroke-slate-600" strokeWidth="1" />
        
        {/* Windows Right Wing */}
        <rect x="332" y="112" width="18" height="24" rx="2" className="fill-blue-100/80 dark:fill-blue-950/60 stroke-slate-400 dark:stroke-slate-600" strokeWidth="1" />
        <rect x="362" y="112" width="18" height="24" rx="2" className="fill-blue-100/80 dark:fill-blue-950/60 stroke-slate-400 dark:stroke-slate-600" strokeWidth="1" />
        <rect x="392" y="112" width="18" height="24" rx="2" className="fill-blue-100/80 dark:fill-blue-950/60 stroke-slate-400 dark:stroke-slate-600" strokeWidth="1" />

        {/* Upper Center Windows */}
        <rect x="195" y="82" width="22" height="28" rx="2" className="fill-blue-100 dark:fill-blue-950/70 stroke-slate-400 dark:stroke-slate-600" strokeWidth="1" />
        <rect x="239" y="82" width="22" height="28" rx="2" className="fill-blue-100 dark:fill-blue-950/70 stroke-slate-400 dark:stroke-slate-600" strokeWidth="1" />
        <rect x="283" y="82" width="22" height="28" rx="2" className="fill-blue-100 dark:fill-blue-950/70 stroke-slate-400 dark:stroke-slate-600" strokeWidth="1" />

        {/* Classical Columns */}
        <rect x="192" y="116" width="7" height="54" className="fill-slate-200 dark:fill-slate-600 stroke-slate-300 dark:stroke-slate-500" strokeWidth="1" />
        <rect x="228" y="116" width="7" height="54" className="fill-slate-200 dark:fill-slate-600 stroke-slate-300 dark:stroke-slate-500" strokeWidth="1" />
        <rect x="265" y="116" width="7" height="54" className="fill-slate-200 dark:fill-slate-600 stroke-slate-300 dark:stroke-slate-500" strokeWidth="1" />
        <rect x="301" y="116" width="7" height="54" className="fill-slate-200 dark:fill-slate-600 stroke-slate-300 dark:stroke-slate-500" strokeWidth="1" />

        {/* Central Entrance Double Doors */}
        <path d="M238 135 H262 V175 H238 Z" className="fill-purple-900/20 dark:fill-purple-950/80 stroke-purple-600 dark:stroke-purple-400" strokeWidth="1.5" />
        <line x1="250" y1="135" x2="250" y2="175" className="stroke-purple-600 dark:stroke-purple-400" strokeWidth="1" />

        {/* Neoclassical Steps / Ground Walkway */}
        <polygon points="150,175 350,175 365,183 135,183" className="fill-slate-200 dark:fill-slate-700/80" />
        <polygon points="135,183 365,183 385,193 115,193" className="fill-slate-300 dark:fill-slate-700" />
        <polygon points="115,193 385,193 410,205 90,205" className="fill-slate-300/80 dark:fill-slate-600/80" />

        {/* Paved Courtyard Base Line */}
        <line x1="20" y1="205" x2="480" y2="205" className="stroke-slate-300 dark:stroke-slate-700" strokeWidth="2" />
      </svg>
    </div>
  );
};

export const SchoolPortalLogin: React.FC<SchoolPortalLoginProps> = ({ onSuccess }) => {
  const { schools, activeSchool, loginWithSchoolId } = useAuth();
  const { addToast } = useSchoolData();
  const { theme, setTheme } = useTheme();

  // Active School Selection
  const [selectedSchool, setSelectedSchool] = useState<School>(() => {
    return activeSchool || schools[0] || {
      id: 'school-1',
      name: 'Green Hill School',
      code: 'GH-001',
      logo: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=200',
      address: 'KM4 Airport Road, Mogadishu',
      status: 'Active',
      academicYear: '2025-2026',
    };
  });

  // Step 1: Selected Role (7 School Roles)
  const [selectedRole, setSelectedRole] = useState<UserRole>('Teacher');
  const [isSuperAdminMode, setIsSuperAdminMode] = useState(false);

  // Step 2: Search Query
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');

  // Step 3: Credentials Form State
  const [identifier, setIdentifier] = useState('TCHR-1025');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // States & Modals
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  // Default credentials mapping for the canonical school roles & super admin
  const roleDefaultCredentials: Record<UserRole, { id: string; name: string; title: string }> = {
    OwnerAdmin: { id: 'ADM-2026-0001', name: 'Salmaan Fitah', title: 'School Owner & Director' },
    Principal: { id: 'PRP-2026-0001', name: 'Dr. Eleanor Vance', title: 'Principal Administrator' },
    Teacher: { id: 'TCHR-1025', name: 'Ahmed Hassan Mohamed', title: 'Senior Science & Math Faculty' },
    Student: { id: 'STU-2026-0125', name: 'Fatima Ali', title: 'Class 02 Scholar' },
    AccountAdmin: { id: 'ACC-2026-0001', name: 'David Vance', title: 'School Bursar & Fees' },
    SuperAdmin: { id: 'SUP-2026-0001', name: 'Dr. Arthur Sterling', title: 'Platform Master Director' },
    Admin: { id: 'ADM-2026-0001', name: 'Administrator', title: 'School Administrator' },
  };

  // Synchronize school list when schools change in context
  useEffect(() => {
    if (schools && schools.length > 0) {
      const match = schools.find((s) => s.id === selectedSchool.id) || schools[0];
      setSelectedSchool(match);
    }
  }, [schools]);

  // Handle role selection
  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setIsSuperAdminMode(false);
    setIdentifier(roleDefaultCredentials[role]?.id || '');
    setPassword('password123');
    setErrorMessage(null);
  };

  // Handle school selection
  const handleSelectSchool = (school: School) => {
    setSelectedSchool(school);
    setIsSuperAdminMode(false);
    setErrorMessage(null);
  };

  // Handle Super Admin platform toggle
  const handleToggleSuperAdmin = () => {
    if (!isSuperAdminMode) {
      setIsSuperAdminMode(true);
      setSelectedRole('SuperAdmin');
      setIdentifier('SUP-2026-0001');
      setPassword('password123');
      setErrorMessage(null);
    } else {
      setIsSuperAdminMode(false);
      setSelectedRole('Teacher');
      setIdentifier('TCHR-1025');
      setPassword('password123');
      setErrorMessage(null);
    }
  };

  // Filter schools dynamically based on real database records
  const filteredSchools = useMemo(() => {
    const q = schoolSearchQuery.trim().toLowerCase();
    if (!q) return schools;
    return schools.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        (s.address && s.address.toLowerCase().includes(q))
    );
  }, [schools, schoolSearchQuery]);

  // Handle Form Submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      setErrorMessage('Please enter your User ID or Account ID.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setLoading(true);

    try {
      const res = await loginWithSchoolId(
        identifier.trim(),
        password,
        selectedRole,
        rememberMe,
        isSuperAdminMode ? undefined : selectedSchool.id
      );

      setLoading(false);

      if (res.success) {
        addToast(
          `Welcome! Signed in as ${selectedRole} for ${isSuperAdminMode ? 'Platform Portal' : selectedSchool.name}.`,
          'success'
        );
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(res.error || 'Authentication rejected. Please check your credentials.');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err?.message || 'Server connection error. Please try again.');
    }
  };

  // Forgot password request handler
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) return;

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: forgotIdentifier.trim(), userType: selectedRole }),
      });
      const data = await res.json();
      setForgotSuccess(data.message || 'Password reset security token issued. Demo token: RST-2026-X');
    } catch {
      setForgotSuccess('A recovery security token has been dispatched to the account on record.');
    }
  };

  // Compact 7 School Roles list
  const schoolRoles: {
    role: UserRole;
    name: string;
    description: string;
    icon: React.ReactNode;
    colorClass: string;
    bgClass: string;
  }[] = [
    {
      role: 'OwnerAdmin',
      name: 'Owner Admin',
      description: 'School Director & Board',
      icon: <Building2 className="w-5 h-5" />,
      colorClass: 'text-blue-600 dark:text-blue-400',
      bgClass: 'bg-blue-50 dark:bg-blue-950/50',
    },
    {
      role: 'Principal',
      name: 'Principal Admin',
      description: 'Academic Operations',
      icon: <UserCheck className="w-5 h-5" />,
      colorClass: 'text-purple-600 dark:text-purple-400',
      bgClass: 'bg-purple-50 dark:bg-purple-950/50',
    },
    {
      role: 'Teacher',
      name: 'Teacher',
      description: 'Classrooms & Grading',
      icon: <Users className="w-5 h-5" />,
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/50',
    },
    {
      role: 'Student',
      name: 'Student',
      description: 'Courses & Homework',
      icon: <GraduationCap className="w-5 h-5" />,
      colorClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50 dark:bg-amber-950/50',
    },
    {
      role: 'AccountAdmin',
      name: 'Accountant',
      description: 'Bursar & Fee Invoicing',
      icon: <DollarSign className="w-5 h-5" />,
      colorClass: 'text-teal-600 dark:text-teal-400',
      bgClass: 'bg-teal-50 dark:bg-teal-950/50',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100/60 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between selection:bg-purple-500 selection:text-white relative overflow-x-hidden">
      {/* Ambient background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-indigo-500/5 dark:bg-indigo-950/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Single-Page Two-Column Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT BRANDING PANEL */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full pt-2">
            <div>
              {/* Brand Top Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-900/20">
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" fill="currentColor" fillOpacity="0.2" />
                      <path d="M12 7v10M8 12h8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                      EduSphere
                    </h1>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      School Management System
                    </p>
                  </div>
                </div>

                {/* Discreet Super Admin / Platform Admin Toggle */}
                <button
                  type="button"
                  onClick={handleToggleSuperAdmin}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isSuperAdminMode
                      ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700'
                  }`}
                  title="Platform Super Administrator Gateway"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>{isSuperAdminMode ? 'Platform Admin Mode' : 'Platform Admin'}</span>
                </button>
              </div>

              {/* Main Typography Treatment */}
              <div className="space-y-1 mt-4">
                <p className="font-script text-3xl sm:text-4xl text-indigo-600 dark:text-indigo-400 font-bold tracking-wide">
                  Welcome to
                </p>
                <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-950 dark:text-white">
                  EduSphere
                </h2>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium pt-1">
                  Your school. Your community. <br />
                  <span className="text-slate-800 dark:text-slate-200 font-semibold">One connected platform.</span>
                </p>
              </div>

              {/* Subtle Campus Architectural Illustration */}
              <CampusIllustration />

              {/* 4 Feature Highlights */}
              <div className="space-y-3 mt-4">
                {/* Feature 1: Secure & Reliable */}
                <div className="flex items-center gap-3.5 p-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Secure & Reliable</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Enterprise-grade security to protect your data.</p>
                  </div>
                </div>

                {/* Feature 2: Role-Based Access */}
                <div className="flex items-center gap-3.5 p-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Role-Based Access</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Every user gets the right access they need.</p>
                  </div>
                </div>

                {/* Feature 3: Smart & Insightful */}
                <div className="flex items-center gap-3.5 p-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Smart & Insightful</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Real-time insights to help your school grow.</p>
                  </div>
                </div>

                {/* Feature 4: Always Accessible */}
                <div className="flex items-center gap-3.5 p-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Always Accessible</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Access anytime, anywhere on any device.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Left Bottom Bar: Theme switcher & Copyright */}
            <div className="mt-8 pt-4 border-t border-slate-200/70 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Theme Segmented Control: [ Light | Dark | Auto ] */}
              <div className="inline-flex p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    theme === 'system'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Auto</span>
                </button>
              </div>

              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                © 2026 EduSphere. All rights reserved.
              </p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT AUTHENTICATION PANEL */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xl relative">
              
              {/* Form container */}
              <form onSubmit={handleLoginSubmit} className="space-y-7">
                
                {/* ------------------------------------------------------------- */}
                {/* STEP 1 — SELECT YOUR ROLE */}
                {/* ------------------------------------------------------------- */}
                <div id="step-role-section" className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-sm flex items-center justify-center border border-purple-300 dark:border-purple-700">
                      1
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Select Your Role
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Choose the role that best describes you
                      </p>
                    </div>
                  </div>

                  {/* Super Admin Notice if active */}
                  {isSuperAdminMode ? (
                    <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-purple-900 dark:text-purple-200">
                            Platform Super Administrator Gateway
                          </p>
                          <p className="text-[11px] text-purple-700 dark:text-purple-400">
                            Platform-wide access across all tenant schools without restriction.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleSuperAdmin}
                        className="text-xs font-semibold text-purple-600 dark:text-purple-300 hover:underline cursor-pointer"
                      >
                        Return to School Portal
                      </button>
                    </div>
                  ) : (
                    /* 7 Role Cards: 4 on top row, 3 on bottom row */
                    <div className="space-y-2.5">
                      {/* Top Row: 4 Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {schoolRoles.slice(0, 4).map((r) => {
                          const isSelected = selectedRole === r.role;
                          return (
                            <button
                              key={r.role}
                              type="button"
                              onClick={() => handleSelectRole(r.role)}
                              className={`relative p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group ${
                                isSelected
                                  ? 'border-purple-600 dark:border-purple-500 bg-purple-50/70 dark:bg-purple-950/30 ring-2 ring-purple-500/20 shadow-xs'
                                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                              }`}
                            >
                              {/* Selected Checkmark Badge */}
                              {isSelected && (
                                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </div>
                              )}
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${r.bgClass} ${r.colorClass}`}
                              >
                                {r.icon}
                              </div>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                                {r.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Bottom Row: 3 Cards */}
                      <div className="grid grid-cols-3 gap-2.5">
                        {schoolRoles.slice(4, 7).map((r) => {
                          const isSelected = selectedRole === r.role;
                          return (
                            <button
                              key={r.role}
                              type="button"
                              onClick={() => handleSelectRole(r.role)}
                              className={`relative p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group ${
                                isSelected
                                  ? 'border-purple-600 dark:border-purple-500 bg-purple-50/70 dark:bg-purple-950/30 ring-2 ring-purple-500/20 shadow-xs'
                                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                              }`}
                            >
                              {/* Selected Checkmark Badge */}
                              {isSelected && (
                                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                </div>
                              )}
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${r.bgClass} ${r.colorClass}`}
                              >
                                {r.icon}
                              </div>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                                {r.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* ------------------------------------------------------------- */}
                {/* STEP 2 — SEARCH YOUR SCHOOL (Hidden in Super Admin mode) */}
                {/* ------------------------------------------------------------- */}
                {!isSuperAdminMode && (
                  <div id="step-school-section" className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/70">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-sm flex items-center justify-center border border-purple-300 dark:border-purple-700">
                          2
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">
                            Search Your School
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Find and select your school to continue
                          </p>
                        </div>
                      </div>

                      {/* Register school tenant trigger */}
                      <button
                        type="button"
                        onClick={() => setIsRegisterModalOpen(true)}
                        className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 cursor-pointer"
                      >
                        + Register School
                      </button>
                    </div>

                    {/* Search Field */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={schoolSearchQuery}
                        onChange={(e) => setSchoolSearchQuery(e.target.value)}
                        placeholder="Search school name or school code..."
                        className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                      {schoolSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setSchoolSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Matching School Cards List */}
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                      {filteredSchools.length > 0 ? (
                        filteredSchools.map((school) => {
                          const isSelected = selectedSchool.id === school.id;
                          return (
                            <div
                              key={school.id}
                              onClick={() => handleSelectSchool(school)}
                              className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-purple-600 dark:border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 ring-2 ring-purple-500/20'
                                  : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-purple-300 dark:hover:border-purple-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <SchoolCrest school={school} className="w-10 h-10" />
                                <div className="min-w-0">
                                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                    {school.name}
                                  </h4>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                    Code: <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{school.code}</span> •{' '}
                                    {school.address
                                      ? school.address.split(',')[1]?.trim() || school.address.split(',')[0]?.trim() || 'Campus'
                                      : 'Mogadishu'}
                                  </p>
                                </div>
                              </div>

                              <div className="shrink-0 flex items-center">
                                {isSelected ? (
                                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </div>
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500" />
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center">
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            No schools found matching &ldquo;{schoolSearchQuery}&rdquo;.
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsRegisterModalOpen(true)}
                            className="mt-2 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                          >
                            Register this school now
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* STEP 3 — ENTER YOUR CREDENTIALS */}
                {/* ------------------------------------------------------------- */}
                <div id="step-credentials-section" className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/70">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-sm flex items-center justify-center border border-purple-300 dark:border-purple-700">
                      3
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Enter Your Credentials
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Use your ID and password to access your account
                      </p>
                    </div>
                  </div>

                  {/* Compact Selected Context Summary Bar */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {!isSuperAdminMode ? (
                        <SchoolCrest school={selectedSchool} className="w-8 h-8 rounded-lg" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {isSuperAdminMode ? 'Platform Super Administration' : selectedSchool.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Role: <span className="font-semibold text-purple-600 dark:text-purple-400">{selectedRole}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const target = document.getElementById('step-role-section');
                        if (target) target.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-2.5 py-1 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                  </div>

                  {/* Error Alert Message */}
                  {errorMessage && (
                    <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold">Authentication Error</p>
                        <p className="mt-0.5">{errorMessage}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setErrorMessage(null)}
                        className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* User ID / Account ID Input Field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      User ID / Account ID
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="e.g. TCHR-1025 or ADM-2026-0001"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Input Field */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember me & Forgot Password */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 dark:border-slate-700 rounded-sm cursor-pointer accent-purple-600"
                      />
                      <span>Remember me</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setForgotIdentifier(identifier);
                        setIsForgotModalOpen(true);
                      }}
                      className="font-semibold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  {/* Primary Sign In Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-purple-900/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Verifying Security Access...</span>
                      </div>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Sign In</span>
                      </>
                    )}
                  </button>

                  {/* Quick Test Demo Credentials Drawer Toggle */}
                  <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Default test password: <code className="font-mono text-purple-600 dark:text-purple-400">password123</code></span>
                    <button
                      type="button"
                      onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                      className="text-purple-600 dark:text-purple-400 hover:underline cursor-pointer flex items-center gap-1 font-semibold"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{showDemoAccounts ? 'Hide Quick Fill' : 'Quick Demo Accounts'}</span>
                    </button>
                  </div>

                  {/* Demo Accounts Pill Grid */}
                  {showDemoAccounts && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-2">
                      <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Click any role to load test credentials:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {schoolRoles.map((r) => (
                          <button
                            key={r.role}
                            type="button"
                            onClick={() => {
                              handleSelectRole(r.role);
                              setPassword('password123');
                              addToast(`Loaded ${r.name} ID (${roleDefaultCredentials[r.role].id})`, 'info');
                            }}
                            className="px-2 py-1.5 rounded-xl text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 text-left truncate cursor-pointer"
                          >
                            {r.name}: <span className="font-mono">{roleDefaultCredentials[r.role].id}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Bottom Security Assurance Footer */}
            <div className="mt-4 text-center flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Your data is protected with enterprise-grade security.</span>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* FORGOT PASSWORD MODAL */}
      {/* ========================================================================= */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Account Recovery</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Reset your school portal access</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsForgotModalOpen(false);
                  setForgotSuccess(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs space-y-2">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Recovery Instructions Dispatched
                </p>
                <p>{forgotSuccess}</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotModalOpen(false);
                    setForgotSuccess(null);
                  }}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Enter your registered School User ID (e.g. <code className="font-mono text-purple-600 dark:text-purple-400">TCHR-1025</code>) or school email to receive a password reset token.
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    User ID or Email
                  </label>
                  <input
                    type="text"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    required
                    placeholder="e.g. TCHR-1025 or email@school.edu"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm cursor-pointer"
                  >
                    Send Token
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REGISTER NEW SCHOOL TENANT MODAL */}
      {/* ========================================================================= */}
      <RegisterSchoolModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={() => {
          setIsRegisterModalOpen(false);
          if (onSuccess) onSuccess();
        }}
      />
    </div>
  );
};
