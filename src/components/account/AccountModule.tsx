import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { UserRole } from '../../types';
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
  Camera
} from 'lucide-react';

export const AccountModule: React.FC = () => {
  const { currentUser, activeRole, switchRole, updateProfile } = useAuth();
  const { addToast } = useSchoolData();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'roles'>('profile');

  // Form State
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone || '',
    designation: currentUser.designation || '',
    address: currentUser.address || '',
    bio: currentUser.bio || '',
    avatar: currentUser.avatar,
  });

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: '',
  });

  const avatarOptions = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData);
    addToast('Profile updated successfully!');
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirmPass) {
      addToast('New passwords do not match!', 'error');
      return;
    }
    addToast('Password updated successfully!');
    setPasswords({ current: '', newPass: '', confirmPass: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Account & Profile Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage personal information, security preferences, and portal roles</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-2xs w-full sm:w-auto inline-flex gap-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'profile'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Profile Information
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'security'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Password & Security
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'roles'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Portal Role Simulator
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <img
                src={formData.avatar}
                alt={formData.name}
                className="w-full h-full rounded-3xl object-cover ring-4 ring-purple-100 shadow-md"
              />
            </div>
            <h3 className="text-lg font-bold text-slate-800">{formData.name}</h3>
            <p className="text-xs text-purple-600 font-semibold mt-0.5">{formData.designation || activeRole}</p>

            {/* School ID Badge Card */}
            <div className="mt-3 p-3 bg-purple-50/80 rounded-2xl border border-purple-200/80">
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block mb-0.5">
                Official School ID Number
              </span>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-extrabold text-slate-800 tracking-wide">
                  {currentUser.schoolId || currentUser.studentId || currentUser.teacherId || 'ADM-2026-0001'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const idToCopy = currentUser.schoolId || currentUser.studentId || currentUser.teacherId || 'ADM-2026-0001';
                    navigator.clipboard.writeText(idToCopy);
                    addToast(`Copied School ID ${idToCopy} to clipboard!`);
                  }}
                  className="px-2 py-1 bg-white hover:bg-purple-100 border border-purple-200 text-purple-700 rounded-lg text-[10px] font-bold transition-all shadow-2xs"
                >
                  Copy ID
                </button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 text-left space-y-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4 text-purple-600 shrink-0" />
                <span className="truncate">{formData.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-purple-600 shrink-0" />
                <span>{formData.phone || 'Not set'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Building className="w-4 h-4 text-purple-600 shrink-0" />
                <span>EduSpike Main Campus</span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
            <h3 className="text-base font-bold text-slate-800 mb-4">Edit Profile Information</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {/* Select Avatar */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Choose Avatar Photo</label>
                <div className="flex items-center gap-3">
                  {avatarOptions.map((imgUrl, i) => (
                    <img
                      key={i}
                      src={imgUrl}
                      alt="Avatar option"
                      onClick={() => setFormData({ ...formData, avatar: imgUrl })}
                      className={`w-12 h-12 rounded-2xl object-cover cursor-pointer transition-all ${
                        formData.avatar === imgUrl
                          ? 'ring-4 ring-purple-600 scale-105 shadow-md'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Designation / Title</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bio / Profile Summary</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-md shadow-purple-200 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="max-w-xl bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
          <h3 className="text-base font-bold text-slate-800 mb-4">Change Account Password</h3>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={passwords.current}
                onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                required
                value={passwords.newPass}
                onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                placeholder="At least 8 characters"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwords.confirmPass}
                onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
                placeholder="Repeat new password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs font-medium"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors shadow-md shadow-purple-200"
            >
              Update Password
            </button>
          </form>
        </div>
      )}

      {/* Role Simulator Tab */}
      {activeTab === 'roles' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
          <h3 className="text-base font-bold text-slate-800 mb-2">Switch Active Portal Role</h3>
          <p className="text-xs text-slate-500 mb-6">
            Test role-based access control. Switching role updates permissions and context across all modules immediately.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['Admin', 'Teacher', 'Student', 'Parent'] as UserRole[]).map((r) => (
              <div
                key={r}
                onClick={() => switchRole(r)}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  activeRole === r
                    ? 'border-purple-600 bg-purple-50/60 shadow-md ring-2 ring-purple-500/20'
                    : 'border-slate-100 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                    {r.charAt(0)}
                  </span>
                  {activeRole === r && <CheckCircle2 className="w-5 h-5 text-purple-600" />}
                </div>
                <h4 className="text-sm font-bold text-slate-800">{r} Portal</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  {r === 'Admin' && 'Full administrative oversight, manage teachers, students, books & settings.'}
                  {r === 'Teacher' && 'Class management, attendance marking, student grades & notices.'}
                  {r === 'Student' && 'View report cards, borrow books, check schedules & attendance.'}
                  {r === 'Parent' && 'Track child academic performance, attendance logs & notices.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
