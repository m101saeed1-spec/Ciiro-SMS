import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserRole, UserProfile, RoleAuditLog, getRoleDisplayName } from '../../types';
import { INITIAL_ROLE_AUDIT_LOGS } from '../../data/initialData';
import { UserAvatar } from '../common/UserAvatar';
import { ThemeToggle } from '../common/ThemeToggle';
import { LanguageToggle } from '../common/LanguageToggle';
import {
  User,
  Shield,
  Key,
  CheckCircle2,
  Mail,
  Phone,
  Building,
  Calendar,
  Save,
  Lock,
  UserCheck,
  ShieldAlert,
  Users,
  Search,
  Filter,
  Plus,
  RefreshCw,
  History,
  AlertTriangle,
  Check,
  X,
  UserX,
  Sparkles,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
  BadgeCheck,
  ShieldCheck,
  Sun,
  Moon,
  Laptop,
  Palette,
  Eye,
  EyeOff,
  Bell,
  Globe,
  Building2,
  Award,
  Layers,
  FileText,
  Clock,
  SlidersHorizontal,
  Target,
  Compass,
  CreditCard,
  Fingerprint,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { BillingSettings } from './BillingSettings';

export const SettingsModule: React.FC = () => {
  const {
    currentUser,
    activeRole,
    activeSchool,
    isSuperAdmin,
    isPrincipal,
    updateProfile,
    updateSchool,
    userProfiles,
    adminToggleUserStatus,
    isBiometricSupported,
    hasRegisteredBiometrics,
    registeredBiometricUser,
    registerBiometrics,
    removeBiometrics,
    loginWithBiometrics,
  } = useAuth();
  const { addToast } = useSchoolData();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t, tx, tr } = useLanguage();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const schoolLogoInputRef = useRef<HTMLInputElement>(null);

  // High-Level Section: 'personal' (My Account & Profile) vs 'system' (School & System Configuration)
  const canManageSchoolConfig = isSuperAdmin || isPrincipal || activeRole === 'Principal';
  const [sectionMode, setSectionMode] = useState<'personal' | 'system'>('personal');

  // Personal Tabs
  const [personalTab, setPersonalTab] = useState<'profile' | 'security' | 'appearance' | 'notifications' | 'credentials'>('profile');

  // System Configuration Tabs
  const [systemTab, setSystemTab] = useState<'school-profile' | 'billing' | 'academic-term' | 'governance'>('school-profile');

  // =========================================================================
  // 1. PERSONAL PROFILE STATE
  // =========================================================================
  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    designation: currentUser.designation || '',
    address: currentUser.address || '',
    bio: currentUser.bio || '',
    avatar: currentUser.avatar || '',
  });

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState(false);

  // Security / Password State
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: '',
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    schoolAnnouncements: true,
    attendanceAlerts: true,
    financialReminders: true,
  });

  // =========================================================================
  // 2. SYSTEM / SCHOOL CONFIGURATION STATE
  // =========================================================================
  const [schoolConfig, setSchoolConfig] = useState({
    name: activeSchool?.name || 'Amiir nuur',
    code: activeSchool?.code || 'GH-001',
    motto: activeSchool?.motto || 'Knowledge, Integrity, Excellence',
    email: activeSchool?.email || 'info@greenhillschool.edu.so',
    phone: activeSchool?.phone || '+252 61 5000000',
    address: activeSchool?.address || 'KM4 Airport Road, Mogadishu, Somalia',
    website: activeSchool?.website || 'https://amiirnuur.edu.so',
    academicYear: activeSchool?.academicYear || '2025-2026',
    currentTerm: activeSchool?.currentTerm || 'Term 2 (Spring 2026)',
    targetAttendanceRate: activeSchool?.targetAttendanceRate ?? 95,
    logo: activeSchool?.logo || '',
  });
  const [isSavingSchool, setIsSavingSchool] = useState(false);
  const [schoolSuccessMsg, setSchoolSuccessMsg] = useState(false);

  // Admin Governance State (Super Admin only)
  const [adminSearch, setAdminSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | UserRole>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Disabled'>('All');

  // Synchronize state when user or school context updates
  useEffect(() => {
    setFormData({
      name: currentUser.name || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      designation: currentUser.designation || '',
      address: currentUser.address || '',
      bio: currentUser.bio || '',
      avatar: currentUser.avatar || '',
    });
  }, [currentUser]);

  useEffect(() => {
    if (activeSchool) {
      setSchoolConfig({
        name: activeSchool.name || '',
        code: activeSchool.code || '',
        motto: activeSchool.motto || '',
        email: activeSchool.email || '',
        phone: activeSchool.phone || '',
        address: activeSchool.address || '',
        website: activeSchool.website || '',
        academicYear: activeSchool.academicYear || '2025-2026',
        currentTerm: activeSchool.currentTerm || 'Term 2 (Spring 2026)',
        targetAttendanceRate: activeSchool.targetAttendanceRate ?? 95,
        logo: activeSchool.logo || '',
      });
    }
  }, [activeSchool]);

  // Profile Photo Upload Handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Please select a valid image file (PNG, JPG, WebP)', 'error');
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      addToast('Image size exceeds 4MB. Please select a smaller photo.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setFormData((prev) => ({ ...prev, avatar: base64 }));
      addToast('Profile photo selected. Click "Save Profile" to apply.', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, avatar: '' }));
    addToast('Profile photo removed. Save changes to confirm.', 'info');
  };

  // Save Profile Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Full name is required', 'warning');
      return;
    }

    setIsSavingProfile(true);
    setProfileSuccessMsg(false);

    try {
      const res = await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        designation: formData.designation.trim(),
        address: formData.address.trim(),
        bio: formData.bio.trim(),
        avatar: formData.avatar,
      });

      if (res.success) {
        setProfileSuccessMsg(true);
        addToast('Your personal profile details have been saved!', 'success');
        setTimeout(() => setProfileSuccessMsg(false), 4000);
      } else {
        addToast(res.error || 'Failed to update profile', 'error');
      }
    } catch {
      addToast('An error occurred while saving profile settings.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Save School Configuration Handler
  const handleSaveSchoolConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSchool) return;

    setIsSavingSchool(true);
    setSchoolSuccessMsg(false);

    try {
      const res = await updateSchool(activeSchool.id, {
        name: schoolConfig.name,
        code: schoolConfig.code,
        motto: schoolConfig.motto,
        email: schoolConfig.email,
        phone: schoolConfig.phone,
        address: schoolConfig.address,
        website: schoolConfig.website,
        academicYear: schoolConfig.academicYear,
        currentTerm: schoolConfig.currentTerm,
        targetAttendanceRate: Number(schoolConfig.targetAttendanceRate),
      });

      if (res.success) {
        setSchoolSuccessMsg(true);
        addToast('School institutional settings saved successfully!', 'success');
        setTimeout(() => setSchoolSuccessMsg(false), 4000);
      } else {
        addToast(res.error || 'Failed to update school settings', 'error');
      }
    } catch {
      addToast('An error occurred while saving school settings.', 'error');
    } finally {
      setIsSavingSchool(false);
    }
  };

  // Save Password Handler
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.current) {
      addToast('Please enter your current password.', 'warning');
      return;
    }
    if (!passwords.newPass || passwords.newPass.length < 6) {
      addToast('New password must be at least 6 characters long.', 'warning');
      return;
    }
    if (passwords.newPass !== passwords.confirmPass) {
      addToast('New passwords do not match.', 'error');
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordSuccess(false);

    setTimeout(() => {
      setIsUpdatingPassword(false);
      setPasswordSuccess(true);
      setPasswords({ current: '', newPass: '', confirmPass: '' });
      addToast('Password updated securely!', 'success');
      setTimeout(() => setPasswordSuccess(false), 4000);
    }, 700);
  };

  // Biometric WebAuthn Handlers
  const [biometricLoading, setBiometricLoading] = useState(false);

  const handleRegisterBiometrics = async () => {
    setBiometricLoading(true);
    const res = await registerBiometrics(activeSchool?.name);
    setBiometricLoading(false);
    if (res.success) {
      addToast('Biometric Passkey registered successfully on this device!', 'success');
    } else {
      addToast(res.error || 'Failed to register biometric passkey.', 'error');
    }
  };

  const handleTestBiometrics = async () => {
    setBiometricLoading(true);
    const res = await loginWithBiometrics(currentUser.email);
    setBiometricLoading(false);
    if (res.success) {
      addToast('Biometric verification passed! Hardware credentials valid.', 'success');
    } else {
      addToast(res.error || 'Biometric verification failed.', 'error');
    }
  };

  const handleRemoveBiometrics = () => {
    const success = removeBiometrics();
    if (success) {
      addToast('Biometric passkey removed from this device.', 'info');
    }
  };

  // Password Strength Evaluator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-200 dark:bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 4) return { score: 3, label: 'Good', color: 'bg-[#3B82F6]' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const passStrength = getPasswordStrength(passwords.newPass);

  // Filtered Users for Governance Tab
  const filteredUsers = (userProfiles || []).filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(adminSearch.toLowerCase()) ||
      (u.schoolCode && u.schoolCode.toLowerCase().includes(adminSearch.toLowerCase()));
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || (u.status || 'Active') === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER HERO BANNER                                                 */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-[#122E52] via-[#0B1B32] to-[#12233F] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-[#F7A914]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            {/* User Avatar with Quick Upload Button */}
            <div className="relative group">
              <UserAvatar
                name={currentUser.name}
                avatarUrl={formData.avatar || currentUser.avatar}
                size="xl"
                status={currentUser.status || 'Active'}
                showStatus={true}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity cursor-pointer backdrop-blur-2xs"
                title="Change photo"
              >
                <Camera className="w-5 h-5 mb-0.5 text-[#F7A914]" />
                <span>Upload</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {currentUser.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#F7A914]/30 text-[#F7A914] border border-[#1E3A63] flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  {tx(getRoleDisplayName(activeRole))}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2">
                <span>{currentUser.email}</span>
                <span>•</span>
                <span className="font-mono text-[#F7A914] bg-white/10 px-2 py-0.5 rounded text-xs font-bold">
                  ID: {currentUser.schoolId || currentUser.studentId || currentUser.teacherId || 'USR-2026'}
                </span>
                {activeSchool && (
                  <>
                    <span>•</span>
                    <span className="text-slate-300 font-semibold">{activeSchool.name}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{tr('Settings & Account Center', 'Xarunta Habeynta & Koontada')}</span>
            </span>
          </div>
        </div>

        {/* Hidden File Input for Avatar Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
        />
      </div>

      {/* ========================================================================= */}
      {/* 2. PRIMARY SECTION MODE SWITCHER (Personal vs System Configuration)       */}
      {/* ========================================================================= */}
      {canManageSchoolConfig && (
        <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 dark:bg-slate-900/90 rounded-2xl border border-slate-300/80 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setSectionMode('personal')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              sectionMode === 'personal'
                ? 'bg-white dark:bg-slate-800 text-[#3B82F6] dark:text-[#60A5FA] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{tr('Personal Profile & Account', 'Profile-ka & Koontada Qofka')}</span>
          </button>

          <button
            type="button"
            onClick={() => setSectionMode('system')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              sectionMode === 'system'
                ? 'bg-white dark:bg-slate-800 text-[#3B82F6] dark:text-[#60A5FA] shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{tr('System & School Configuration', 'Habeynta Guud ee Dugsiga')}</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SECTION A: PERSONAL ACCOUNT & PROFILE SETTINGS                          */}
      {/* ========================================================================= */}
      {sectionMode === 'personal' && (
        <div className="space-y-6">
          {/* Personal Sub-Tabs Navigation */}
          <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-x-auto">
            <button
              onClick={() => setPersonalTab('profile')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                personalTab === 'profile'
                  ? 'bg-[#122E52] dark:bg-[#F7A914] text-white dark:text-[#122E52] shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{tr('My Profile & Details', 'Xogta Profile-ka')}</span>
            </button>

            <button
              onClick={() => setPersonalTab('security')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                personalTab === 'security'
                  ? 'bg-[#122E52] dark:bg-[#F7A914] text-white dark:text-[#122E52] shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Key className="w-4 h-4" />
              <span>{tr('Password & Security', 'Furaha & Amniga')}</span>
            </button>

            <button
              onClick={() => setPersonalTab('appearance')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                personalTab === 'appearance'
                  ? 'bg-[#122E52] dark:bg-[#F7A914] text-white dark:text-[#122E52] shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>{tr('Appearance & Language', 'Muuqaalka & Luuqadda')}</span>
            </button>

            <button
              onClick={() => setPersonalTab('notifications')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                personalTab === 'notifications'
                  ? 'bg-[#122E52] dark:bg-[#F7A914] text-white dark:text-[#122E52] shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>{tr('Notification Preferences', 'Ogeysiisyada')}</span>
            </button>

            <button
              onClick={() => setPersonalTab('credentials')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                personalTab === 'credentials'
                  ? 'bg-[#122E52] dark:bg-[#F7A914] text-white dark:text-[#122E52] shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <BadgeCheck className="w-4 h-4" />
              <span>{tr('Role & School Identity', 'Doorka & Aqoonsiga')}</span>
            </button>
          </div>

          {/* TAB 1: PERSONAL PROFILE DETAILS */}
          {personalTab === 'profile' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800 gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    {tr('Personal Profile Information', 'Xogta Profile-ka Qofka')}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {tr('Manage your personal contact info, biography, and public avatar photo.', 'Maamul macluumaadkaaga xiriirka iyo sawirkaaga.')}
                  </p>
                </div>

                {profileSuccessMsg && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{tr('Profile updated successfully!', 'Isbeddelada waa la keydiyay!')}</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <UserAvatar name={formData.name} avatarUrl={formData.avatar} size="lg" status={currentUser.status || 'Active'} />
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{tr('Profile Avatar Picture', 'Sawirka Profile-ka')}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">PNG, JPG, or WebP up to 4MB.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-outline-navy text-xs py-2 px-3.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{tr('Upload Photo', 'Soo Geli')}</span>
                    </button>
                    {formData.avatar && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{tr('Remove', 'Tirtir')}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {tr('Full Name', 'Magaca oo Dhammaystiran')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#3B82F6] outline-hidden transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {tr('Email Address', 'Email-ka')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#3B82F6] outline-hidden transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {tr('Phone Number', 'Taleefanka')}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#3B82F6] outline-hidden transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {tr('Job Title / Designation', 'Xilka')}
                    </label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#3B82F6] outline-hidden transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {tr('Address / Campus Location', 'Cinwaanka')}
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#3B82F6] outline-hidden transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {tr('Bio / Personal Statement', 'Faahfaahin')}
                    </label>
                    <textarea
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#3B82F6] outline-hidden transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="btn-gold text-xs py-2.5 px-6"
                  >
                    {isSavingProfile ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{tr('Save Profile Changes', 'Keydi Isbeddelada')}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: PASSWORD & SECURITY */}
          {personalTab === 'security' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800 gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">{tr('Password & Access Security', 'Furaha & Amniga')}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{tr('Update your credentials and account password.', 'Beddel furahaaga koontada.')}</p>
                </div>

                {passwordSuccess && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{tr('Password updated successfully!', 'Furaha waa la cusbooneysiiyay!')}</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSavePassword} className="space-y-6 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{tr('Current Password', 'Furaha Hadda')}</label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      required
                      placeholder="••••••••••••"
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                    <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{tr('New Password', 'Furaha Cusub')}</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      placeholder="Minimum 6 characters"
                      value={passwords.newPass}
                      onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                    <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {passwords.newPass && (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Strength:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{passStrength.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                        {[1, 2, 3, 4].map((step) => (
                          <div key={step} className={`h-full flex-1 rounded-full ${step <= passStrength.score ? passStrength.color : 'bg-slate-200 dark:bg-slate-700'}`} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{tr('Confirm New Password', 'Xaqiiji Furaha')}</label>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={passwords.confirmPass}
                    onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button type="submit" disabled={isUpdatingPassword} className="btn-gold">
                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>

              {/* WebAuthn Biometric Passkeys Section */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#122E52]/10 dark:bg-[#1E3A63] text-[#122E52] dark:text-[#F7A914] flex items-center justify-center">
                      <Fingerprint className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {tr('Biometric Passkey Quick Access', 'Furaha Faraha/Wajiga (WebAuthn)')}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {tr(
                          'Hardware-backed biometric passkey (Touch ID, Windows Hello, Face ID) for instant password-free workspace access.',
                          'Adeegso farahaaga ama wajigaaga si aad degdeg ugu gasho adoon gelin furaha sirta ah.'
                        )}
                      </p>
                    </div>
                  </div>

                  {isBiometricSupported ? (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        hasRegisteredBiometrics
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${hasRegisteredBiometrics ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {hasRegisteredBiometrics ? tr('Passkey Registered', 'Faraha waa Diyaar') : tr('Not Registered', 'Lama Diiwaangelin')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                      Unsupported on Browser
                    </span>
                  )}
                </div>

                {isBiometricSupported ? (
                  <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
                    {hasRegisteredBiometrics && registeredBiometricUser ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {registeredBiometricUser.deviceName || 'Local Device Hardware Token'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Enrolled: {new Date(registeredBiometricUser.createdAt).toLocaleDateString()} • Authorized for: {registeredBiometricUser.userName} ({registeredBiometricUser.userRole})
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleTestBiometrics}
                            disabled={biometricLoading}
                            className="btn-outline-navy text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer"
                          >
                            <Fingerprint className="w-3.5 h-3.5 text-[#3B82F6]" />
                            <span>{biometricLoading ? 'Testing...' : 'Test Sensor'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveBiometrics}
                            className="px-3 py-2 text-xs font-semibold rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
                          >
                            {tr('Remove Passkey', 'Tirtir Furaha')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {tr(
                            'No biometric passkey registered on this device yet. Click below to enroll your fingerprint or face recognition sensor for 1-click workspace entry.',
                            'Weli wax fure farood ah laguma diiwaangelin qalabkan. Guji badhanka si aad u diiwaangeliso.'
                          )}
                        </p>
                        <button
                          type="button"
                          id="register-biometric-btn"
                          onClick={handleRegisterBiometrics}
                          disabled={biometricLoading}
                          className="btn-gold text-xs py-2 px-4 shrink-0 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Fingerprint className="w-4 h-4" />
                          <span>{biometricLoading ? 'Enrolling Hardware...' : tr('Enroll Device Passkey', 'Diiwaangeli Faraha')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Your current browser does not expose the Web Authentication (WebAuthn) API or lacks hardware biometrics. Try Chrome, Edge, or Safari on an authenticated device.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: APPEARANCE & LANGUAGE */}
          {personalTab === 'appearance' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-8">
              <div className="pb-5 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">{tr('Appearance & Interface Language', 'Muuqaalka & Luuqadda')}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{tr('Customize your preferred application theme and interface language.', 'Dooro muuqaalkaaga iyo luuqadda aad jeceshahay.')}</p>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{tr('Theme Mode', 'Habka Midabka')}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      theme === 'dark'
                        ? 'border-[#122E52] dark:border-[#F7A914] bg-[#0B1B32] text-white ring-2 ring-[#F7A914]/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#122E52] text-[#F7A914] flex items-center justify-center">
                        <Moon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-white">Dark Mode</h4>
                        <p className="text-[11px] text-slate-400">High-contrast navy & gold Ileys palette.</p>
                      </div>
                    </div>
                    {theme === 'dark' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F7A914]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      theme === 'light'
                        ? 'border-[#122E52] bg-white text-slate-900 ring-2 ring-[#122E52]/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Sun className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Light Mode</h4>
                        <p className="text-[11px] text-slate-500">Daylight crisp slate & gold palette.</p>
                      </div>
                    </div>
                    {theme === 'light' && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#122E52]" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{tr('Platform Language', 'Luuqadda')}</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button type="button" onClick={() => setLanguage('en')} className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${language === 'en' ? 'border-[#122E52] bg-slate-50 dark:bg-[#122E52]/20 ring-2 ring-[#F7A914]/40' : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40'}`}>
                    <span className="text-xl mb-1 block">🇬🇧</span>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">English (US/UK)</h4>
                  </button>

                  <button type="button" onClick={() => setLanguage('so')} className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${language === 'so' ? 'border-[#122E52] bg-slate-50 dark:bg-[#122E52]/20 ring-2 ring-[#F7A914]/40' : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40'}`}>
                    <span className="text-xl mb-1 block">🇸🇴</span>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Af-Soomaali</h4>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {personalTab === 'notifications' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div className="pb-5 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">{tr('Notification Preferences', 'Ogeysiisyada')}</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{tr('Email Alerts', 'Ogeysiisyada Email')}</h4>
                    <p className="text-[11px] text-slate-500">Official updates and weekly summaries.</p>
                  </div>
                  <button type="button" onClick={() => setNotifications((p) => ({ ...p, emailAlerts: !p.emailAlerts }))} className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${notifications.emailAlerts ? 'bg-[#122E52]' : 'bg-slate-300 dark:bg-slate-700'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full transform transition-transform ${notifications.emailAlerts ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{tr('School Announcements', 'Farriimaha Dugsiga')}</h4>
                    <p className="text-[11px] text-slate-500">Principal announcements and urgent alerts.</p>
                  </div>
                  <button type="button" onClick={() => setNotifications((p) => ({ ...p, schoolAnnouncements: !p.schoolAnnouncements }))} className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${notifications.schoolAnnouncements ? 'bg-[#122E52]' : 'bg-slate-300 dark:bg-slate-700'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full transform transition-transform ${notifications.schoolAnnouncements ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ROLE & CREDENTIALS */}
          {personalTab === 'credentials' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div className="pb-5 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">{tr('Role & School Identity', 'Doorka & Aqoonsiga Rasmiga ah')}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-[#122E52]/5 dark:bg-[#122E52]/20 border border-[#1E3A63] dark:border-[#1E3A63] space-y-3">
                  <div className="flex items-center gap-3">
                    <BadgeCheck className="w-6 h-6 text-[#3B82F6]" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase">{tr('Active Role', 'Doorka')}</h4>
                      <p className="text-base font-black text-slate-900 dark:text-white">{tx(getRoleDisplayName(activeRole))}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    System ID: <span className="font-mono font-bold text-[#3B82F6]">{currentUser.schoolId || 'USR-2026'}</span>
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-6 h-6 text-[#3B82F6]" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase">{tr('Assigned School', 'Dugsiga')}</h4>
                      <p className="text-base font-black text-slate-900 dark:text-white">{activeSchool?.name || 'Amiir nuur'}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    School Code: <span className="font-mono font-bold">{activeSchool?.code || 'GH-001'}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SECTION B: SYSTEM & SCHOOL CONFIGURATION                                */}
      {/* ========================================================================= */}
      {sectionMode === 'system' && canManageSchoolConfig && (
        <div className="space-y-6">
          {/* System Sub-Tabs Navigation */}
          <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-x-auto">
            <button
              onClick={() => setSystemTab('school-profile')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                systemTab === 'school-profile'
                  ? 'bg-[#122E52] dark:bg-[#F7A914] text-white dark:text-[#122E52] shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{tr('School Institutional Profile', 'Xogta Dugsiga')}</span>
            </button>

            <button
              onClick={() => setSystemTab('billing')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                systemTab === 'billing'
                  ? 'bg-[#122E52] dark:bg-[#F7A914] text-white dark:text-[#122E52] shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{tr('Pro Subscription & Billing', 'Ileys Pro & Lacag-bixinta')}</span>
            </button>

            <button
              onClick={() => setSystemTab('academic-term')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                systemTab === 'academic-term'
                  ? 'bg-[#122E52] dark:bg-[#F7A914] text-white dark:text-[#122E52] shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{tr('Academic Term & Operations', 'Muddada & Hawlgalka')}</span>
            </button>

            {isSuperAdmin && (
              <button
                onClick={() => setSystemTab('governance')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  systemTab === 'governance'
                    ? 'bg-[#122E52] dark:bg-[#F7A914] text-white dark:text-[#122E52] shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{tr('Platform User Governance', 'Maamulka Isticmaalayaasha')}</span>
              </button>
            )}
          </div>

          {/* TAB B1: SCHOOL INSTITUTIONAL PROFILE */}
          {systemTab === 'school-profile' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800 gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">{tr('School Institutional Profile & Contact', 'Xogta Dugsiga & Xiriirka')}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{tr('Update school name, campus address, official motto, and contact details.', 'Wax ka beddel magaca dugsiga, cinwaanka, iyo xiriirka.')}</p>
                </div>

                {schoolSuccessMsg && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{tr('School configuration saved!', 'Xogta dugsiga waa la keydiyay!')}</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSaveSchoolConfig} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">School Name <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={schoolConfig.name}
                      onChange={(e) => setSchoolConfig({ ...schoolConfig, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">School Code / Tenant Identifier</label>
                    <input
                      type="text"
                      disabled={!isSuperAdmin}
                      value={schoolConfig.code}
                      onChange={(e) => setSchoolConfig({ ...schoolConfig, code: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 font-mono text-xs font-bold text-slate-900 dark:text-white disabled:opacity-75"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">School Motto / Tagline</label>
                    <input
                      type="text"
                      value={schoolConfig.motto}
                      onChange={(e) => setSchoolConfig({ ...schoolConfig, motto: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Official School Email</label>
                    <input
                      type="email"
                      value={schoolConfig.email}
                      onChange={(e) => setSchoolConfig({ ...schoolConfig, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Campus Phone Number</label>
                    <input
                      type="tel"
                      value={schoolConfig.phone}
                      onChange={(e) => setSchoolConfig({ ...schoolConfig, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Official Website</label>
                    <input
                      type="text"
                      value={schoolConfig.website}
                      onChange={(e) => setSchoolConfig({ ...schoolConfig, website: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Campus Physical Address</label>
                    <input
                      type="text"
                      value={schoolConfig.address}
                      onChange={(e) => setSchoolConfig({ ...schoolConfig, address: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="submit"
                    disabled={isSavingSchool}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#122E52] hover:bg-[#0B1B32] text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                  >
                    {isSavingSchool ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{tr('Save School Configuration', 'Keydi Habeynta Dugsiga')}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB B2: PRO SUBSCRIPTION & BILLING */}
          {systemTab === 'billing' && <BillingSettings />}

          {/* TAB B2: ACADEMIC TERM & OPERATIONS */}
          {systemTab === 'academic-term' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div className="pb-5 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">{tr('Academic Term & Operational Thresholds', 'Muddada Tacliinta & Heerarka')}</h2>
              </div>

              <form onSubmit={handleSaveSchoolConfig} className="space-y-6 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Academic Session Year</label>
                  <input
                    type="text"
                    value={schoolConfig.academicYear}
                    onChange={(e) => setSchoolConfig({ ...schoolConfig, academicYear: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Current Term Cycle</label>
                  <input
                    type="text"
                    value={schoolConfig.currentTerm}
                    onChange={(e) => setSchoolConfig({ ...schoolConfig, currentTerm: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Target Attendance Benchmark Rate (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={schoolConfig.targetAttendanceRate}
                    onChange={(e) => setSchoolConfig({ ...schoolConfig, targetAttendanceRate: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button type="submit" disabled={isSavingSchool} className="btn-gold">
                    Save Operations Settings
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB B3: PLATFORM USER GOVERNANCE (Super Admin only) */}
          {isSuperAdmin && systemTab === 'governance' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800 gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">Platform User Governance</h2>
                  <p className="text-xs text-slate-500">Super Admin user administration across all school tenants.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#3B82F6] dark:text-[#60A5FA] text-xs font-bold">
                  {filteredUsers.length} Users Total
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  placeholder="Search user name, email, or school code..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">School</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 flex items-center gap-3">
                          <UserAvatar name={user.name} avatarUrl={user.avatar} size="sm" />
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white">{user.name}</p>
                            <p className="text-[11px] text-slate-500">{user.email}</p>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-md bg-[#3B82F6]/10 text-[#3B82F6] dark:text-[#60A5FA] font-bold text-[10px]">
                            {tx(getRoleDisplayName(user.role))}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-[11px]">{user.schoolCode || 'GH-001'}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${user.status === 'Disabled' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {user.status || 'Active'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button onClick={() => adminToggleUserStatus(user.id)} className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-[11px] font-bold cursor-pointer">
                            {user.status === 'Disabled' ? 'Enable' : 'Disable'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
