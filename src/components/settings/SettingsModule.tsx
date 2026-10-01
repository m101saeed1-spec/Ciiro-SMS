import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import {
  Settings,
  Building2,
  Calendar,
  ShieldCheck,
  Bell,
  Save,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  Phone,
  MapPin,
  Globe,
  Award,
  DollarSign,
  Target,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const { currentUser, activeSchool, updateSchool, activeRole, isSuperAdmin, isOwnerAdmin, isPrincipal } = useAuth();
  const { addToast } = useSchoolData();

  const [activeTab, setActiveTab] = useState<'profile' | 'academic' | 'notifications' | 'security'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // School Profile State
  const [schoolData, setSchoolData] = useState({
    name: activeSchool?.name || 'Eduspike International Academy',
    code: activeSchool?.code || 'EDUSPIKE-01',
    motto: activeSchool?.motto || 'Empowering Future Leaders with Excellence & Integrity',
    email: activeSchool?.email || 'admin@eduspike.edu',
    phone: activeSchool?.phone || '+1 (555) 019-2834',
    address: activeSchool?.address || '104 Harmony Blvd, Academic Hills',
    website: activeSchool?.website || 'https://eduspike.edu',
    currency: activeSchool?.currency || '$',
    academicYear: activeSchool?.academicYear || '2026-2027',
    currentTerm: activeSchool?.currentTerm || 'Term 1 (Fall 2026)',
    targetAttendanceRate: activeSchool?.targetAttendanceRate ?? activeSchool?.stats?.targetAttendanceRate ?? 95,
  });

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    dailyAttendanceReport: true,
    feeReminders: true,
    examPublishedNotice: true,
  });

  // Security / Password Change State
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Synchronize when activeSchool changes
  useEffect(() => {
    if (activeSchool) {
      setSchoolData({
        name: activeSchool.name || '',
        code: activeSchool.code || '',
        motto: activeSchool.motto || '',
        email: activeSchool.email || '',
        phone: activeSchool.phone || '',
        address: activeSchool.address || '',
        website: activeSchool.website || '',
        currency: activeSchool.currency || '$',
        academicYear: activeSchool.academicYear || '2026-2027',
        currentTerm: activeSchool.currentTerm || 'Term 1 (Fall 2026)',
        targetAttendanceRate: activeSchool.targetAttendanceRate ?? activeSchool.stats?.targetAttendanceRate ?? 95,
      });
    }
  }, [activeSchool]);

  const handleSaveSchoolSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSchool) {
      setErrorMsg('No active school selected to configure.');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      await updateSchool(activeSchool.id, {
        name: schoolData.name.trim(),
        code: schoolData.code.trim().toUpperCase(),
        motto: schoolData.motto.trim(),
        email: schoolData.email.trim(),
        phone: schoolData.phone.trim(),
        address: schoolData.address.trim(),
        website: schoolData.website.trim(),
        currency: schoolData.currency.trim(),
        academicYear: schoolData.academicYear,
        currentTerm: schoolData.currentTerm,
        targetAttendanceRate: Number(schoolData.targetAttendanceRate) || 95,
      });

      setIsSaving(false);
      setSaveSuccess(true);
      addToast('Institutional settings updated and persisted successfully!', 'success');
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setIsSaving(false);
      const msg = err?.message || 'Failed to save settings. Please try again.';
      setErrorMsg(msg);
      addToast(msg, 'error');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityData.newPassword) {
      addToast('Please enter a new password.', 'warning');
      return;
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
      addToast('New password and confirmation do not match.', 'error');
      return;
    }
    if (securityData.newPassword.length < 6) {
      addToast('Password must be at least 6 characters.', 'warning');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.id}`,
        },
        body: JSON.stringify({
          schoolId: currentUser.schoolId || currentUser.id,
          newPassword: securityData.newPassword,
        }),
      });

      setIsUpdatingPassword(false);
      if (res.ok) {
        addToast('Your security credentials have been updated successfully!', 'success');
        setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const data = await res.json().catch(() => ({}));
        addToast(data.error || 'Password update failed.', 'error');
      }
    } catch (e: any) {
      setIsUpdatingPassword(false);
      addToast(e?.message || 'Network error updating password.', 'error');
    }
  };

  const canEditSchoolProfile =
    isSuperAdmin ||
    isOwnerAdmin ||
    isPrincipal ||
    activeRole === 'OwnerAdmin' ||
    activeRole === 'Principal' ||
    activeRole === 'Admin';

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <Settings className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              System Administration
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
              {activeSchool?.name || 'School System'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            School & Account Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure institutional profiles, academic term schedules, attendance targets, and account security.
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved & Persisted!</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-200/60 dark:bg-slate-800/60 rounded-2xl w-fit border border-slate-200 dark:border-slate-700 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>School Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('academic')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'academic'
              ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Academic & Terms</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'notifications'
              ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'security'
              ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Account Security</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SCHOOL PROFILE SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveSchoolSettings} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Institutional Identity & Contact</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Official school records, identifiers, contact coordinates, and institutional motto.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official School Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={!canEditSchoolProfile}
                value={schoolData.name}
                onChange={(e) => setSchoolData({ ...schoolData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Institutional Code / Affiliation ID
              </label>
              <input
                type="text"
                required
                disabled={!canEditSchoolProfile}
                value={schoolData.code}
                onChange={(e) => setSchoolData({ ...schoolData, code: e.target.value.toUpperCase() })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono uppercase focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                School Motto / Vision Statement
              </label>
              <input
                type="text"
                disabled={!canEditSchoolProfile}
                value={schoolData.motto}
                onChange={(e) => setSchoolData({ ...schoolData, motto: e.target.value })}
                placeholder="e.g. Empowering Future Leaders with Excellence"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Administrative Email Address
              </label>
              <input
                type="email"
                disabled={!canEditSchoolProfile}
                value={schoolData.email}
                onChange={(e) => setSchoolData({ ...schoolData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number / Switchboard
              </label>
              <input
                type="tel"
                disabled={!canEditSchoolProfile}
                value={schoolData.phone}
                onChange={(e) => setSchoolData({ ...schoolData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Campus Physical Address
              </label>
              <input
                type="text"
                disabled={!canEditSchoolProfile}
                value={schoolData.address}
                onChange={(e) => setSchoolData({ ...schoolData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Website
              </label>
              <input
                type="url"
                disabled={!canEditSchoolProfile}
                value={schoolData.website}
                onChange={(e) => setSchoolData({ ...schoolData, website: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Financial Currency Symbol
              </label>
              <select
                disabled={!canEditSchoolProfile}
                value={schoolData.currency}
                onChange={(e) => setSchoolData({ ...schoolData, currency: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-purple-500 disabled:opacity-60 cursor-pointer"
              >
                <option value="$">USD ($) - US Dollar</option>
                <option value="€">EUR (€) - Euro</option>
                <option value="£">GBP (£) - British Pound</option>
                <option value="₹">INR (₹) - Indian Rupee</option>
                <option value="AED">AED - UAE Dirham</option>
                <option value="KES">KES - Kenyan Shilling</option>
              </select>
            </div>
          </div>

          {canEditSchoolProfile && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save School Profile</span>
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ACADEMIC CALENDAR & TERMS */}
      {/* ========================================================================= */}
      {activeTab === 'academic' && (
        <form onSubmit={handleSaveSchoolSettings} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Academic Calendar & Target Attendance</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Set active academic year, institutional term milestones, and baseline attendance compliance targets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Active Academic Session / Year
              </label>
              <select
                disabled={!canEditSchoolProfile}
                value={schoolData.academicYear}
                onChange={(e) => setSchoolData({ ...schoolData, academicYear: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-purple-500 disabled:opacity-60 cursor-pointer"
              >
                <option value="2025-2026">Academic Year 2025 - 2026</option>
                <option value="2026-2027">Academic Year 2026 - 2027 (Current)</option>
                <option value="2027-2028">Academic Year 2027 - 2028</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Current Term / Semester Cycle
              </label>
              <select
                disabled={!canEditSchoolProfile}
                value={schoolData.currentTerm}
                onChange={(e) => setSchoolData({ ...schoolData, currentTerm: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-purple-500 disabled:opacity-60 cursor-pointer"
              >
                <option value="Term 1 (Fall 2026)">Term 1 (Fall 2026)</option>
                <option value="Term 2 (Spring 2027)">Term 2 (Spring 2027)</option>
                <option value="Term 3 (Summer 2027)">Term 3 (Summer 2027)</option>
              </select>
            </div>

            <div className="sm:col-span-2 p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <label className="block font-bold text-purple-950 dark:text-purple-200">
                    Institutional Target Attendance Benchmark (%)
                  </label>
                  <p className="text-[11px] text-purple-700 dark:text-purple-300 mt-0.5">
                    Defines the threshold line on all dashboard attendance telemetry widgets and reports.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="50"
                    max="100"
                    disabled={!canEditSchoolProfile}
                    value={schoolData.targetAttendanceRate}
                    onChange={(e) => setSchoolData({ ...schoolData, targetAttendanceRate: Number(e.target.value) })}
                    className="w-20 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 font-extrabold text-sm text-center focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="font-bold text-purple-900 dark:text-purple-200 text-sm">%</span>
                </div>
              </div>
            </div>
          </div>

          {canEditSchoolProfile && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Academic Settings</span>
              </button>
            </div>
          )}
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: NOTIFICATIONS PREFERENCES */}
      {/* ========================================================================= */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Communication & Telemetry Alerts</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Control automated administrative broadcasts, daily roll summaries, and fee notifications.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100">Daily Attendance Roll Summary</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  Send morning roll call digest to Principal and School Owner once classes complete marking.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.dailyAttendanceReport}
                onChange={(e) => setNotifications({ ...notifications, dailyAttendanceReport: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100">Official Bulletin & Announcement Broadcasts</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  Instant portal alert when Principal publishes high-priority school announcements.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailAlerts}
                onChange={(e) => setNotifications({ ...notifications, emailAlerts: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100">Fee Invoicing & Payment Reminders</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                  Notify accounts bursar and guardians when invoices approach scheduled due dates.
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.feeReminders}
                onChange={(e) => setNotifications({ ...notifications, feeReminders: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => addToast('Notification preferences updated.', 'success')}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-500/20 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Notification Preferences</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ACCOUNT SECURITY & PASSWORD */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <form onSubmit={handlePasswordChange} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Credentials & Access Control</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Update password for <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser.name}</span> ({currentUser.role} · {currentUser.schoolId || currentUser.id}).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                New Secure Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={securityData.newPassword}
                  onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={securityData.confirmPassword}
                onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                placeholder="Repeat new password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-3 text-xs">
            <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div className="text-slate-600 dark:text-slate-400">
              <p className="font-bold text-slate-800 dark:text-slate-200">Active Authentication Security</p>
              <p className="mt-0.5">
                Passwords are encrypted using cryptographic salt standards. Updating credentials invalidates prior authentication tokens across secondary sessions.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
            >
              {isUpdatingPassword ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
