import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useLanguage } from '../../context/LanguageContext';
import { UserAvatar } from '../common/UserAvatar';
import {
  UserCheck,
  ShieldCheck,
  Plus,
  Mail,
  Phone,
  Calendar,
  Award,
  BookOpen,
  Users,
  GraduationCap,
  Edit,
  Trash2,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
  Send,
  Building2,
  FileText,
  Sparkles,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  X,
  BadgeCheck,
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface PreviousPrincipalRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  appointedAt: string;
  tenureEndedAt: string;
  handoverSummary: string;
}

export const HeadteacherManagementModule: React.FC = () => {
  const { activeSchool, updateSchool, isOwnerAdmin, isSuperAdmin } = useAuth();
  const { teachers, students, addToast } = useSchoolData();
  const { language, t, tx, tr } = useLanguage();

  // Current Principal State
  const [principalDetails, setPrincipalDetails] = useState({
    name: activeSchool?.principalName || 'Dr. Eleanor Vance',
    email: activeSchool?.principalEmail || 'principal@greenhillschool.edu.so',
    phone: '+252 61 7890123',
    qualification: 'Ph.D in Educational Leadership & Curriculum Planning',
    appointedDate: '2024-08-15',
    staffId: 'HT-2026-001',
    status: 'Active',
    bio: 'Experienced instructional leader with over 14 years in secondary school administration, STEM curriculum design, and teacher mentorship.',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
  });

  // Modal States
  const [isAppointModalOpen, setIsAppointModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Appoint / Replace Principal Form State
  const [appointForm, setAppointForm] = useState({
    name: '',
    email: '',
    phone: '',
    qualification: '',
    appointedDate: new Date().toISOString().split('T')[0],
    staffId: `HT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    temporaryPassword: 'TempHeadteacher2026!',
    handoverNotes: '',
  });

  // Leadership History Archive
  const [historicalPrincipals, setHistoricalPrincipals] = useState<PreviousPrincipalRecord[]>([
    {
      id: 'hp-1',
      name: 'Prof. Hassan Ali Jama',
      email: 'hassan.jama@former-school.so',
      phone: '+252 61 5551234',
      qualification: 'M.Sc Education Management, Mogadishu University',
      appointedAt: '2020-09-01',
      tenureEndedAt: '2024-07-30',
      handoverSummary: 'Successfully oversaw 4 graduation cycles, established the digital science lab, and upgraded school accreditation.',
    },
    {
      id: 'hp-2',
      name: 'Ustadh Mohamed Farah',
      email: 'm.farah@former-school.so',
      phone: '+252 61 5559876',
      qualification: 'B.Ed Mathematics & School Administration',
      appointedAt: '2016-08-15',
      tenureEndedAt: '2020-08-30',
      handoverSummary: 'Founding headteacher who established early school academic guidelines and faculty recruitment structures.',
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handler to Appoint a new Headteacher
  const handleAppointHeadteacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointForm.name.trim() || !appointForm.email.trim()) {
      addToast('Headteacher name and email are required', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      // Archive the current headteacher
      const newHistoryEntry: PreviousPrincipalRecord = {
        id: `hp-${Date.now()}`,
        name: principalDetails.name,
        email: principalDetails.email,
        phone: principalDetails.phone,
        qualification: principalDetails.qualification,
        appointedAt: principalDetails.appointedDate,
        tenureEndedAt: new Date().toISOString().split('T')[0],
        handoverSummary: appointForm.handoverNotes || 'Handover completed upon appointment of new Headteacher.',
      };

      setHistoricalPrincipals((prev) => [newHistoryEntry, ...prev]);

      // Update current details
      setPrincipalDetails({
        name: appointForm.name,
        email: appointForm.email,
        phone: appointForm.phone || '+252 61 0000000',
        qualification: appointForm.qualification || 'M.Ed Educational Leadership',
        appointedDate: appointForm.appointedDate,
        staffId: appointForm.staffId,
        status: 'Active',
        bio: `Appointed on ${appointForm.appointedDate}. Leading academic operations, teacher development, and student achievement.`,
        avatar: '',
      });

      if (activeSchool) {
        await updateSchool(activeSchool.id, {
          principalName: appointForm.name,
          principalEmail: appointForm.email,
        });
      }

      addToast(`New Headteacher "${appointForm.name}" appointed successfully!`, 'success');
      setIsAppointModalOpen(false);
      setAppointForm({
        name: '',
        email: '',
        phone: '',
        qualification: '',
        appointedDate: new Date().toISOString().split('T')[0],
        staffId: `HT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        temporaryPassword: 'TempHeadteacher2026!',
        handoverNotes: '',
      });
    } catch {
      addToast('Failed to appoint new headteacher', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler to Edit Current Principal Details
  const handleEditPrincipal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!principalDetails.name.trim()) {
      addToast('Name is required', 'warning');
      return;
    }

    if (activeSchool) {
      await updateSchool(activeSchool.id, {
        principalName: principalDetails.name,
        principalEmail: principalDetails.email,
      });
    }

    addToast('Headteacher profile details updated!', 'success');
    setIsEditModalOpen(false);
  };

  const handleResetPassword = () => {
    addToast(`Password reset link & temporary access token sent to ${principalDetails.email}`, 'success');
    setIsResetPasswordModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* ========================================================================= */}
      {/* 1. TOP HERO BANNER: SCHOOL HEADTEACHER MANAGEMENT                         */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-[#122E52] via-[#0B1B32] to-[#12233F] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-[#F7A914] shadow-inner">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {tr('Headteacher & Principal Management', 'Maamulka Maamulaha Dugsiga')}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30">
                    {activeSchool?.name || 'Amiir nuur'} ({activeSchool?.code || 'GH-001'})
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {tr(
                    'Direct oversight of academic leadership, instructional governance, and headteacher credentials.',
                    'Kormeerka hoggaanka tacliinta, maamulka macallimiinta, iyo xogta maamulaha dugsiga.'
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/10 transition-all cursor-pointer"
            >
              <History className="w-4 h-4 text-[#F7A914]" />
              <span>{tr('Tenure History', 'Taariikhda Maamulayaashii Hore')}</span>
            </button>

            <button
              onClick={() => setIsAppointModalOpen(true)}
              className="btn-gold"
            >
              <Plus className="w-4 h-4" />
              <span>{tr('Appoint / Change Headteacher', 'Magacow Maamule Cusub')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ACTIVE HEADTEACHER SHOWCASE CARD                                       */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 dark:border-slate-800 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs">
              {tr('Current In-Office Headteacher', 'Maamulaha Hadda ee Dugsiga')}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5 text-[#3B82F6] dark:text-[#60A5FA]" />
              <span>{tr('Edit Profile', 'Wax ka beddel')}</span>
            </button>

            <button
              onClick={() => setIsResetPasswordModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#122E52]/10 dark:bg-[#1E3A63] hover:bg-[#122E52]/20 text-[#3B82F6] dark:text-[#60A5FA] text-xs font-bold border border-[#1E3A63] transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{tr('Reset Credentials', 'Cusbooneysii Furaha')}</span>
            </button>
          </div>
        </div>

        {/* Profile Card Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Identity & Credentials */}
          <div className="lg:col-span-1 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col items-center text-center space-y-4">
            <UserAvatar
              name={principalDetails.name}
              avatarUrl={principalDetails.avatar}
              size="xl"
              status="Active"
              showStatus={true}
            />

            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {principalDetails.name}
              </h3>
              <p className="text-xs font-bold text-[#3B82F6] dark:text-[#60A5FA] mt-0.5">
                Headteacher & Academic Director
              </p>
              <span className="inline-block mt-2 font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-600">
                Staff ID: {principalDetails.staffId}
              </span>
            </div>

            <div className="w-full pt-4 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2.5 text-left text-xs">
              <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                <Mail className="w-4 h-4 text-[#3B82F6] shrink-0" />
                <span className="truncate">{principalDetails.email}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                <Phone className="w-4 h-4 text-[#3B82F6] shrink-0" />
                <span>{principalDetails.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
                <Calendar className="w-4 h-4 text-[#3B82F6] shrink-0" />
                <span>Appointed: {principalDetails.appointedDate}</span>
              </div>
            </div>
          </div>

          {/* Column 2 & 3: Performance, Qualifications & Delegated Oversight */}
          <div className="lg:col-span-2 space-y-6">
            {/* 4 Leadership KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#122E52]/20 border border-slate-200 dark:border-[#1E3A63]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Faculty
                  </span>
                  <Users className="w-3.5 h-3.5 text-[#3B82F6]" />
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  {(teachers || []).length || 14}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Teachers Supervised
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 border border-[#3B82F6]/20">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Students
                  </span>
                  <GraduationCap className="w-3.5 h-3.5 text-[#3B82F6]" />
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  {(students || []).length || 842}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Total Student Body
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Syllabus
                  </span>
                  <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  98.4%
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Curriculum Progress
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-200/60 dark:border-cyan-800/40">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Attendance
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  99.1%
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Roll Verification Rate
                </p>
              </div>
            </div>

            {/* Academic Qualifications & Background Statement */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Award className="w-4 h-4 text-[#3B82F6]" />
                <span>{tr('Academic Background & Credentials', 'Shahaadooyinka & Khibradda')}</span>
              </div>
              <p className="text-xs font-semibold text-[#3B82F6] dark:text-[#60A5FA]">
                {principalDetails.qualification}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {principalDetails.bio}
              </p>
            </div>

            {/* Active Delegation Checklist */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {tr('Active Responsibilities & Delegated Authority', 'Awoodaha loo Wakiishay')}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Curriculum Planning & Syllabus Oversight</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Teacher Recruiting & Performance Reviews</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Exam Schedule Approval & Result Publishing</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Official Student Disciplinary Governance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: APPOINT NEW HEADTEACHER                                            */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAppointModalOpen}
        onClose={() => setIsAppointModalOpen(false)}
        title={tr('Appoint / Replace School Headteacher', 'Magacow Maamulaha Cusub ee Dugsiga')}
        size="lg"
      >
        <form onSubmit={handleAppointHeadteacher} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              {tr(
                'Appointing a new headteacher will archive the current principal into leadership records and grant the new administrator full Principal credentials.',
                'Magacaabista maamule cusub waxay kaydin doontaa maamulihii hore waxayna siin doontaa maamulaha cusub awoodaha oo dhan.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Amina Hersi"
                value={appointForm.name}
                onChange={(e) => setAppointForm({ ...appointForm, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="amina.hersi@school.edu.so"
                value={appointForm.email}
                onChange={(e) => setAppointForm({ ...appointForm, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+252 61 7000000"
                value={appointForm.phone}
                onChange={(e) => setAppointForm({ ...appointForm, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Academic Degree & Qualification
              </label>
              <input
                type="text"
                placeholder="e.g. M.Ed in Educational Management"
                value={appointForm.qualification}
                onChange={(e) => setAppointForm({ ...appointForm, qualification: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Appointment Date
              </label>
              <input
                type="date"
                value={appointForm.appointedDate}
                onChange={(e) => setAppointForm({ ...appointForm, appointedDate: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Temporary Login Password
              </label>
              <input
                type="text"
                value={appointForm.temporaryPassword}
                onChange={(e) => setAppointForm({ ...appointForm, temporaryPassword: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Handover Notes / Reason for Transition
              </label>
              <textarea
                rows={2}
                placeholder="Describe leadership transition goals, key priorities, and handover status..."
                value={appointForm.handoverNotes}
                onChange={(e) => setAppointForm({ ...appointForm, handoverNotes: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAppointModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold"
            >
              {isSubmitting ? 'Confirming...' : 'Appoint Headteacher'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: EDIT CURRENT PRINCIPAL                                             */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={tr('Edit Headteacher Information', 'Wax ka beddel Xogta Maamulaha')}
      >
        <form onSubmit={handleEditPrincipal} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={principalDetails.name}
              onChange={(e) => setPrincipalDetails({ ...principalDetails, name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={principalDetails.email}
              onChange={(e) => setPrincipalDetails({ ...principalDetails, email: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
            <input
              type="tel"
              value={principalDetails.phone}
              onChange={(e) => setPrincipalDetails({ ...principalDetails, phone: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Qualifications</label>
            <input
              type="text"
              value={principalDetails.qualification}
              onChange={(e) => setPrincipalDetails({ ...principalDetails, qualification: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gold"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: RESET PASSWORD                                                     */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isResetPasswordModalOpen}
        onClose={() => setIsResetPasswordModalOpen(false)}
        title={tr('Reset Headteacher Credentials', 'Cusbooneysii Furaha Maamulaha')}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            A temporary password reset link will be sent to the headteacher's verified school email: <strong className="text-[#3B82F6] dark:text-[#60A5FA]">{principalDetails.email}</strong>.
          </p>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#122E52]/20 border border-slate-200 dark:border-[#1E3A63] text-xs text-[#12233F] dark:text-slate-200 font-medium">
            The link will remain active for 24 hours and force password update upon first authentication.
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsResetPasswordModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleResetPassword}
              className="btn-gold"
            >
              Send Reset Link
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL: TENURE HISTORY                                                     */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={tr('Leadership Tenure History', 'Taariikhda Maamulayaashii Soo Maray Dugsiga')}
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Official archival ledger of previous headteachers and principals who led {activeSchool?.name || 'Amiir nuur'}.
          </p>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {historicalPrincipals.map((hp) => (
              <div key={hp.id} className="py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">{hp.name}</h4>
                  <span className="text-[11px] font-mono text-[#3B82F6] dark:text-[#60A5FA] bg-[#122E52]/10 dark:bg-[#1E3A63] px-2 py-0.5 rounded">
                    {hp.appointedAt} — {hp.tenureEndedAt}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {hp.qualification} • {hp.email}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  {hp.handoverSummary}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsHistoryModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
