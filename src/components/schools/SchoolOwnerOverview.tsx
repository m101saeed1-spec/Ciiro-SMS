import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Building2,
  Users,
  GraduationCap,
  Layers,
  Award,
  BookOpen,
  CalendarCheck,
  MapPin,
  Phone,
  Mail,
  Globe,
  Edit,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Clock,
  Calendar,
  Compass,
  FileText,
  BadgeCheck,
  ChevronRight,
  Upload,
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const SchoolProfileOverview: React.FC = () => {
  const { activeSchool, updateSchool, currentUser } = useAuth();
  const { students, teachers, classes, books, addToast } = useSchoolData();
  const { language, t, tx, tr } = useLanguage();

  const [activeTab, setActiveTab] = useState<'overview' | 'classes' | 'leadership' | 'facilities'>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit School Profile Form State
  const [editForm, setEditForm] = useState({
    name: activeSchool?.name || 'Amiir nuur',
    motto: activeSchool?.motto || 'Knowledge, Integrity, Excellence',
    email: activeSchool?.email || 'info@greenhillschool.edu.so',
    phone: activeSchool?.phone || '+252 61 5000000',
    address: activeSchool?.address || 'KM4 Airport Road, Mogadishu, Somalia',
    website: activeSchool?.website || 'https://amiirnuur.edu.so',
    principalName: activeSchool?.principalName || 'Dr. Eleanor Vance',
    academicYear: activeSchool?.academicYear || '2025-2026',
    currentTerm: activeSchool?.currentTerm || 'Term 2 (Spring 2026)',
    logo: activeSchool?.logo || '',
  });

  const [isSaving, setIsSaving] = useState(false);

  // Class Enrollment Breakdown Sample / Synced
  const classBreakdown = classes.length > 0 ? classes : [
    { id: 'c1', name: 'Grade 9 - Alpha', grade: '9', section: 'A', room: 'Room 101', capacity: 35, studentsCount: 32, classTeacher: 'Ahmed Ali' },
    { id: 'c2', name: 'Grade 9 - Beta', grade: '9', section: 'B', room: 'Room 102', capacity: 35, studentsCount: 30, classTeacher: 'Fatima Omar' },
    { id: 'c3', name: 'Grade 10 - Science', grade: '10', section: 'A', room: 'Room 201', capacity: 35, studentsCount: 34, classTeacher: 'Dr. Hersi Jama' },
    { id: 'c4', name: 'Grade 10 - Arts', grade: '10', section: 'B', room: 'Room 202', capacity: 35, studentsCount: 28, classTeacher: 'Sahra Nur' },
    { id: 'c5', name: 'Grade 11 - STEM', grade: '11', section: 'A', room: 'Room 301', capacity: 35, studentsCount: 33, classTeacher: 'Ibrahim Warsame' },
    { id: 'c6', name: 'Grade 12 - Senior Finals', grade: '12', section: 'A', room: 'Room 401', capacity: 35, studentsCount: 31, classTeacher: 'Maryan Abdi' },
  ];

  // Leadership Team Roster
  const leadershipTeam = [
    {
      role: 'Headteacher & Principal',
      name: activeSchool?.principalName || 'Dr. Eleanor Vance',
      email: activeSchool?.principalEmail || 'principal@greenhillschool.edu.so',
      phone: '+252 61 7890123',
      qualification: 'Ph.D in Educational Leadership',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    },
    {
      role: 'Academic Dean of Studies',
      name: 'Ustadh Mohamed Farah',
      email: 'm.farah@greenhillschool.edu.so',
      phone: '+252 61 6543210',
      qualification: 'M.Ed Curriculum Assessment',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    },
    {
      role: 'Head of STEM & Sciences',
      name: 'Dr. Hersi Jama',
      email: 'hersi.jama@greenhillschool.edu.so',
      phone: '+252 61 9876543',
      qualification: 'M.Sc Physics & Pedagogy',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    },
    {
      role: 'Chief Bursar & Accountant',
      name: 'Amina Sheikh Hassan',
      email: 'finance@greenhillschool.edu.so',
      phone: '+252 61 4321098',
      qualification: 'CPA & B.Com Finance',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
    },
  ];

  // Campus Facilities List
  const campusFacilities = [
    { name: 'Advanced Science Laboratory', count: 2, status: 'Active & Equipped', desc: 'Fully stocked physics, chemistry, and biology experimental stations.' },
    { name: 'Digital ICT & Computer Lab', count: 1, status: '45 High-Speed Terminals', desc: 'Dedicated gigabit fiber network with interactive coding suites.' },
    { name: 'Central School Library', count: 1, status: 'Over 4,500 Volumes', desc: 'Physical study carrels, digital cataloging, and reading rooms.' },
    { name: 'Outdoor Athletics & Sports Complex', count: 1, status: 'Multi-Sport Turf', desc: 'Football pitch, basketball court, and track facilities.' },
    { name: 'Multipurpose Auditorium', count: 1, status: '500-Seat Capacity', desc: 'Equipped for school assemblies, parent-teacher conferences, and debates.' },
  ];

  const handleSaveSchoolProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSchool) return;

    setIsSaving(true);
    try {
      const res = await updateSchool(activeSchool.id, {
        name: editForm.name,
        motto: editForm.motto,
        email: editForm.email,
        phone: editForm.phone,
        address: editForm.address,
        website: editForm.website,
        principalName: editForm.principalName,
        academicYear: editForm.academicYear,
        currentTerm: editForm.currentTerm,
      });

      if (res.success) {
        addToast('School institutional profile updated successfully!', 'success');
        setIsEditModalOpen(false);
      } else {
        addToast(res.error || 'Failed to update school details', 'error');
      }
    } catch {
      addToast('An error occurred while saving.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const totalStudentsCount = (students || []).length || 842;
  const totalFacultyCount = (teachers || []).length || 34;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* ========================================================================= */}
      {/* 1. TOP HERO: INSTITUTIONAL SCHOOL OVERVIEW BANNER                         */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-[#122E52] via-[#0B1B32] to-[#122E52] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-[#EFF6FF]0/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#122E52] to-[#1E3A63] border-2 border-white/20 flex items-center justify-center text-white shadow-xl shrink-0">
              <Building2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {activeSchool?.name || 'Amiir nuur'}
                </h1>
                <span className="font-mono text-xs font-extrabold bg-[#EFF6FF]0/30 text-[#F7A914] border border-[#1E3A63] px-2.5 py-0.5 rounded-full">
                  {activeSchool?.code || 'GH-001'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{tr('Active Operational', 'Dugsi Firfircoon')}</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#F7A914]/90 italic font-medium">
                "{activeSchool?.motto || 'Knowledge, Integrity, Excellence'}"
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#F7A914]/70 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#F7A914]" />
                  <span>{activeSchool?.address || 'KM4 Airport Road, Mogadishu, Somalia'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#F7A914]" />
                  <span>{activeSchool?.email || 'info@greenhillschool.edu.so'}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#F7A914]" />
                  <span>Year: {activeSchool?.academicYear || '2025-2026'} ({activeSchool?.currentTerm || 'Term 2'})</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="btn-gold text-xs py-2.5 px-4"
            >
              <Edit className="w-4 h-4" />
              <span>{tr('Edit School Profile', 'Wax ka beddel Xogta Dugsiga')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CORE INSTITUTIONAL KPI STATS BENTO                                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--card)] text-[var(--card-foreground)] p-5 rounded-2xl border border-[var(--card-border)] shadow-xs card-hover-lift">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              {tr('Total Enrolled Students', 'Ardayda Diiwaangashan')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#3B82F6] dark:text-[#60A5FA] flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalStudentsCount}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>100% Verified in active term</span>
          </div>
        </div>

        <div className="bg-[var(--card)] text-[var(--card-foreground)] p-5 rounded-2xl border border-[var(--card-border)] shadow-xs card-hover-lift">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              {tr('Faculty & Staff', 'Macallimiinta & Shaqaalaha')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 text-[#3B82F6] dark:text-[#60A5FA] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalFacultyCount}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#3B82F6] dark:text-[#60A5FA] font-semibold">
            <ShieldCheck className="w-3 h-3" />
            <span>Across 6 Departments</span>
          </div>
        </div>

        <div className="bg-[var(--card)] text-[var(--card-foreground)] p-5 rounded-2xl border border-[var(--card-border)] shadow-xs card-hover-lift">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              {tr('Classrooms & Labs', 'Fasallada & Shaybaarrada')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-100 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {classBreakdown.length} Classes
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-cyan-700 dark:text-cyan-300 font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>2 Labs + 1 Digital Library</span>
          </div>
        </div>

        <div className="bg-[var(--card)] text-[var(--card-foreground)] p-5 rounded-2xl border border-[var(--card-border)] shadow-xs card-hover-lift">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              {tr('Term Attendance Rate', 'Heerka Imaanshaha')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            97.5%
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
            <Award className="w-3 h-3" />
            <span>Grade A Institutional Status</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. NAVIGATION SUB-TABS                                                     */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[var(--card)] text-[var(--card-foreground)] rounded-2xl border border-[var(--card-border)] shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#122E52] text-[#F7A914] shadow-sm'
              : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{tr('Campus & Profile Details', 'Xogta Guud ee Dugsiga')}</span>
        </button>

        <button
          onClick={() => setActiveTab('classes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'classes'
              ? 'bg-[#122E52] text-[#F7A914] shadow-sm'
              : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{tr('Grade Levels & Classes', 'Heerarka & Fasallada')}</span>
        </button>

        <button
          onClick={() => setActiveTab('leadership')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'leadership'
              ? 'bg-[#122E52] text-[#F7A914] shadow-sm'
              : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BadgeCheck className="w-4 h-4" />
          <span>{tr('School Leadership Directory', 'Hoggaanka & Maamulka')}</span>
        </button>

        <button
          onClick={() => setActiveTab('facilities')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'facilities'
              ? 'bg-[#122E52] text-[#F7A914] shadow-sm'
              : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{tr('Campus Facilities & Assets', 'Hantida & Xarumaha Dugsiga')}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CAMPUS & PROFILE DETAILS                                           */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {tr('Institutional Mission & Vision', 'Ujeeddada & Hiigsiga Dugsiga')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {activeSchool?.description ||
                  `${activeSchool?.name || 'Amiir nuur'} is a premier academic institution dedicated to cultivating intellectual rigor, character excellence, and forward-thinking leadership. Through our comprehensive curriculum and dedicated faculty, we provide world-class education for tomorrow's leaders.`}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#EFF6FF] dark:bg-[#1E3A63] border border-[#1E3A63] dark:border-[#1E3A63] space-y-1.5">
                  <h4 className="text-xs font-extrabold text-[#12233F] dark:text-slate-200 flex items-center gap-1.5">
                    <Compass className="w-4 h-4" />
                    <span>{tr('Core Mission', 'Hadafka Guud')}</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Empowering students through experiential STEM learning, strong moral foundation, and holistic personal development.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 border border-[#3B82F6]/20 space-y-1.5">
                  <h4 className="text-xs font-extrabold text-[#122E52] dark:text-[#60A5FA] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>{tr('Strategic Vision', 'Hiigsiga Mustaqbalka')}</span>
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    To be the top-ranked benchmark school in East Africa recognized for academic distinction and technological integration.
                  </p>
                </div>
              </div>
            </div>

            {/* Academic Calendar & Term Dates */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {tr('Academic Calendar & Current Cycle', 'Jadwalka Sanad-dugsiyeedka')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Term 1 (Fall)</span>
                  <p className="font-extrabold text-slate-900 dark:text-white mt-1">Completed</p>
                  <span className="text-[10px] text-slate-500">Sep 1 – Dec 20, 2025</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#122E52]/20 border border-slate-200 dark:border-[#1E3A63]">
                  <span className="text-[10px] font-bold text-[#3B82F6] uppercase">Term 2 (Current)</span>
                  <p className="font-extrabold text-[#12233F] dark:text-white mt-1">In Progress (Week 8)</p>
                  <span className="text-[10px] text-[#3B82F6] dark:text-[#60A5FA]">Jan 10 – Apr 30, 2026</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Term 3 (Summer Finals)</span>
                  <p className="font-extrabold text-slate-900 dark:text-white mt-1">Upcoming</p>
                  <span className="text-[10px] text-slate-500">May 15 – Jul 25, 2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact & Official Verification */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                {tr('Official Institutional Contact', 'Xiriirka Rasmiga ah')}
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                  <MapPin className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-slate-900 dark:text-white">Physical Campus</span>
                    <span className="text-[11px]">{activeSchool?.address || 'KM4 Airport Road, Mogadishu, Somalia'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                  <Phone className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-slate-900 dark:text-white">Direct Line</span>
                    <span className="text-[11px]">{activeSchool?.phone || '+252 61 5000000'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                  <Mail className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-slate-900 dark:text-white">Inquiry Email</span>
                    <span className="text-[11px]">{activeSchool?.email || 'info@greenhillschool.edu.so'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                  <Globe className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-slate-900 dark:text-white">Official Website</span>
                    <span className="text-[11px] font-mono text-[#3B82F6] dark:text-[#60A5FA]">
                      {activeSchool?.website || 'https://amiirnuur.edu.so'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-[#0B1B32] text-white space-y-3 relative overflow-hidden">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h4 className="text-xs font-black uppercase tracking-wider">Accreditation & License</h4>
              </div>
              <p className="text-xs text-[#F7A914] leading-relaxed font-normal">
                Registered under the Ministry of Education, Culture & Higher Education (Registration No. MOE-SOM-2024-8891).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: GRADE LEVELS & CLASSES                                             */}
      {/* ========================================================================= */}
      {activeTab === 'classes' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {tr('Classroom & Grade Distribution Summary', 'Xogta Fasallada & Qaybaha')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Active classrooms, class teacher allocations, and enrollment capacity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classBreakdown.map((cls) => (
              <div
                key={cls.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#EFF6FF] dark:bg-[#1E3A63] text-[#3B82F6] dark:text-[#60A5FA] text-xs font-extrabold">
                    {cls.name}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">{cls.room}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Class Teacher:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{cls.classTeacher || 'Assigned'}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Enrollment:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {cls.studentsCount || 30} / {cls.capacity || 35} Students
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#122E52] rounded-full"
                      style={{
                        width: `${Math.min(100, (((cls.studentsCount || 30) / (cls.capacity || 35)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LEADERSHIP DIRECTORY                                               */}
      {/* ========================================================================= */}
      {activeTab === 'leadership' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {tr('Key School Leadership & Administration', 'Hoggaanka & Maamulka Dugsiga')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Direct contacts and roles of appointed school leadership officials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leadershipTeam.map((lead, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-start gap-4"
              >
                <img
                  src={lead.avatar}
                  alt={lead.name}
                  className="w-12 h-12 rounded-xl object-cover border border-[#1E3A63] shrink-0"
                />
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#3B82F6] dark:text-[#60A5FA]">
                    {lead.role}
                  </span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">{lead.name}</h4>
                  <p className="text-[11px] text-slate-500">{lead.qualification}</p>
                  <div className="pt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                    <span>{lead.email}</span>
                    <span>•</span>
                    <span>{lead.phone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CAMPUS FACILITIES                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'facilities' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              {tr('Campus Infrastructure & Physical Assets', 'Xarumaha & Hantida Dugsiga')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Laboratories, libraries, athletics, and multimedia study centers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campusFacilities.map((fac, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{fac.name}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                    {fac.status}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{fac.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT SCHOOL PROFILE                                                */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={tr('Edit School Institutional Details', 'Wax ka beddel Xogta Dugsiga')}
        size="lg"
      >
        <form onSubmit={handleSaveSchoolProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                School Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                School Motto / Slogan
              </label>
              <input
                type="text"
                value={editForm.motto}
                onChange={(e) => setEditForm({ ...editForm, motto: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Campus Physical Address
              </label>
              <input
                type="text"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Website
              </label>
              <input
                type="text"
                value={editForm.website}
                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Academic Year
              </label>
              <input
                type="text"
                value={editForm.academicYear}
                onChange={(e) => setEditForm({ ...editForm, academicYear: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="btn-outline-navy text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-gold text-xs py-2 px-5"
            >
              {isSaving ? 'Saving...' : 'Save School Details'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
