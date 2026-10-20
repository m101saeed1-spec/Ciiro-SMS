import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { UserAvatar } from '../common/UserAvatar';
import { getInitials } from '../../utils/avatarUtils';
import {
  User,
  ShieldCheck,
  Lock,
  Edit3,
  Save,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  Award,
  BookOpen,
  Info,
  Sparkles,
} from 'lucide-react';

export const StudentProfileModule: React.FC = () => {
  const { currentUser, updateProfile, activeRole } = useAuth();
  const { students, addToast } = useSchoolData();

  // Find linked student record
  const studentRecord = students.find((s) => s.id === currentUser.studentId) || {
    id: currentUser.studentId || currentUser.schoolId || 'STU-2026-0125',
    schoolId: currentUser.schoolId || 'STU-2026-0125',
    rollNo: '12',
    name: currentUser.name || 'Sarah Jenkins',
    avatar: currentUser.avatar,
    email: currentUser.email,
    class: 'Class 02',
    section: 'A',
    gender: 'Female' as const,
    dob: '2016-04-12',
    bloodGroup: 'O+',
    parentName: 'Robert Jenkins',
    parentPhone: '+1 (555) 456-7890',
    parentEmail: 'robert.jenkins@gmail.com',
    status: 'Active' as const,
    enrollmentDate: '2023-09-01',
    attendanceRate: 98.5,
  };

  const [bio, setBio] = useState(currentUser.bio || 'Enthusiastic 2nd grade student passionate about literature, drawing, and mathematics puzzles.');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveBio = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({ bio });
      setIsEditingBio(false);
      addToast({
        title: 'Student Bio Updated',
        message: 'Your personal biography statement was saved successfully.',
        type: 'success',
      });
    } catch {
      addToast({
        title: 'Update Failed',
        message: 'Could not save bio. Please check your network connection.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#122E52] via-[#0B1B32] to-[#12233F] border border-[#1E3A63] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative">
            <UserAvatar
              name={studentRecord.name}
              avatarUrl={studentRecord.avatar || currentUser.avatar}
              size="profile"
              ring="ring-4 ring-white/40 shadow-lg"
              status={studentRecord.status}
              showStatus={true}
            />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider text-slate-200">
                Official Student Record
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-200 text-xs font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> ID Verified
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-mono font-bold">
                [ {getInitials(studentRecord.name)} ]
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{studentRecord.name}</h1>
            <p className="text-slate-200 text-xs sm:text-sm mt-1">
              Student ID: <span className="font-mono font-bold text-white">{studentRecord.id}</span> • Roll #{studentRecord.rollNo} • {studentRecord.class} (Section {studentRecord.section})
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4 text-xs text-slate-200">
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
                <Calendar className="w-3.5 h-3.5" /> Enrolled: {studentRecord.enrollmentDate}
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-xl">
                <Award className="w-3.5 h-3.5" /> Attendance: {studentRecord.attendanceRate}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Official Records Security Notice */}
      <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 shrink-0 mt-0.5">
          <Lock className="w-4 h-4" />
        </div>
        <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <span className="font-bold block text-sm text-amber-950 dark:text-amber-100 mb-0.5">Locked Official Academic Records</span>
          Official student details including Student ID, legal name, date of birth, class, section, enrollment status, and parent/guardian information are managed exclusively by authorized School Administration. Students are permitted to edit their personal biography statement.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Official Student Records (Read-Only) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Academic & Personal Details */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#122E52]/10 dark:bg-[#1E3A63] text-[#122E52] dark:text-[#F7A914] flex items-center justify-center font-bold">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800 dark:text-white">Academic & Personal Profile</h2>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">Official institutional record</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Lock className="w-3 h-3" /> Read Only
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 dark:text-slate-500 font-semibold block mb-0.5">Official Student ID</span>
                <span className="text-sm font-mono font-bold text-slate-800 dark:text-white">{studentRecord.id}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 dark:text-slate-500 font-semibold block mb-0.5">Full Legal Name</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">{studentRecord.name}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 dark:text-slate-500 font-semibold block mb-0.5">Assigned Class & Section</span>
                <span className="text-sm font-bold text-[#122E52] dark:text-[#F7A914]">{studentRecord.class} - Section {studentRecord.section}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 dark:text-slate-500 font-semibold block mb-0.5">Class Roll Number</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">#{studentRecord.rollNo}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 dark:text-slate-500 font-semibold block mb-0.5">Date of Birth</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">{studentRecord.dob}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 dark:text-slate-500 font-semibold block mb-0.5">Gender</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">{studentRecord.gender}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 dark:text-slate-500 font-semibold block mb-0.5">Blood Group</span>
                <span className="text-sm font-bold text-rose-600 dark:text-rose-400">{studentRecord.bloodGroup}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 dark:text-slate-500 font-semibold block mb-0.5">Official Student Email</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">{studentRecord.email}</span>
              </div>
            </div>
          </div>

          {/* Parent & Guardian Information */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 text-[#3B82F6] dark:text-[#60A5FA] flex items-center justify-center font-bold">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-800 dark:text-white">Parent / Guardian Information</h2>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">Emergency contacts & primary guardians</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg flex items-center gap-1">
                <Lock className="w-3 h-3" /> Read Only
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 dark:text-slate-500 font-semibold block mb-0.5">Guardian Name</span>
                <span className="font-bold text-slate-800 dark:text-white">{studentRecord.parentName}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 dark:text-slate-500 font-semibold block mb-0.5">Contact Phone</span>
                <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-slate-400 dark:text-slate-500" /> {studentRecord.parentPhone}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-400 dark:text-slate-500 font-semibold block mb-0.5">Guardian Email</span>
                <span className="font-bold text-slate-800 dark:text-white flex items-center gap-1 mt-0.5 truncate">
                  <Mail className="w-3 h-3 text-slate-400 dark:text-slate-500" /> {studentRecord.parentEmail}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Bio & Enrollment Summary */}
        <div className="space-y-6">
          {/* Editable Student Bio Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Student Bio</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Personal statement & interests</p>
              </div>
              {!isEditingBio && (
                <button
                  onClick={() => setIsEditingBio(true)}
                  className="btn-outline-navy"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Bio
                </button>
              )}
            </div>

            {isEditingBio ? (
              <form onSubmit={handleSaveBio} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Your Personal Statement
                  </label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your interests, academic goals, favorite subjects..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 text-xs font-medium text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20"
                    maxLength={300}
                  />
                  <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    <span>Only Bio field can be modified by students</span>
                    <span>{bio.length} / 300</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-gold flex-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSaving ? 'Saving...' : 'Save Bio'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBio(currentUser.bio || '');
                      setIsEditingBio(false);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#122E52]/20 border border-slate-200 dark:border-[#1E3A63] text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "{bio || 'No bio entered yet. Click Edit Bio to add your hobbies, interests, or favorite subjects!'}"
              </div>
            )}
          </div>

          {/* Academic Governance Box */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-lg space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F7A914]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F7A914]">
                Institutional Standing
              </h3>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-700/60">
                <span className="text-slate-400">Academic Year</span>
                <span className="font-bold text-white">2026 - 2027</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/60">
                <span className="text-slate-400">Current Term</span>
                <span className="font-bold text-[#F7A914]">Mid-Term Term 1</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/60">
                <span className="text-slate-400">Role Status</span>
                <span className="font-bold text-emerald-400">Active Student</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Assigned By</span>
                <span className="font-bold text-white">{currentUser.roleAssignedBy || 'Administration'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
