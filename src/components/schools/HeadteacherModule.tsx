import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { School, PreviousPrincipal } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { getInitials } from '../../utils/avatarUtils';
import {
  UserCheck,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  Calendar,
  Lock,
  History,
  AlertCircle,
  CheckCircle2,
  Users,
  GraduationCap,
  Sparkles,
  Info,
  RefreshCw,
  Search,
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const HeadteacherModule: React.FC = () => {
  const {
    currentUser,
    activeRole,
    isSuperAdmin,
    isOwnerAdmin,
    schools,
    activeSchool,
    updateSchool,
    userProfiles,
  } = useAuth();
  const { addToast } = useSchoolData();

  const isPlatformOwner = activeRole === 'SuperAdmin' || isSuperAdmin;
  const isSchoolOwner = activeRole === 'OwnerAdmin' || activeRole === 'Admin' || isOwnerAdmin;

  // Selected school for Owner Admin
  const targetSchool = activeSchool || schools[0];

  // Search for Platform Owner
  const [searchQuery, setSearchQuery] = useState('');

  // Replace / Appoint Principal Modal State (for School Owner)
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [newPrincipalName, setNewPrincipalName] = useState('');
  const [newPrincipalEmail, setNewPrincipalEmail] = useState('');
  const [replaceReason, setReplaceReason] = useState('Scheduled administrative rotation & school governance');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtered headteachers for Platform Owner
  const platformHeadteachers = schools.map((sch) => {
    const matchedProfile = userProfiles.find(
      (u) =>
        u.role === 'Principal' &&
        (u.tenantSchoolId === sch.id || u.email.toLowerCase() === sch.principalEmail?.toLowerCase())
    );
    return {
      school: sch,
      principalName: sch.principalName || matchedProfile?.name || 'Dr. Eleanor Vance',
      principalEmail: sch.principalEmail || matchedProfile?.email || 'eleanor.vance@school.edu',
      phone: matchedProfile?.phone || sch.phone,
      appointedAt: sch.createdAt || '2023-08-15',
      status: sch.status === 'Active' ? 'Active' : 'Inactive',
      previousPrincipals: sch.previousPrincipals || [],
    };
  }).filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.principalName.toLowerCase().includes(q) ||
      item.principalEmail.toLowerCase().includes(q) ||
      item.school.name.toLowerCase().includes(q)
    );
  });

  const handleAppointOrReplacePrincipal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrincipalName.trim() || !newPrincipalEmail.trim()) {
      addToast('Please enter both the Principal Name and Email', 'warning');
      return;
    }

    if (!targetSchool) return;

    setIsSubmitting(true);
    try {
      const now = new Date().toISOString().split('T')[0];
      const previousList: PreviousPrincipal[] = [
        ...(targetSchool.previousPrincipals || []),
        {
          id: `prev-${Date.now()}`,
          name: targetSchool.principalName,
          email: targetSchool.principalEmail || `${targetSchool.principalName.toLowerCase().replace(/\s+/g, '.')}@school.edu`,
          appointedAt: targetSchool.createdAt || '2024-01-01',
          replacedAt: now,
          replacedBy: currentUser.name,
          reason: replaceReason,
        },
      ];

      await updateSchool(targetSchool.id, {
        principalName: newPrincipalName.trim(),
        principalEmail: newPrincipalEmail.trim(),
        previousPrincipals: previousList,
      });

      addToast(
        `Headteacher appointed: ${newPrincipalName} is now the Headteacher of ${targetSchool.name}.`,
        'success'
      );
      setIsReplaceModalOpen(false);
      setNewPrincipalName('');
      setNewPrincipalEmail('');
    } catch {
      addToast('Failed to appoint new Headteacher', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#122E52] flex items-center justify-center text-[#F7A914] shadow-lg shrink-0">
            <UserCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3B82F6] dark:text-[#60A5FA] bg-[#122E52]/10 dark:bg-[#1E3A63] px-2.5 py-0.5 rounded-full border border-[#1E3A63]">
                {isPlatformOwner ? 'Platform Administration' : 'School Ownership Oversight'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {isPlatformOwner ? 'Headteacher Accounts' : 'School Headteacher'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              {isPlatformOwner
                ? 'Directory of appointed Headteachers and school leadership accounts across registered schools. The Platform Owner monitors platform integrity and does not manage daily school operations.'
                : 'The School Owner oversees governance and school ownership. Daily school administration (teachers, students, classes, timetables, and academic operations) is managed by the Headteacher.'}
            </p>
          </div>
        </div>

        {/* Governance Demarcation Indicator */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-[#122E52]/20 p-4 rounded-2xl border border-slate-200 dark:border-[#1E3A63] shrink-0">
          <ShieldCheck className="w-5 h-5 text-[#3B82F6] dark:text-[#60A5FA] shrink-0" />
          <div className="text-xs text-[#12233F] dark:text-slate-200">
            <span className="font-bold block">Day-to-day School Administration</span>
            <span className="text-[11px] text-[#3B82F6] dark:text-[#60A5FA]">
              Operated exclusively by the appointed Headteacher
            </span>
          </div>
        </div>
      </div>

      {/* PLATFORM OWNER VIEW */}
      {isPlatformOwner && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search headteacher accounts by name, email, or school..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
              />
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
              {platformHeadteachers.length} Active Headteacher Accounts
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platformHeadteachers.map((item) => (
              <div
                key={item.school.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <UserAvatar
                      name={item.principalName}
                      size="md"
                      rounded="2xl"
                      ring="ring-2 ring-[#F7A914]/40 dark:ring-[#F7A914]/40"
                      status="Active"
                      showStatus
                    />
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> {item.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.principalName}</h3>
                  <p className="text-xs text-[#3B82F6] dark:text-[#60A5FA] font-semibold mt-0.5">
                    Headteacher / Principal
                  </p>

                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                        {item.school.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.principalEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Appointed: {item.appointedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    Students: <strong className="text-slate-700 dark:text-slate-300">{item.school.stats?.totalStudents || 0}</strong>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Teachers: <strong className="text-slate-700 dark:text-slate-300">{item.school.stats?.totalTeachers || 0}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SCHOOL OWNER VIEW */}
      {!isPlatformOwner && (
        <div className="space-y-6">
          {/* Main Headteacher Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                <UserAvatar
                  name={targetSchool.principalName}
                  size="profile"
                  rounded="3xl"
                  ring="ring-4 ring-[#F7A914]/40 dark:ring-[#F7A914]/40/60"
                  status="Active"
                  showStatus
                />
                <div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                    <span className="px-3 py-0.5 rounded-full bg-[#122E52]/10 dark:bg-[#1E3A63] text-[#3B82F6] dark:text-[#60A5FA] text-xs font-bold border border-[#1E3A63]">
                      Chief School Administrator
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5" /> Appointed & Active
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    {targetSchool.principalName}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Institution: <strong className="text-slate-800 dark:text-slate-200">{targetSchool.name}</strong> ({targetSchool.code})
                  </p>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {targetSchool.principalEmail || `${targetSchool.principalName.toLowerCase().replace(/\s+/g, '.')}@school.edu`}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {targetSchool.phone}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      In Office Since: {targetSchool.createdAt || '2023-08-15'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button for School Owner */}
              {isSchoolOwner && (
                <button
                  onClick={() => setIsReplaceModalOpen(true)}
                  className="btn-gold"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Replace / Appoint Headteacher</span>
                </button>
              )}
            </div>

            {/* Operational Domain Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  <UserCheck className="w-4 h-4 text-[#3B82F6]" />
                  <span>Headteacher Operational Responsibilities</span>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside">
                  <li>Teacher appointments, assignments, and faculty coordination</li>
                  <li>Student admissions, classroom rosters, and class teacher nominations</li>
                  <li>Academic timetable scheduling and conflict resolution</li>
                  <li>Official examinations, grading policies, and report cards</li>
                  <li>Official school announcements and notifications</li>
                  <li>Accounts & bursary operational supervision</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#122E52]/20 border border-slate-200 dark:border-[#1E3A63] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#12233F] dark:text-white uppercase tracking-wider">
                  <Building2 className="w-4 h-4 text-[#3B82F6]" />
                  <span>School Owner Governance Scope</span>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside">
                  <li>Institutional ownership, licensing, and accreditation</li>
                  <li>Appointment and performance evaluation of Headteachers</li>
                  <li>Strategic financial oversight, fee policy approvals, and revenue summaries</li>
                  <li>School facility governance, long-term planning, and institutional audits</li>
                  <li>Does NOT conduct daily roll call or enter student exam scores directly</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Historical Record of Previous Principals */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#3B82F6]" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Institutional Leadership History
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                {(targetSchool.previousPrincipals || []).length} Recorded Past Administrations
              </span>
            </div>

            {(!targetSchool.previousPrincipals || targetSchool.previousPrincipals.length === 0) ? (
              <div className="p-6 text-center text-xs text-slate-500">
                <Info className="w-6 h-6 text-slate-400 mx-auto mb-2 opacity-60" />
                No previous Headteacher transitions recorded for this school. {targetSchool.principalName} is the founding administrator.
              </div>
            ) : (
              <div className="space-y-3">
                {targetSchool.previousPrincipals.map((prev) => (
                  <div
                    key={prev.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white text-sm block">
                        {prev.name}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        Email: {prev.email} • Tenured: {prev.appointedAt} to {prev.replacedAt}
                      </span>
                      {prev.reason && (
                        <p className="text-slate-600 dark:text-slate-300 italic mt-1 text-[11px]">
                          Note: "{prev.reason}"
                        </p>
                      )}
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold shrink-0">
                      Replaced by {prev.replacedBy}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Appoint / Replace Headteacher */}
      <Modal
        isOpen={isReplaceModalOpen}
        onClose={() => setIsReplaceModalOpen(false)}
        title="Appoint / Replace School Headteacher"
      >
        <form onSubmit={handleAppointOrReplacePrincipal} className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
            <span className="font-bold block mb-1">Administrative Transition Safeguard:</span>
            Appointing a new Headteacher will transfer primary operational control (teachers, classes, timetables, and academic administration) to the newly appointed leader. The previous Headteacher ({targetSchool.principalName}) will be preserved in institutional leadership audit records.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              New Headteacher Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Dr. Marcus Thorne"
              value={newPrincipalName}
              onChange={(e) => setNewPrincipalName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Official Headteacher Email
            </label>
            <input
              type="email"
              required
              placeholder="e.g., marcus.thorne@school.edu"
              value={newPrincipalEmail}
              onChange={(e) => setNewPrincipalEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Reason / Transition Rationale
            </label>
            <textarea
              rows={3}
              value={replaceReason}
              onChange={(e) => setReplaceReason(e.target.value)}
              placeholder="Provide reason for appointment or governance transition..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsReplaceModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-gold"
            >
              {isSubmitting ? 'Confirming Appointment...' : 'Confirm Headteacher Appointment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
